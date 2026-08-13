# 데이터베이스 물리 스키마 정의서 v3
## 대상 DBMS: PostgreSQL 18+

본 스펙은 바이브 코딩(Vibe Coding)을 위한 세밀한 데이터베이스 스키마 정의서입니다. AI 코드 생성기가 외래 키(FK) 관계를 명확히 해석하고, 데이터 무결성 제약 조건을 기반으로 에러 없는 비즈니스 로직을 자동으로 구현하도록 최적화되었습니다.

### ⚠️ 물리 아키텍처 규칙
1.  **lowercase_snake_case**: 모든 테이블명, 컬럼명, 관계 식별자는 소문자 스네이크 케이스를 엄격히 준수합니다.
2.  **Primary Key (UUIDv7)**: 분산 클라이언트 생성 및 시간순 정렬 고성능 인덱싱을 지원하기 위해 모든 마스터/트랜잭션 테이블의 기본 키는 `UUID` 타입을 사용하며 기본값으로 `UUIDv7`을 권장합니다.
3.  **Large Log Tables (BIGINT)**: 단기 폭증 트래픽의 누적 운동 기록을 담는 `workout_logs` 테이블의 기본 키는 `BIGINT GENERATED ALWAYS AS IDENTITY`를 활용하여 극도의 인서트 속도를 확보합니다.
4.  **Database-Level Constraints (SELF-DOCUMENTING)**: `NOT NULL`, `UNIQUE`, `CHECK` 제약 조건을 데이터베이스 물리 수준에 삽입하여 AI 엔진이 검증 규칙 코드를 100% 자동 추출하도록 에스코트합니다.

---

### DDL SQL 스크립트 명세

