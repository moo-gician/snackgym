# SnackGym 개발 컨텍스트 (Architecture & Rules)

## 기술 스택
- **프론트엔드**: Vite + React (TypeScript) + Tailwind CSS (SPA 아키텍처)
- **백엔드**: Firebase Firestore (Database) + Cloud Functions (Backend Logic) + Cloud Tasks (Job Queue) + Firebase Authentication (Auth)
- **배포 (Deployment)**: 프론트엔드는 Vercel을 통해 글로벌 에지 네트워크에 배포하여 빠른 로딩 보장. 백엔드는 Firebase 서버리스 활용.

## 데이터베이스 스키마 (Firestore NoSQL)
- **이중 아키텍처 (1MB 제한 방어 및 요금 최적화)**
  - `users/{userId}`: 유저 프로필, `next_notification_time`, `telegram_chat_id` 등
  - `daily_workout_sessions/{userId}_{YYYYMMDD}`: 하루 합산 통계 (총 소모 칼로리, 누적 세션 수 등 1차 데이터)
  - `daily_workout_sessions/{docId}/logs/{logId}`: 상세 운동 수행 이력 및 텔레그램 메시지 로그 서브 컬렉션 (무제한 확장 대비용 2차 데이터)

## 알림 아키텍처 (이벤트 기반 스케줄링)
- **State-based Dispatch (상태 기반)**: 유저 이벤트 발생 시 Firestore 유저 문서의 `next_notification_time` 필드만 업데이트.
- **스로틀링 (Throttling)**: 대규모 알람 시 텔레그램 초당 30건 API 리밋 방어를 위해 Cloud Tasks 디스패처에 스로틀링 로직 필수 구현.

## 보안 규칙
- **텔레그램 Bot API 격리**: 브라우저 클라이언트에서 텔레그램 API 직접 호출 금지. 100% Cloud Functions를 거쳐야 함.
- **토큰 은닉**: Bot Token은 반드시 Firebase Secret Manager를 통해 환경 변수로 주입.
- **OTP Handshake**: 텔레그램 봇 매핑(디프링크) 시 구글 Auth 유저임을 증명하는 5분 만료 일회성 해시 토큰 필수 생성 및 검증.

## [Version History]
- **v0.1.0** (2026-08-12): Initial deployment — Landing page (Summer Forest Morning theme, English copy) + Google Auth + Firebase Firestore initialized. Deployed via Vercel + GitHub (habitmon-app-v1 project).
