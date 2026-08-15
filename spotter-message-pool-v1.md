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
    message_format TEXT NOT NULL, -- {user_name}, {muscles}, {streak_days}, {session_url} 치환 변수 포함
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
('SPARTAN', 'ALERT', '🚨 어이, {user_name}! 지금 턱 괴고 모니터 보면서 졸고 있는 거 안다. 당장 기지개 켜고 체육관으로 가라! 오늘 루틴은 [{muscles}]이다! \n👉 [세션 시작하기] {session_url}'),
('SPARTAN', 'ALERT', '🔥 엉덩이가 의자에 붙었냐, {user_name}?! 뇌에 산소 공급 안 돼서 조는 꼴 못 본다. 오늘 [{muscles}] 털러 빨리 링크 누르고 진입해라! \n👉 [운동 드루가기] {session_url}');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'SKIP_FOLLOWUP', '👿 오냐, {user_name}. 아까 미팅 때문에 알람 무시하고 도망치니까 달콤하더냐? 봐주는 건 아까로 끝이다. 미뤄둔 [{muscles}] 세션 얄짤없이 간다! \n👉 [사죄의 클릭] {session_url}'),
('SPARTAN', 'SKIP_FOLLOWUP', '🛑 근육이 녹고 있다! {user_name} 대원, 더 이상 바쁘다는 핑계 대지 마라. 지금 당장 복귀해서 [{muscles}] 세션 클리어하고 와라! \n👉 [즉시 실행] {session_url}');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'STREAK_HIGH', '👑 와, {user_name}! 연속 {streak_days}일째 출석이라고?! 네 의지력, 솔직히 트레이너인 나도 소름 돋았다. 오늘 [{muscles}]도 가볍게 조지고 인간 승리 써보자! \n👉 [왕좌로 가기] {session_url}'),
('SPARTAN', 'STREAK_HIGH', '💪 미쳤다, {user_name}! {streak_days}일 연속 건강 저금 성공 중! 우리 체육관 우수 회원답게 오늘도 멋지게 [{muscles}] 세션 털러 가자! \n👉 [기록 경신] {session_url}');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('SPARTAN', 'DAILY_REPORT', '🎖️ 오늘의 전투 일지 완료! {user_name} 대원, 오늘 틈새 세션 싹 다 버티고 승리했구나. 척추와 등판이 생명의 숨통을 텄다. 성과 확인해라! \n👉 [일지 보기] {session_url}'),
('SPARTAN', 'DAILY_REPORT', '🥵 후, 오늘 하루 불태웠다, {user_name}! 스포터로서 지켜보는 내내 가슴이 웅장해지더군. 오늘의 총 볼륨과 칼로리 보고 뿌듯하게 퇴근해라! \n👉 [성과 대시보드] {session_url}');


-- =========================================================================
-- 2. 츤데레 조교 (TSUN_DERE) 😒
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'ALERT', '😒 어이, {user_name}. 딱히 네 건강 걱정돼서 알람 보낸 건 아니고, 시간이 돼서 보낸 것뿐이야. 오해 말고 얼른 [{muscles}] 하러 링크나 눌러. \n👉 [마지못해 누르기] {session_url}'),
('TSUN_DERE', 'ALERT', '💻 모니터에 구멍 뚫리겠다. 그렇게 거북이처럼 있어 봐야 능률 안 올라. 그냥 1분만 짬 내서 나랑 [{muscles}]이나 풀자. \n👉 [세션 진입] {session_url}');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'SKIP_FOLLOWUP', '💼 흥, 아까는 바쁜 척 알람 무시하더니. 이번 미뤄둔 [{muscles}] 세션은 도망 못 가. 얼른 시작해. 눈감아주는 건 아까뿐이야. \n👉 [변명 말고 시작] {session_url}'),
('TSUN_DERE', 'SKIP_FOLLOWUP', '🙄 미팅 핑계는 접어둬. 내 스포터 레이더망은 못 피해 가니까. 미뤄둔 [{muscles}] 징징대지 말고 성의 있게 채워. \n👉 [세션 켜기] {session_url}');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'STREAK_HIGH', '✨ 너 대단하다? {streak_days}일 연속으로 안 빼먹고. 솔직히 3일 하고 포기할 줄 알았는데... 이번 [{muscles}]도 귀찮아하지 말고 가뿐하게 깨 봐. \n👉 [스트릭 잇기] {session_url}'),
('TSUN_DERE', 'STREAK_HIGH', '😳 {streak_days}일 동안 안 빠진 거, 솔직히 좀 감동이야. 그러니까 이번 [{muscles}]도 대충 하지 말고 제대로 폼 잡고 해봐. \n👉 [바로 입장] {session_url}');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('TSUN_DERE', 'DAILY_REPORT', '🎁 오늘 운동은 여기까지야. {user_name}, 제법 끈질기게 한 거 보니까 칭찬해주고 싶네. 내일도 시간 맞춰 와 줄 테니까 대시보드나 확인해. \n👉 [대시보드 보기] {session_url}'),
('TSUN_DERE', 'DAILY_REPORT', '📁 오늘 하루치 스낵 운동 마스터하느라 애썼어. 내가 옆에 있으니까 성취율 높았지? 소모한 칼로리 보고 뿌듯해하면서 칼퇴나 해. \n👉 [결과 확인] {session_url}');