```sql
-- 1. EXTENSION 설정 (PostgreSQL 내 UUID 지원)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 사용자 정보 및 정기 알람 설정 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 내부적으로 UUIDv7 기본 권장
    telegram_chat_id BIGINT UNIQUE NOT NULL, -- 텔레그램 고유 채널 ID (메시지 발송 필수 값)
    username VARCHAR(100),
    weight_kg NUMERIC(5,2) NOT NULL DEFAULT 70.00, -- 실시간 칼로리 연동 계산을 위한 필수 체중 데이터 (기본값 70kg)
    work_start_time TIME NOT NULL DEFAULT '09:00:00', -- 정시 알림 시작 시간
    work_end_time TIME NOT NULL DEFAULT '18:00:00', -- 정시 알림 마감 시간
    notification_interval_hours INT NOT NULL DEFAULT 2, -- 알림 간격 (1 = 하이템포, 2 = 미들템포, 4 = 로우템포 등)
    notification_persona VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- SPARTAN, TSUN_DERE, ANGEL, STANDARD
    current_cycle_day INT NOT NULL DEFAULT 1, -- 달력 없는 순환 인덱스 (Day A = 1, Day B = 2 등)
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- 푸시 정지 여부
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_interval CHECK (notification_interval_hours IN (1, 2, 4)),
    CONSTRAINT chk_persona CHECK (notification_persona IN ('SPARTAN', 'TSUN_DERE', 'ANGEL', 'STANDARD'))
);

-- [알림] F-3 패시브 부상 방지 구현으로 인해 기존 'user_injured_body_parts' 테이블은 완벽히 제거되었습니다.
-- 사용자가 그림자 바디맵에서 선택하지 않은 부위는 'user_active_exercises'에 존재하지 않으므로 패시브하게 자동 필터링됩니다.

-- 3. 운동 기구 마스터 테이블
CREATE TABLE equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- DUMBBELL, PULLUP_BAR, BARBELL, BENCH, PARALLEL_BARS 등 12가지 기구 + BODYWEIGHT(맨몸/맨손)
    is_selectable_by_user BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 부위별 운동 마스터 테이블 (실시간 칼로리 연동 수식 포함)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL, -- 턱걸이, 테이블 락, 독수리 팔 자세 등
    body_part VARCHAR(50) NOT NULL, -- CHEST, BACK, SHOULDERS, TRICEPS, BICEPS, ABS, LEGS
    movement_type VARCHAR(20) NOT NULL, -- PUSH, PULL, CORE, LEGS
    exercise_format VARCHAR(20) NOT NULL DEFAULT 'REPS', -- REPS(근력계열), DURATION(스트레칭계열 정적 버티기)
    base_calories_per_rep NUMERIC(6,4) NOT NULL DEFAULT 0.3000, -- 표준 70kg 체중 기준 1회당 소모 칼로리 상수
    base_calories_per_second NUMERIC(6,4) NOT NULL DEFAULT 0.0400, -- 표준 70kg 체중 기준 1초당 소모 칼로리 상수 (정적 스트레칭용)
    instruction_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_body_part CHECK (body_part IN ('CHEST', 'BACK', 'SHOULDERS', 'TRICEPS', 'BICEPS', 'ABS', 'LEGS')),
    CONSTRAINT chk_movement_type CHECK (movement_type IN ('PUSH', 'PULL', 'CORE', 'LEGS')),
    CONSTRAINT chk_exercise_format CHECK (exercise_format IN ('REPS', 'DURATION'))
);

-- 5. 운동 기구 요건 매핑 테이블 (M:N 관계 해소)
CREATE TABLE exercise_equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_exercise_equipment UNIQUE (exercise_id, equipment_id)
);

-- 6. 유저별 현재 사내 체육관 보유 기구 설정 테이블
CREATE TABLE user_equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_equipment UNIQUE (user_id, equipment_id)
);

-- 7. 유저가 그림자 바디맵에서 선택하여 점등 완료한 실제 수행 대상 활성 운동 테이블
CREATE TABLE user_active_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    target_weight_kg NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- 기본 시작 목표 중량 (0 = 맨몸)
    target_reps INT NOT NULL DEFAULT 10, -- 기본 시작 목표 횟수 (또는 스트레칭 버티기 초)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_active_exercise UNIQUE (user_id, exercise_id),
    CONSTRAINT chk_target_reps CHECK (target_reps > 0)
);

-- 8. 일일 스마트 세션 관리 테이블 (건너뛰기, 마감 피드백 제어)
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 오늘 날짜
    sessions_completed_today INT NOT NULL DEFAULT 0, -- 오늘 완료 체크한 누적 횟수 (자정 인덱스 전진 판단 기준)
    sessions_skipped_today INT NOT NULL DEFAULT 0, -- 오늘 이번만 스킵(⏭️)을 누른 횟수
    daily_global_feedback VARCHAR(20), -- 하루 한 번 퇴근 시 종합 피드백: EASY, NORMAL, HARD
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_daily_session UNIQUE (user_id, session_date),
    CONSTRAINT chk_global_feedback CHECK (daily_global_feedback IN ('EASY', 'NORMAL', 'HARD'))
);

-- 9. 유저별 세션 실시간 운동 상세 로급 테이블 (BIGINT PK 적용)
CREATE TABLE workout_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 대용량 로그 특화 기본 키
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 실제 스낵 운동을 완료 체크한 시간
    performed_weight_kg NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- 실제 수행 무게
    performed_reps_or_seconds INT NOT NULL, -- 실제 완료한 횟수(Reps) 또는 스트레칭 초(Seconds)
    is_skipped_session BOOLEAN NOT NULL DEFAULT FALSE, -- 스킵 여부
    calories_burned NUMERIC(6,2) NOT NULL DEFAULT 0.00, -- [자동 계산 적재] 실시간 연동되어 기록된 소모 칼로리량
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- 11. 스포터 메시지 템플릿 마스터 테이블 (상황별/페르소나별 한글 멘트 풀 보관용)
CREATE TABLE spotter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona VARCHAR(50) NOT NULL, -- SPARTAN, TSUN_DERE, ANGEL, STANDARD
    situation_type VARCHAR(50) NOT NULL, -- ALERT, SKIP_FOLLOWUP, STREAK_HIGH, DAILY_REPORT
    message_format TEXT NOT NULL, -- 변수 {user_name}, {exercise_name}, {target_count}, {streak_days} 등이 내포된 마크다운 문자열
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_template_persona CHECK (persona IN ('SPARTAN', 'TSUN_DERE', 'ANGEL', 'STANDARD')),
    CONSTRAINT chk_template_situation CHECK (situation_type IN ('ALERT', 'SKIP_FOLLOWUP', 'STREAK_HIGH', 'DAILY_REPORT'))
);

-- 12. 멘트 마크다운 포맷 조회 속도 극대화를 위한 다중 컬럼 결합 인덱스
CREATE INDEX idx_spotter_templates_query ON spotter_templates(persona, situation_type);

-- 10. 고성능 조회를 위한 물리 인덱스 설정
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, session_date);
CREATE INDEX idx_user_active_exercises_lookup ON user_active_exercises(user_id);
```
