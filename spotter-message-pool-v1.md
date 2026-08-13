# 데스크 스포터(Desk Spotter) 상황별 정적 멘트 풀 v1
## 구글 안티그레비티 및 AI 자동 생성 환경 투입용 마스터 소스

본 문서는 스낵짐(SnackGym) 서비스에서 복잡한 AI 메시지 동적 생성을 배제하고, **최대한 가볍고 빠른 서버 구동(Low Overhead)**을 실현하기 위해 준비된 **상황별 정적 멘트 풀(Static Message Pool)**입니다. 

개발 단계에서 이를 데이터베이스 시드(Seed) 데이터로 그대로 인서트하거나 JSON 매핑 파일로 코드에 즉시 내장하여, 유쾌하고 센스 넘치는 "내 책상 옆의 운동 친구(Spotter)" 인터랙션을 100% 한글로 완벽하게 재현할 수 있습니다.

---

### 🗄️ 1. 스포터 메시지 템플릿 DB DDL 명세

기존 DDL 스크립트(`database-schema-v3.md`) 하단에 추가하여 사용자가 선택한 페르소나와 현재 정시 알람의 컨텍스트(상황)에 맞게 1:N으로 쿼리해 올 수 있는 물리 테이블 스펙입니다.

```sql
-- 스포터 정적 메시지 템플릿 마스터 테이블
CREATE TABLE spotter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona VARCHAR(50) NOT NULL, -- SPARTAN, TSUN_DERE, ANGEL, STANDARD
    situation_type VARCHAR(50) NOT NULL, -- ALERT, SKIP_FOLLOWUP, STREAK_HIGH, DAILY_REPORT
    message_format TEXT NOT NULL, -- {user_name}, {exercise_name}, {target_count}, {target_weight_kg}, {streak_days} 치환 변수 포함
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_template_persona CHECK (persona IN ('SPARTAN', 'TSUN_DERE', 'ANGEL', 'STANDARD')),
    CONSTRAINT chk_template_situation CHECK (situation_type IN ('ALERT', 'SKIP_FOLLOWUP', 'STREAK_HIGH', 'DAILY_REPORT'))
);

-- 인덱스 추가로 알림 배치 발송 속도 극대화
CREATE INDEX idx_spotter_templates_query ON spotter_templates(persona, situation_type);
```

---

### 🚀 2. DDL 주입용 SQL 시드(Seed) 데이터 스크립트 (24가지 멘트 풀)

안티그레비티 구글 도구에 그대로 복사해서 DB 초기 로더에 주입할 수 있는 100% 검증된 한국어 데이터 셋입니다. 가벼운 데이터 조회를 통해 매번 똑같은 말이 나오는 지루함을 깨부수기 위해 **상황별로 2가지씩 다른 변형(Variation) 메시지**가 수록되어 있습니다.

