import { useState } from 'react'
import { signInWithGoogle } from '../lib/auth'

const missionSteps = [
  {
    label: 'Promise',
    emoji: '🌿',
    text: 'When the alarm rings, head to the gym. Return to your desk pumped up with fresh energy and a clear mind.',
  },
  {
    label: 'Problem',
    emoji: '😮‍💨',
    text: 'The pressure of hitting a big workout quota stops you from even starting. Sound familiar?',
  },
  {
    label: 'Wisdom',
    emoji: '💡',
    text: "What office workers really need isn't a heavy goal to grind — it's a no-stress energy reset.",
  },
  {
    label: 'Cause',
    emoji: '🔍',
    text: "You quit because the pressure to do it perfectly crushed your motivation before you even laced up.",
  },
  {
    label: 'Solution',
    emoji: '⚡',
    text: 'Zero quota pressure. Pick a routine, enjoy one set when the alarm fires, tap Done — that\'s it.',
  },
  {
    label: 'Awakening',
    emoji: '🌅',
    text: 'Stop chasing targets. Start enjoying short, energizing sessions that make you better at your job.',
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
      {/* Background glow circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3CCF4E 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-5%] left-[-8%] w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #189AB4 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {['🌿', '🍃', '✨', '🌱', '🍀'].map((leaf, i) => (
        <span key={i} className="leaf" style={{
          left: `${10 + i * 20}%`,
          animationDuration: `${8 + i * 3}s`,
          animationDelay: `${i * 2}s`,
          fontSize: `${0.8 + i * 0.2}rem`
        }}>{leaf}</span>
      ))}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏋️</span>
          <span className="text-xl font-bold" style={{ color: '#1A2E1A' }}>B.E.A.S.T.</span>
        </div>
        <button
          id="nav-login-btn"
          onClick={handleLogin}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white btn-cta"
        >
          {loading ? 'Connecting...' : 'Get Started →'}
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8"
            style={{ color: '#2BA83A' }}>
            <span>🌿</span>
            <span>Your office escape plan</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 animate-fade-in-up delay-100">
          <span className="animate-shimmer">Pump Up</span>
          <br />
          <span style={{ color: '#1A2E1A' }}>Your Energy</span>
        </h1>

        <p className="text-lg md:text-xl leading-relaxed mb-10 animate-fade-in-up delay-200"
          style={{ color: '#4A6741' }}>
          One alarm. A quick pump at the office gym.<br />
          Back to your desk refreshed and firing on all cylinders.
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
            {loading ? 'Connecting...' : 'Continue with Google — Free'}
          </button>
        </div>
        
        <p className="mt-4 text-xs animate-fade-in-up delay-400 opacity-70" style={{ color: '#4A6741' }}>
          By continuing, you agree to our <strong>[Terms of Service and Injury Waiver]</strong>.<br/>You assume all responsibility for any injuries incurred while performing exercises guided by this app.
        </p>

        <p className="mt-4 text-sm animate-fade-in-up delay-400" style={{ color: '#7A9E7A' }}>
          No signup fee · No quotas · No pressure 🌱
        </p>
      </section>

      {/* Mission Steps */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-12 animate-fade-in-up delay-200"
          style={{ color: '#1A2E1A' }}>
          Why <span style={{ color: '#3CCF4E' }}>B.E.A.S.T.</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {missionSteps.map((step, i) => (
            <div
              key={step.label}
              className="mission-card glass-card rounded-2xl p-6 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (i + 1)}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {step.emoji}
                </span>
                <p className="text-base font-bold" style={{ color: '#1A2E1A' }}>{step.label}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#4A6741' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <div className="glass-card rounded-3xl p-8 text-center">
          <p className="text-4xl mb-4">🏃‍♂️</p>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#1A2E1A' }}>
            Alarm → Lift → Done. <span style={{ color: '#3CCF4E' }}>Three steps. That's all.</span>
          </h3>
          <p className="text-base" style={{ color: '#4A6741' }}>
            A Telegram alert fires. You hit the gym. Finish a set, tap the button —<br />
            your session is logged and your energy is maxed out.
          </p>
          <div className="flex justify-center gap-8 mt-8">
            {[['🔔', 'Smart Alarm'], ['💪', 'Set Tracking'], ['🔥', 'Daily Streak']].map(([emoji, label]) => (
              <div key={label as string} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <span className="text-sm font-medium" style={{ color: '#4A6741' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 text-center px-6 py-16">
        <h2 className="text-3xl font-black mb-4" style={{ color: '#1A2E1A' }}>
          Step away from the office. Just one set. 🌲
        </h2>
        <p className="text-base mb-8" style={{ color: '#4A6741' }}>
          No quotas. No pressure. Just enjoy one set and come back better.
        </p>
        <button
          id="footer-google-login-btn"
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl btn-cta"
        >
          <span>🌿</span>
          {loading ? 'Connecting...' : 'Start Free with Google'}
        </button>
        <p className="mt-4 text-xs opacity-70" style={{ color: '#4A6741' }}>
          By continuing, you agree to our [Terms of Service and Injury Waiver].
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs" style={{ color: '#7A9E7A' }}>
        <p>© 2026 B.E.A.S.T. · No Retreat, No Surrender</p>
      </footer>
    </div>
  )
}
