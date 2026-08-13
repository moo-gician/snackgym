# SnackGym 태스크 백로그 (TODO)

## Phase 1: MVP 구현
- [ ] **프로젝트 세팅 (Frontend & Backend)**
  - [ ] Vite + React (TypeScript) + Tailwind CSS 기반 웹앱 보일러플레이트 세팅
  - [ ] Firebase(Firestore, Cloud Functions, Auth) 프로젝트 초기화 및 환경 변수 구성
- [ ] **웹앱 UI 및 인증 구현**
  - [ ] 미션(약문통원해자)이 반영된 랜딩페이지 퍼블리싱
  - [ ] 구글 Auth 로그인 연동 (랜딩페이지 진입점)
  - [ ] 온보딩 (보유 기구 및 부위 선택) 화면 구현
  - [ ] 카드 뒤집기(Flip) 방식의 싱글 뷰 듀얼 바디 맵 UI 개발
- [ ] **텔레그램 봇 연동 & 보안**
  - [ ] 텔레그램 Bot API 셋업 및 토큰 Secret Manager 격리
  - [ ] OTP Handshake: 웹앱에서 OTP 토큰 생성 -> 디프링크 파라미터 전달 -> Cloud Functions에서 토큰 검증 및 유저 매핑
- [ ] **Firestore 데이터 아키텍처**
  - [ ] 이중 아키텍처 구성: 당일 합산 통계는 `daily_workout_sessions`에, 상세 로그는 `logs` 서브 컬렉션에 저장하는 CRUD 로직
  - [ ] 유저 이벤트 발생 시 `next_notification_time` 갱신 로직 구현
- [ ] **Cloud Tasks 스로틀링 알람 디스패처**
  - [ ] `next_notification_time` 기반 단일 큐 배치 워커 설계
  - [ ] 텔레그램 API 전송 제한 방어를 위한 속도 제한 스로틀링(Throttling Queue) 알고리즘 구현
- [ ] **E2E 테스트 시나리오**
  - [ ] 타인의 OTP 토큰 임의 변경 시 텔레그램 계정 하이재킹 차단 테스트
  - [ ] 대규모 알람 발송 시 Cloud Tasks 스로틀링 지연 발송 테스트

## Phase 2: Capacitor 래핑 (Future)
- [ ] Capacitor 설치 및 웹앱 네이티브 패키징
- [ ] 로컬 푸시 알림(Local Notification) 플러그인 연동 및 텔레그램 서버 리스 구조 전환