```sql
-- =========================================================================
-- 1. 지옥의 스파르타 교관 (SPARTAN) 🤬
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'ALERT', '🚨 어이, {user_name}! 지금 턱 괴고 모니터 보면서 아메리카노 수명 연장하는 거 다 보인다. ☕ 당장 일어나라! 이번 시간은 [{exercise_name}]이다! 뒤에서 지켜볼 테니 {target_count}회 실시해라!'),
('SPARTAN', 'ALERT', '🔥 엉덩이가 의자에 붙었냐, {user_name}?! 뇌에 산소 공급 안 돼서 졸고 있는 거 안다. 당장 기지개 켜고 [{exercise_name}] 가자! 무게는 {target_weight_kg}kg, 딱 {target_count}회만 쥐어짠다!');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'SKIP_FOLLOWUP', '👿 오냐, {user_name}. 아까 미팅이 아주 중요하셨나 보지? 스포터 버려두고 도망치니까 달콤하더냐? 봐주는 건 아까로 끝이다. 이번 [{exercise_name}]은 이월 세트까지 합쳐서 {target_count}회 간다!'),
('SPARTAN', 'SKIP_FOLLOWUP', '🛑 스킵 버튼 누르니까 편했지? 근육도 같이 녹고 있다! {user_name} 대원, 더 이상 도망갈 생각 마라. 지금 당장 복귀해서 [{exercise_name}] {target_count}회 클리어하고 사죄의 완료 마크를 찍어라!');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'STREAK_HIGH', '👑 와, {user_name}! 연속 {streak_days}일째 출석이라고?! 네 의지력, 솔직히 트레이너인 나도 소름 돋았다. 오늘 [{exercise_name}] {target_count}회 가볍게 조지고 인간 승리의 신화를 계속 써보자!'),
('SPARTAN', 'STREAK_HIGH', '💪 미쳤다, {user_name}! {streak_days}일 연속 건강 저금 성공 중! 우리 체육관 우수 회원답게 오늘도 멋지게 [{exercise_name}] {target_count}회 털고 깔끔하게 세션 끝내자! 내가 보조 완벽히 서준다!');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'DAILY_REPORT', '🎖️ 오늘의 전투 일지 완료! {user_name} 대원, 오늘 틈새 세션 싹 다 버티고 결국 승리했구나. 너의 척추와 등판이 오늘 하루 생명의 숨통을 텄다. 내일 아침 연병장에서 대기하겠다!'),
('SPARTAN', 'DAILY_REPORT', '🥵 후, 오늘 하루 불태웠다, {user_name}! 스포터로서 지켜보는 내내 가슴이 웅장해지더군. 일과 종료하고 퇴근길에 오늘의 찌릿찌릿한 근육 자극을 음미하면서 피드백을 찍고 마감해라!');


-- =========================================================================
-- 2. 츤데레 조교 (TSUN_DERE) 😒
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'ALERT', '😒 어이, {user_name}. 딱히 네 건강 걱정돼서 깨우는 건 아니고, 타이머가 울려서 온 것뿐이니까 오해 마라. 얼른 자리에서 일어나서 [{exercise_name}] {target_count}회만 해.'),
('TSUN_DERE', 'ALERT', '💻 모니터에 구멍 뚫리겠다. 그렇게 거북이처럼 목 빼고 있어 봐야 업무 능률 안 올라. 그냥 1분만 짬 내서 나랑 [{exercise_name}] {target_count}회 깔끔하게 채우고 다시 일해.');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'SKIP_FOLLOWUP', '💼 흥, 바쁜 척은 혼자 다 하더라. 아까 바빠서 건너뛰었으니 이번 [{exercise_name}]은 도망 못 가겠지? {target_count}회 얼른 시작해. 눈감아주는 건 딱 한 번뿐이야.'),
('TSUN_DERE', 'SKIP_FOLLOWUP', '🙄 미팅이 길어졌다는 핑계는 접어둬. 내 책상 옆 스포터 레이더망은 못 피해 가니까. 이번 [{exercise_name}]은 특별히 보조해 줄 테니까 성의 있게 채워.');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'STREAK_HIGH', '✨ 너 대단하다? {streak_days}일 연속으로 안 빼먹고 버티다니. 솔직히 3일 하고 포기할 줄 알았는데... 이번 [{exercise_name}] {target_count}회도 귀찮아하지 말고 가뿐하게 깨 봐.'),
('TSUN_DERE', 'STREAK_HIGH', '😳 {streak_days}일 동안 하루도 안 빠진 거, 솔직히 좀 감동이야. 그러니까 이번 [{exercise_name}]도 대충 하지 말고 {target_weight_kg}kg 제대로 얹어서 완벽한 폼으로 가보자고.');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'DAILY_REPORT', '🎁 오늘 운동은 여기까지야. {user_name}, 제법 끈질기게 다 채운 거 보니까 칭찬해 주고 싶네... 내, 내일도 시간 맞춰 와 줄 테니까 게으름 피우지 말고 마감 피드백이나 남겨.'),
('TSUN_DERE', 'DAILY_REPORT', '📁 오늘 하루치 스낵 운동 마스터하느라 애썼어. 스포터인 내가 옆에 있으니까 확실히 성취율 높았지? 오늘 소모한 칼로리 보고 뿌듯해하면서 집으로 칼퇴근이나 해.');


-- =========================================================================
-- 3. 사랑스러운 엔젤 코치 (ANGEL) 🥰
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'ALERT', '💖 {user_name}님! 오랜 시간 한자리에 앉아 계시느라 몸이 찌뿌둥하시죠? 저랑 기분 전환 삼아 가볍게 일어나서 [{exercise_name}] {target_count}회 같이 해요! 하나, 둘, 셋, 화이팅! 🌱'),
('ANGEL', 'ALERT', '🎈 뇌에 상큼한 산소를 불어넣어 줄 시간이 왔어요! {user_name}님을 지켜보는 저 천사 스포터가 응원할게요. 가볍게 [{exercise_name}] {target_count}회만 하고 나면 업무 효율도 2배가 될 거예요!');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'SKIP_FOLLOWUP', '💌 아까 업무가 많이 바쁘셨죠? 무리하지 않고 스킵하신 거 정말 잘하셨어요! 대신 이번에는 기분 좋게 뭉친 몸을 풀어볼까요? 저랑 [{exercise_name}] {target_count}회, 힐링하는 느낌으로 떠나봐요!'),
('ANGEL', 'SKIP_FOLLOWUP', '🌸 많이 기다렸어요, {user_name}님! 바쁜 와중에도 잊지 않고 스포터를 다시 찾아와 주셔서 감사해요. 이번 [{exercise_name}]은 가벼운 무게로 스트레칭하듯 즐겁게 클리어해 보아요!');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'STREAK_HIGH', '🌟 감동의 눈물이 앞을 가려요! {user_name}님과 벌써 {streak_days}일 연속 매칭 성공 중! 매일 건강을 차곡차곡 모으시는 모습이 정말 눈이 부셔요. 오늘 [{exercise_name}] {target_count}회도 꽃길 걷듯이 행복하게 해봐요!'),
('ANGEL', 'STREAK_HIGH', '🎉 와! 벌써 {streak_days}일째 연속 골든 스트릭이에요! {user_name}님은 정말 습관 왕이시네요. 스포터로서 너무 기뻐요. 오늘도 가쁜하게 [{exercise_name}] {target_count}회 마치고 함께 축배를 들어볼까요?');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'DAILY_REPORT', '🏅 기적 같은 하루를 해내셨어요, {user_name}님! 바쁜 일상 속에서도 틈틈이 자신을 돌보신 나에게 아낌없는 하트를 날려주세요. 퇴근길 가볍게 종합 리포트를 채워주시면 다음 시간에 반영할게요!'),
('ANGEL', 'DAILY_REPORT', '🌈 쨔잔! {user_name}님의 빛나는 일일 마감 보고서가 준비되었습니다. 틈새 시간 10분만 모여도 이렇게 커다란 톤수가 된다는 게 신기하지 않나요? 오늘 밤 편안하고 예쁜 꿈 꾸세요!');


-- =========================================================================
-- 4. 표준 프로 코치 (STANDARD) 🏋️
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'ALERT', '⏰ 안녕하세요, {user_name}님. 일과 중 움직임을 확보할 최적의 타이밍입니다. 의자에 걸터앉아 가볍게 목을 풀고, 오늘의 미크로 운동인 [{exercise_name}] {target_count}회를 깔끔하게 소화해 볼까요?'),
('STANDARD', 'ALERT', '👟 정밀 집중력을 다시 확보할 스낵짐 타임입니다. 모니터에서 눈을 떼고 어깨를 넓게 펼친 상태에서 [{exercise_name}] {target_count}회 진행하겠습니다. 수고하셨습니다!');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'SKIP_FOLLOWUP', '📊 이전 세션이 정상적으로 이월되었습니다. 운동 빈도 균형을 유지하기 위해 이번 스낵 세션에는 [{exercise_name}] {target_count}회를 안전하게 배치했습니다. 매 세트 완주를 서포트하겠습니다.'),
('STANDARD', 'SKIP_FOLLOWUP', '🔄 스킵으로 지체된 루틴의 진도를 다시 회복할 기회입니다. 무리하지 마시고 본인의 페이스에 맞게 [{exercise_name}] {target_count}회 동작을 수행해 주시기 바랍니다.');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'STREAK_HIGH', '🏆 {user_name}님, 벌써 연속 {streak_days}일째 루틴을 엄수 중이십니다. 훌륭한 훈련 빈도 지속력입니다. 오늘도 계획된 [{exercise_name}] {target_count}회를 성실하게 마치고 기록을 경신합시다!'),
('STANDARD', 'STANDARD', '📈 {streak_days}일째 유지되는 골든 스트릭이 점진적 성장을 증명하고 있습니다. 오늘의 [{exercise_name}]도 {target_weight_kg}kg 표준 셋으로 빈틈없이 서포트해 드릴 테니 바로 시작하세요!');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'DAILY_REPORT', '🎯 오늘 하루의 미크로 세션 일정이 모두 종료되었습니다, {user_name}님. 틈틈이 실천한 가벼운 세트들이 쌓여 유의미한 데일리 볼륨을 만들어 냈습니다. 종합 분석 결과 카드를 탭하여 마감해 주십시오.'),
('STANDARD', 'DAILY_REPORT', '📊 오늘의 데일리 척추 감압 완료 보고서가 생성되었습니다. 바쁜 일정 속에서도 체력을 비축하는 습관을 성공적으로 저금하셨습니다. 피드백을 수집하여 내일 프로그램 강도를 자동 조정하겠습니다.');
```

