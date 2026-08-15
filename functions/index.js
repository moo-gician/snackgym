const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// 스포터 멘트 풀 (간소화 버전)
const SPOTTER_MESSAGES = {
  SPARTAN: "🤬 Hey lazy ass! Get up right now. Time's up.",
  TSUNDERE: "😒 Ugh... so annoying. It's time, just do this already.",
  ANGEL: "🥰 Hey there! It's time to workout~ Let's start lightly at your desk!"
};

/**
 * 1. Telegram Webhook Handler
 * 웹앱 온보딩 완료 시 넘어오는 /start {uid} 파라미터를 파싱하여
 * Firestore users/{uid} 문서에 telegram_chat_id를 매핑합니다.
 */
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const update = req.body;
  if (!update || !update.message) {
    return res.status(200).send("OK");
  }

  const chatId = update.message.chat.id;
  const text = update.message.text;

  // Handle deep link: /start {uid}
  if (text && text.startsWith("/start ")) {
    const uid = text.split(" ")[1];
    if (uid) {
      try {
        // 1) Update Firestore with chat ID
        await db.collection("users").doc(uid).update({
          telegram_chat_id: chatId.toString(),
          is_active: true
        });
        
        // 2) Get user's preferred spotter for welcome message
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        const spotterType = userData?.spotter || "SPARTAN";
        
        let message = SPOTTER_MESSAGES[spotterType] + "\n\n🤝 Successfully connected! You can now return to the web dashboard.";

        // 3) Send Welcome Message via Telegram API
        const botToken = process.env.TELEGRAM_BOT_TOKEN || functions.config().telegram?.token;
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message })
          });
        }
      } catch (e) {
        console.error("Error linking user:", e);
      }
    }
  }

  // Always return 200 to Telegram
  res.status(200).send("OK");
});

/**
 * 2. Alarm Dispatcher (MVP: Cron-based polling)
 * 매시간 정각/30분에 돌면서 알림을 보내야 할 유저를 찾습니다.
 * (본격적인 Cloud Tasks 예약 로직은 v2에서 적용하며, MVP는 PubSub 스케줄러를 활용)
 */
exports.alarmDispatcher = functions.pubsub.schedule("*/30 * * * *").onRun(async (context) => {
  console.log("Running scheduled alarm dispatcher");
  
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || functions.config().telegram?.token;
    if (!botToken) {
      console.error("Telegram bot token not configured.");
      return null;
    }

    const now = new Date();
    // 활성화되어 있고, 텔레그램 아이디가 있고, 스누즈가 현재 시간 이전인 유저만 필터링
    const usersSnapshot = await db.collection("users")
      .where("is_active", "==", true)
      .where("notificationMethod", "==", "telegram")
      .get();

    const dispatchPromises = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const chatId = userData.telegram_chat_id;
      
      const userTz = userData.timezone || "America/New_York";
      
      // 스누즈(Snooze) 체크 로직
      if (userData.snooze_until) {
        let snoozeDate;
        if (typeof userData.snooze_until.toDate === 'function') {
          snoozeDate = userData.snooze_until.toDate();
        } else {
          snoozeDate = new Date(userData.snooze_until);
        }
        if (now < snoozeDate) return; // 아직 스누즈 중
      }

      // 요일(Active Days) 체크 로직
      if (userData.activeDays && Array.isArray(userData.activeDays)) {
        const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: userTz, weekday: 'short' });
        const weekdayStr = dayFormatter.format(now);
        const dayMapping = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
        const localDayNum = dayMapping[weekdayStr];
        
        if (!userData.activeDays.includes(localDayNum)) {
          return; // 오늘은 활성화된 요일이 아님
        }
      }

      if (chatId) {
        const spotterType = userData.spotter || "SPARTAN";
        const message = SPOTTER_MESSAGES[spotterType] + `\n\n👉 [Start Session]\nhttps://snackgym.vercel.app/session/auto-${Date.now()}`;
        
        // 텔레그램 발송 (단순화: 실제 프로덕션에선 초당 30건 스로틀링 큐 필요)
        const sendReq = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: message })
        }).catch(err => console.error("Send error:", err));

        dispatchPromises.push(sendReq);
      }
    });

    await Promise.all(dispatchPromises);
    console.log(`Dispatched ${dispatchPromises.length} alarms.`);
  } catch (error) {
    console.error("Dispatcher error:", error);
  }
  
  return null;
});