-- =========================================================================
-- 3. 사랑스러운 엔젤 코치 (ANGEL) 🥰
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'ALERT', '💖 {user_name}님! 오랜 시간 앉아 계시느라 몸이 찌뿌둥하시죠? 저랑 기분 전환 삼아 가볍게 [{muscles}] 세션 같이 해요! 화이팅! 🌱 \n👉 [상쾌하게 시작] {session_url}'),
('ANGEL', 'ALERT', '🎈 뇌에 상큼한 산소를 불어넣어 줄 시간이에요! {user_name}님을 저 천사 스포터가 응원할게요. 가볍게 [{muscles}] 풀고 오면 능률 2배! \n👉 [세션 열기] {session_url}');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'SKIP_FOLLOWUP', '💌 아까 업무가 바쁘셨죠? 알람 무시하고 집중하신 거 정말 잘하셨어요! 이제 미뤄둔 [{muscles}] 세션으로 기분 좋게 뭉친 몸을 풀어볼까요? \n👉 [기지개 켜기] {session_url}'),
('ANGEL', 'SKIP_FOLLOWUP', '🌸 얌전히 기다렸어요, {user_name}님! 바쁜 와중에도 다시 돌아와 주셔서 감사해요. 미뤄진 [{muscles}] 세션 힐링하듯 즐겁게 클리어해보아요! \n👉 [힐링 세션 가기] {session_url}');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'STREAK_HIGH', '🌟 감동의 눈물이 앞을 가려요! {user_name}님과 벌써 {streak_days}일 연속 매칭 성공 중! 오늘 [{muscles}] 세션도 꽃길 걷듯이 행복하게 해봐요! \n👉 [행복 운동하기] {session_url}'),
('ANGEL', 'STREAK_HIGH', '🎉 와! 벌써 {streak_days}일째 연속 골든 스트릭이에요! {user_name}님은 정말 습관 왕이시네요. 오늘도 가뿐하게 [{muscles}] 마치고 축배를 들어요! \n👉 [기록 세우러 가기] {session_url}');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('ANGEL', 'DAILY_REPORT', '🏅 기적 같은 하루를 해내셨어요, {user_name}님! 바쁜 일상 속에서도 틈틈이 자신을 돌보신 나에게 아낌없는 하트를 날려주세요! \n👉 [오늘의 성과 보기] {session_url}'),
('ANGEL', 'DAILY_REPORT', '🌈 쨔잔! {user_name}님의 빛나는 일일 성과 리포트가 준비되었어요. 틈새 시간 10분만 모여도 이렇게 커다란 결과가 된다는 게 신기하죠? \n👉 [리포트 열어보기] {session_url}');


-- =========================================================================
-- 4. 표준 프로 코치 (STANDARD) 🏋️
-- =========================================================================

-- 일반 정시 정기 알림 (ALERT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'ALERT', '⏰ 안녕하세요, {user_name}님. 일과 중 움직임을 확보할 최적의 타이밍입니다. 의자에 걸터앉아 가볍게 목을 풀고, 오늘의 [{muscles}] 세션을 진행해 볼까요? \n👉 [세션 진입하기] {session_url}'),
('STANDARD', 'ALERT', '👟 정밀 집중력을 다시 확보할 스낵짐 타임입니다. 모니터에서 눈을 떼고 어깨를 넓게 펼친 상태에서 [{muscles}] 루틴을 소화하겠습니다. \n👉 [프로그램 시작] {session_url}');

