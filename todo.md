# SnackGym 태스크 백로그 (TODO)

## Phase 1: MVP 구현 (완료)
- [x] Vite + React (TypeScript) + Tailwind CSS v4 보일러플레이트 세팅
- [x] Firebase Auth + Firestore 초기화 및 연동
- [x] 미션 기반 랜딩페이지 퍼블리싱 (영어, Summer Forest Morning 테마)
- [x] 구글 로그인 연동 (Firebase Auth)
- [x] Vercel 배포 연동 (snackgym.vercel.app)
- [x] OnboardingPage 5단계 상태 관리(State Machine) 훅 및 라우팅 작성
- [x] 페이지 새로고침 시 이탈 방지를 위한 `sessionStorage` 연동

---

## Phase 3: 온보딩 단계별 UI/UX 컴포넌트 개발 (진행 중)
- [ ] Step 0: Landing & Auth (면책 조항 텍스트 추가)
- [ ] Step 1: Equipment (장비 체크박스 그리드)
- [ ] Step 2: BodyMap (전/후면 3D 플립 카드 및 SVG 인터랙션)
- [ ] Step 3: SessionCourse & Time (코스 + 출퇴근/횟수 스피너 동시 선택 UI)
- [ ] Step 4: Spotter (3인의 스포터 페르소나 선택 UI)
- [ ] Step 5: 알림 매체 선택 (Telegram 딥링크 / Email / 인앱 스킵 옵션)
- [ ] Step 6: PWA 유도 및 웰컴 멘트

## Phase 4: Firebase Auth 및 백엔드 스키마 구축
- [ ] 텔레그램 연동 시 `?start=uid` 딥링크 매핑
- [ ] `completeOnboarding` 시 Firestore `users` 하위에 데이터 저장
- [ ] 설정(⚙️) 창에 계정 탈퇴(`is_active=false` Soft Delete) 기능 구현

## Phase 5: 대시보드 및 리텐션 방어 MVP 구현
- [ ] Dashboard UI: '지금 바로 1분 스낵하기 ⚡' (자율 세션) 및 고정 웰컴 멘트
- [ ] Dashboard UI: 사내 메신저 클립보드 복사(자랑하기 3인칭 텍스트) 버튼
- [ ] Dashboard UI: 공휴일/연차 알림 끄기 (Snooze 💤) 토글
- [ ] Dashboard UI: 퇴근길 일일 1회 난이도 피드백 (Progressive Overload 바텀시트)
- [ ] Session UI: 마찰 제로 체크리스트 및 애니메이션 (Confetti, 취소선)
- [ ] Session UI: 전체 스킵 및 조기 종료 버튼 연동

---

## Phase 6: 텔레그램 봇 & 알람 엔진 (백엔드 로직)
- [ ] Bot Token → Firebase Secret Manager 등록
- [ ] Cloud Tasks 알람 디스패처 (스누즈 상태 확인 후 발송)
- [ ] Telegram API 스로틀링 큐 (초당 30건 제한 방어)

## Phase 7: 네이티브 앱 및 런칭
- [ ] PWA 최적화 및 앱스토어 준비
- [ ] SEO / GEO 최적화 (`llms.txt` 배포)
