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

## Phase 3: 온보딩 단계별 UI/UX 컴포넌트 개발 (완료)
- [x] Step 0: Landing & Auth (면책 조항 텍스트 추가)
- [x] Step 1: Equipment (장비 체크박스 그리드)
- [x] Step 2: BodyMap (전/후면 3D 플립 카드 및 SVG 인터랙션)
- [x] Step 3: SessionCourse & Time (코스 + 출퇴근/횟수 스피너 동시 선택 UI)
- [x] Step 4: Spotter (3인의 스포터 페르소나 선택 UI)
- [x] Step 5: 알림 매체 선택 (Telegram 딥링크 / Email / 인앱 스킵 옵션)
- [x] Step 6: PWA 유도 및 웰컴 멘트

## Phase 4: Firebase Auth 및 백엔드 스키마 구축 (완료)
- [x] 텔레그램 연동 시 `?start=uid` 딥링크 매핑
- [x] `completeOnboarding` 시 Firestore `users` 하위에 데이터 저장
- [x] 설정(⚙️) 창에 계정 탈퇴(`is_active=false` Soft Delete) 기능 구현

## Phase 5: 대시보드 및 리텐션 방어 MVP 구현 (완료)
- [x] Dashboard UI: '지금 바로 1분 스낵하기 ⚡' (자율 세션) 및 고정 웰컴 멘트
- [x] Dashboard UI: 사내 메신저 클립보드 복사(자랑하기 3인칭 텍스트) 버튼
- [x] Dashboard UI: 공휴일/연차 알림 끄기 (Snooze 💤) 토글
- [x] Dashboard UI: 퇴근길 일일 1회 난이도 피드백 (Progressive Overload 바텀시트)
- [x] Session UI: 마찰 제로 체크리스트 및 애니메이션 (Confetti, 취소선)
- [x] Session UI: 전체 스킵 및 조기 종료 버튼 연동

---

## Phase 6: 텔레그램 봇 & 알람 엔진 (백엔드 로직) (완료)
- [x] Bot Token → Firebase Secret Manager 등록
- [x] Cloud Tasks 알람 디스패처 (스누즈 상태 확인 후 발송)
- [x] Telegram API 스로틀링 큐 (초당 30건 제한 방어)

## Phase 7: 네이티브 앱 및 스토어 런칭 (장기 플랜)
- [ ] PWA 기반 코드를 Capacitor 또는 React Native로 패키징
- [ ] Google Play: 12인 14일 폐쇄 테스트 진행 (품앗이 커뮤니티 활용)
- [ ] Google Play: Android 16 (API 36) AAB 빌드 제출
- [ ] Apple App Store: 앱 심사용 데모 계정(우회 로그인) 구축
- [ ] Apple App Store: 개인정보 처리방침 및 데이터 영양성분 라벨 작성
- [ ] 공통: SEO / GEO 최적화 (`llms.txt` 배포) 및 마케팅 에셋 등록
