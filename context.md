# SnackGym 개발 컨텍스트 (Architecture & Rules)

## 1. 기술 스택
- **프론트엔드**: Vite + React (TypeScript) + Tailwind CSS v4 (SPA 아키텍처) + Framer Motion (애니메이션)
- **백엔드/DB**: Firebase Firestore (NoSQL) + Firebase Authentication (Google Auth)
- **배포**: Vercel (snackgym.vercel.app)

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
