import { useState } from 'react'
import { signInWithGoogle } from '../lib/auth'

const missionSteps = [
  {
    label: '약속',
    en: 'Promise',
    emoji: '🌿',
    text: '알람이 울리면 사내 체육관으로. 펌핑된 근육과 기분 좋은 에너지로 책상에 돌아옵니다.',
  },
  {
    label: '문제',
    en: 'Problem',
    emoji: '😮‍💨',
    text: '거창한 목표를 채워야 한다는 부담감이 운동을 시작조차 못하게 만듭니다.',
  },
  {
    label: '통념',
    en: 'Wisdom',
    emoji: '💡',
    text: '직장인에게 필요한 건 억지로 채우는 목표가 아니라 스트레스 없는 가벼운 환기입니다.',
  },
  {
    label: '원인',
    en: 'Cause',
    emoji: '🔍',
    text: '운동을 포기한 이유는 완벽하게 해내야 한다는 압박감이 당신을 짓눌렀기 때문입니다.',
  },
  {
    label: '해법',
    en: 'Solution',
    emoji: '⚡',
    text: '할당량 부담 제로. 루틴을 고르고, 알람이 울리면 한 세트 즐기고 버튼 하나만 누르면 끝.',
  },
  {
    label: '자각',
    en: 'Awakening',
    emoji: '🌅',
    text: '짧은 시간 기분 좋게 땀 흘리고 활력을 얻어 업무 효율이 극대화되는 일상을 즐기세요.',
  },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #E8F5E9 0%, #F8FAF8 40%, #E0F7FA 100%)' }}>
      {/* 배경 장식 원 */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3CCF4E 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-5%] left-[-8%] w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #189AB4 0%, transparent 70%)' }} />

      {/* 파티클 이모지 */}
      {['🌿', '🍃', '✨', '🌱', '🍀'].map((leaf, i) => (
        <span key={i} className="leaf" style={{
          left: `${10 + i * 20}%`,
          animationDuration: `${8 + i * 3}s`,
          animationDelay: `${i * 2}s`,
          fontSize: `${0.8 + i * 0.2}rem`
        }}>{leaf}</span>
      ))}

      {/* 네비게이션 */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏋️</span>
          <span className="text-xl font-bold" style={{ color: '#1A2E1A' }}>SnackGym</span>
        </div>
        <button
          id="nav-login-btn"
          onClick={handleLogin}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white btn-cta"
        >
          {loading ? '연결 중...' : '시작하기 →'}
        </button>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative z-10 text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8"
            style={{ color: '#2BA83A' }}>
            <span>🌿</span>
            <span>사무실 탈출 프로젝트</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 animate-fade-in-up delay-100">
          <span className="animate-shimmer">Pump Up</span>
          <br />
          <span style={{ color: '#1A2E1A' }}>Your Energy</span>
        </h1>

        <p className="text-lg md:text-xl leading-relaxed mb-10 animate-fade-in-up delay-200"
          style={{ color: '#4A6741' }}>
          알람 한 번으로 체육관에서 짧게 펌핑하고<br />
          상쾌한 에너지로 책상에 돌아오는 직장인의 루틴
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <button
            id="hero-google-login-btn"
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg btn-cta animate-glow-pulse w-full sm:w-auto justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity="0.9"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity="0.9"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" fillOpacity="0.8"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" fillOpacity="0.9"/>
            </svg>
            {loading ? '연결 중...' : 'Google로 무료 시작'}
          </button>
        </div>

        <p className="mt-4 text-sm animate-fade-in-up delay-400" style={{ color: '#7A9E7A' }}>
          가입 비용 없음 · 할당량 없음 · 부담 없음 🌱
        </p>
      </section>

      {/* 미션 스텝 카드 */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-12 animate-fade-in-up delay-200"
          style={{ color: '#1A2E1A' }}>
          왜 <span style={{ color: '#3CCF4E' }}>스낵짐</span>인가요?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {missionSteps.map((step, i) => (
            <div
              key={step.label}
              className={`mission-card glass-card rounded-2xl p-6 animate-fade-in-up`}
              style={{ animationDelay: `${0.1 * (i + 1)}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {step.emoji}
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: '#3CCF4E' }}>{step.en}</span>
                  <p className="text-base font-bold" style={{ color: '#1A2E1A' }}>{step.label}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#4A6741' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 피처 하이라이트 */}
      <section className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <div className="glass-card rounded-3xl p-8 text-center">
          <p className="text-4xl mb-4">🏃‍♂️</p>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#1A2E1A' }}>
            알람 → 운동 → 완료, <span style={{ color: '#3CCF4E' }}>3단계 끝</span>
          </h3>
          <p className="text-base" style={{ color: '#4A6741' }}>
            텔레그램 알람이 울리면 체육관으로. 한 세트 마치고 버튼 하나만 누르면<br />
            기록은 자동 저장, 에너지는 MAX.
          </p>
          <div className="flex justify-center gap-8 mt-8">
            {[['🔔', '스마트 알람'], ['💪', '세트 기록'], ['🔥', '연속 달성']].map(([emoji, label]) => (
              <div key={label as string} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <span className="text-sm font-medium" style={{ color: '#4A6741' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="relative z-10 text-center px-6 py-16">
        <h2 className="text-3xl font-black mb-4" style={{ color: '#1A2E1A' }}>
          지금 바로, 사무실을 탈출하세요 🌲
        </h2>
        <p className="text-base mb-8" style={{ color: '#4A6741' }}>
          할당량은 없습니다. 딱 한 세트만 즐기고 돌아오면 됩니다.
        </p>
        <button
          id="footer-google-login-btn"
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl btn-cta"
        >
          <span>🌿</span>
          {loading ? '연결 중...' : 'Google로 무료 시작하기'}
        </button>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 text-center pb-8 text-xs" style={{ color: '#7A9E7A' }}>
        <p>© 2026 SnackGym · Pump Up Your Energy</p>
      </footer>
    </div>
  )
}