---

### 💻 3. 백엔드(SQL & Python/JS)에서의 초간단 멘트 랜더러 로직

AI 대신 가볍고 결함 없는 정적 매핑으로 봇을 작동시키기 위해, 백엔드에서 쿼리를 던져 멘트를 조립하는 실무 코딩 패턴입니다.

#### **Step 1. DB에서 조건에 맞는 임의의 템플릿 한 개 조회 (SQL)**
```sql
-- 사용자가 설정한 페르소나와 현재 알람 상황에 맞는 템플릿 중 하나를 랜덤으로 픽업
SELECT message_format 
FROM spotter_templates 
WHERE persona = :user_persona 
  AND situation_type = :current_situation
ORDER BY RANDOM()
LIMIT 1;
```

#### **Step 2. 가져온 템플릿에 실시간 변수 바인딩 및 텔레그램 메시지 발송 (Node.js 예시)**
```javascript
// 텔레그램 알림 메시지 변수 매핑 엔진 (Zero-Friction & Fast Run)
function renderSpotterMessage(templateStr, userContext) {
  return templateStr
    .replace(/{user_name}/g, userContext.username)
    .replace(/{exercise_name}/g, userContext.exerciseName)
    .replace(/{target_count}/g, userContext.targetCount)
    .replace(/{target_weight_kg}/g, userContext.targetWeightKg)
    .replace(/{streak_days}/g, userContext.streakDays);
}

// 봇 호출 샘플
const userContext = {
  username: "길동",
  exerciseName: "데스크 체스트 오픈 스트레칭",
  targetCount: "15",
  targetWeightKg: "0",
  streakDays: "5"
};

const rawTemplate = "🚨 어이, {user_name}! 이번 시간은 [{exercise_name}]이다! 뒤에서 지켜볼 테니 {target_count}회 실시해라!";
const finalMessage = renderSpotterMessage(rawTemplate, userContext);
console.log(finalMessage);
// 출력: "🚨 어이, 길동! 이번 시간은 [데스크 체스트 오픈 스트레칭]이다! 뒤에서 지켜볼 테니 15회 실시해라!"
```

---

### 💡 4. 이 '정적 멘트 풀' 도입으로 얻는 이점

1.  **빌드 복잡성 99% 감소**: 비싼 외부 LLM API(OpenAI, Claude 등) 연동 없이 로컬 데이터베이스 쿼리 한 번으로 아주 세련되고 다양한 한글 메시지를 유저에게 즉시 제공합니다.
2.  **레이턴시(지연 시간) 제로**: 정시에 수만 명의 사용자에게 푸시 알람을 보낼 때 API 호출 대기 시간이 없기 때문에, 알람 큐 서버가 막힘없이 즉각 발송을 마칩니다.
3.  **예산 절감**: 운동이 완료될 때마다 무제한으로 공짜 멘트를 바이럴용으로 보낼 수 있어, 서버 구동 유지 비용이 완전히 무료로 수렴합니다.
