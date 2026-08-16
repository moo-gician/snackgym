# B.E.A.S.T. 개발 컨텍스트 (Architecture & Rules)

## 1. 기술 스택
- **프론트엔드**: Vite + React (TypeScript) + Tailwind CSS v4 (SPA 아키텍처) + Framer Motion (애니메이션)
- **백엔드/DB**: Firebase Firestore (NoSQL) + Firebase Authentication (Google Auth)
- **배포**: Vercel (snackgym.vercel.app)
- **테마**: B.E.A.S.T. 300 Dark Theme (abyss, charcoal, bronze, blood)

---

## 2. 핵심 UX 결정 사항 (2026-08-15 확정)

### 마찰 제로 (Zero Friction) 철학
1. **일일 1회 피드백 (Progressive Overload)**: 매 세션 수동 스피너 조작을 없애고, 퇴근길 대시보드에서 딱 1번 "쉬움/적당/어려움"을 묻고 시스템이 내일 중량을 자동 조절함.
2. **부분 완료 및 전체 스킵**: 바쁠 땐 세션의 1개만 체크하고 조기 종료 가능. 미체크 또는 스킵한 운동은 상태 동결(Status Quo) 처리되며, "Skip Rate" 통계로 누적.
3. **폴백(Fallback) 방어**: 선택한 기구와 부위가 매칭되지 않을 시, 백그라운드에 상시 켜져 있는 '맨몸'으로 자동 대체.
4. **스누즈(Snooze)**: 연차/공휴일에 알림을 끄고 싶다면 대시보드의 `[오늘 알림 끄기]` 토글 한 번으로 해결.

### 텔레그램 연동 아키텍처
- **일방향(Outbound Only) 알림**: 웹앱 세션 딥링크가 담긴 스포터 메시지 발송.
- **연동 딥링크**: `t.me/SnackGymBot?start=uid` 방식을 사용하여 핀 번호 입력 마찰 제거. 이메일 또는 알림 끄기 대안도 제공.
- **스포터 멘트**: 스파르타, 츤데레, 엔젤 3종.

---

## 3. 데이터베이스 스키마 (Firestore NoSQL)

### `users/{uid}`
```ts
{
  uid, displayName, email, photoURL, createdAt,
  onboardingComplete: boolean,
  is_active: boolean,           // Soft Delete (회원 탈퇴 처리용)
  equipment: string[],          // ['bodyweight', 'dumbbell', ...] (bodyweight는 상시 포함)
  targetMuscles: string[],
  course_length: number,        // 1(Micro), 3(Compact), 6(Short Circuit)
  work_start_time: string,      // '09:00'
  work_end_time: string,        // '18:00'
  spotter: 'spartan' | 'tsundere' | 'angel',
  notification_method: 'telegram' | 'email' | 'none',
  telegram_chat_id: string | null,
  snooze_until: Timestamp | null, // 당일 알림 끄기용
}
```

---

## [Version History]
- **v0.1.0** (2026-08-12): Initial MVP Landing page + Google Auth deployed.
- **v1.0.0** (2026-08-15): PRD 7차 최종 컨펌 완료 (피드백 팝업, 스킵 동결, 소프트 딜리트, 스누즈 확정). Phase 3 진입.
- **v1.2.0** (2026-08-15): Phase 3-6 완료. 프론트엔드 전체 UI(온보딩, 대시보드, 세션) 및 파이어베이스 백엔드(Soft Delete, Cloud Functions 텔레그램 봇) Vercel 배포 트리거.
- **v1.3.0** (2026-08-15): B.E.A.S.T. 300 Dark Theme 리팩토링 적용 완료 (디자인/카피 교체 및 랜딩페이지 라우팅 수정).
- **v1.4.0** (2026-08-15): Stitch AI에서 추출한 Iron & Ichor 디자인 시스템 연동 및 신규 Landing Page 화면 이식 완료.
- **v1.5.0** (2026-08-15): Stitch AI의 Onboarding 6개 단계 및 Dashboard 화면 이식 완료 (네오-브루탈리즘 UI 전면 적용).
- **v1.6.0** (2026-08-16): Dynamic Split & Custom Exercise Pool 알고리즘 (Armory Onboarding & Session Generation) 통합 완료.
- **v1.6.1** (2026-08-16): Split Strategy 필터링 및 할당 로직 버그 픽스, Armory UI 스크롤 개선 및 세션 당 운동 개수 시간 기준 현실화(1분/개).
- **v1.6.2** (2026-08-16): Onboarding Bottom Nav 이탈 시 자동 저장(Auto-save) 로직 구현 및 과금 최적화(단일 Write 패턴) 검증 완료.
- **v1.7.0** (2026-08-16): Achievement 탭 고도화. Daily/Weekly/Monthly 데이터 분리, Spoils UI 3열 확장, Rank 및 Streak UI 2분할 컴팩트화 완료.