-- 직전 세션 스킵(Skip) 후 돌아왔을 때의 알림 (SKIP_FOLLOWUP)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'SKIP_FOLLOWUP', '📊 이전 세션이 정상적으로 이월되었습니다. 훈련 빈도 균형을 유지하기 위해 이번 스낵 세션에는 미뤄진 [{muscles}] 루틴을 안전하게 배치했습니다. \n👉 [이월 세션 시작] {session_url}'),
('STANDARD', 'SKIP_FOLLOWUP', '🔄 지체된 루틴의 진도를 다시 회복할 기회입니다. 무리하지 마시고 본인의 페이스에 맞게 [{muscles}] 세션을 수행해 주시기 바랍니다. \n👉 [루틴 재개하기] {session_url}');

-- 연속 성공 스트릭이 높을 때 응원 알림 (STREAK_HIGH)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'STREAK_HIGH', '🏆 {user_name}님, 벌써 연속 {streak_days}일째 루틴을 엄수 중이십니다. 훌륭한 지속력입니다. 오늘도 계획된 [{muscles}] 세션을 성실하게 마칩시다! \n👉 [루틴 유지하기] {session_url}'),
('STANDARD', 'STREAK_HIGH', '📈 {streak_days}일째 유지되는 골든 스트릭이 점진적 성장을 증명하고 있습니다. 오늘의 [{muscles}] 루틴도 빈틈없이 서포트해 드리겠습니다. \n👉 [기록 이어가기] {session_url}');

-- 일일 종합 보고서 헤더 (DAILY_REPORT)
INSERT INTO spotter_templates (persona, situation_type, message_format) VALUES
('STANDARD', 'DAILY_REPORT', '🎯 오늘 하루의 일정이 모두 종료되었습니다, {user_name}님. 틈틈이 실천한 가벼운 세트들이 쌓여 유의미한 데일리 볼륨을 만들어 냈습니다. \n👉 [종합 분석 확인] {session_url}'),
('STANDARD', 'DAILY_REPORT', '📊 오늘의 데일리 척추 감압 완료 보고서가 생성되었습니다. 바쁜 일정 속에서도 체력을 비축하는 습관을 성공적으로 저금하셨습니다. \n👉 [보고서 조회] {session_url}');
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
    .replace(/{muscles}/g, userContext.muscles)
    .replace(/{streak_days}/g, userContext.streakDays)
    .replace(/{session_url}/g, userContext.sessionUrl);
}

// 봇 호출 샘플
const userContext = {
  username: "길동",
  muscles: "가슴 & 이두",
  streakDays: "5",
  sessionUrl: "https://snackgym.vercel.app/session/abc123"
};

const rawTemplate = "🚨 어이, {user_name}! 오늘 루틴은 [{muscles}]이다! \n👉 [세션 시작하기] {session_url}";
const finalMessage = renderSpotterMessage(rawTemplate, userContext);
console.log(finalMessage);
// 출력: "🚨 어이, 길동! 오늘 루틴은 [가슴 & 이두]이다! \n👉 [세션 시작하기] https://snackgym.vercel.app/session/abc123"
```

---

### 💡 4. 이 '정적 멘트 풀' 도입으로 얻는 이점

1.  **빌드 복잡성 99% 감소**: 비싼 외부 LLM API(OpenAI, Claude 등) 연동 없이 로컬 데이터베이스 쿼리 한 번으로 아주 세련되고 다양한 한글 메시지를 유저에게 즉시 제공합니다.
2.  **레이턴시(지연 시간) 제로**: 정시에 수만 명의 사용자에게 푸시 알람을 보낼 때 API 호출 대기 시간이 없기 때문에, 알람 큐 서버가 막힘없이 즉각 발송을 마칩니다.
3.  **예산 절감**: 운동이 완료될 때마다 무제한으로 공짜 멘트를 바이럴용으로 보낼 수 있어, 서버 구동 유지 비용이 완전히 무료로 수렴합니다.
