import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '../lib/auth'
import { auth } from '../lib/firebase'

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  
  const user = auth.currentUser;

  const handleLogin = async () => {
    if (auth.currentUser) {
      const isOnboarded = sessionStorage.getItem('is_onboarded') === 'true';
      navigate(isOnboarded ? '/dashboard' : '/onboarding');
      return;
    }
    
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard');
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-abyss)] text-[var(--color-ash)]">
      {/* Background glow circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-blood) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-5%] left-[-8%] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-bronze) 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {['🔥', '⚔️', '🩸', '🛡️', '⚡'].map((leaf, i) => (
        <span key={i} className="absolute opacity-20 animate-float" style={{
          left: `${10 + i * 20}%`,
          top: `${20 + (i % 3) * 20}%`,
          animationDuration: `${4 + i}s`,
          animationDelay: `${i * 0.5}s`,
          fontSize: `${1 + i * 0.2}rem`
        }}>{leaf}</span>
      ))}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💀</span>
          <span className="text-xl font-display font-bold tracking-widest text-[var(--color-bone)]">B.E.A.S.T.</span>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="px-5 py-2.5 rounded-none text-sm font-bold uppercase tracking-wider text-[var(--color-abyss)] bg-[var(--color-bronze)] hover:bg-yellow-600 transition-colors"
        >
          {loading ? 'Entering Hell...' : user ? 'Return to Camp →' : 'Grab the Iron →'}
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-charcoal)] border border-[var(--color-blood)] border-opacity-30 rounded-none text-sm font-medium mb-8 text-[var(--color-blood)]">
            <span>⚠️</span>
            <span className="uppercase tracking-widest font-bold">What's in you?</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-6 animate-fade-in-up delay-100 uppercase tracking-tight text-[var(--color-bone)]">
          Blood. Sweat.<br />
          <span className="text-[var(--color-blood)]">Iron.</span>
        </h1>

        <p className="text-lg md:text-xl leading-relaxed mb-10 animate-fade-in-up delay-200">
          The 3 PM crash is a battlefield. Don't surrender to your screen.<br />
          Prove your grit, grab the iron, and let a single, heavy set reignite your blood.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-none text-[var(--color-abyss)] bg-[var(--color-blood)] hover:bg-red-700 font-display font-bold text-xl uppercase tracking-widest transition-all w-full sm:w-auto justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--color-abyss)"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--color-abyss)"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="var(--color-abyss)"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--color-abyss)"/>
            </svg>
            {loading ? 'Forging...' : user ? 'Resume Assault' : 'Enter the Arena'}
          </button>
        </div>
        
        <p className="mt-6 text-xs animate-fade-in-up delay-400 opacity-50">
          By continuing, you agree to our <strong>[Terms of Service and Injury Waiver]</strong>.<br/>You assume all responsibility for any injuries incurred while performing exercises.
        </p>
      </section>

      {/* Feature Highlight */}
      <section className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <div className="bg-[var(--color-charcoal)] border-l-4 border-[var(--color-blood)] p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 text-9xl leading-none font-display text-[var(--color-blood)] translate-x-4 -translate-y-4">300</div>
          <p className="text-4xl mb-4 relative z-10">⚔️</p>
          <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 uppercase text-[var(--color-bone)] relative z-10">
            No Quotas.<br/><span className="text-[var(--color-blood)]">Just Carnage.</span>
          </h3>
          <p className="text-lg text-[var(--color-ash)] relative z-10 max-w-2xl mx-auto">
            Drop the heavy expectations and complex workout trackers.<br/>
            When your desk spotter calls, hit the office gym, execute a flawless micro-session, and conquer the rest of your day.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 mt-10 relative z-10">
            {[['⚠️', 'Brutal Alarms'], ['🩸', 'Max Effort Sets'], ['🛡️', 'Spartan Glory']].map(([emoji, label]) => (
              <div key={label as string} className="flex flex-col items-center gap-2">
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-bronze)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 text-center px-6 py-16">
        <h2 className="text-4xl md:text-5xl font-display uppercase font-black mb-4 text-[var(--color-bone)]">
          Stop faking your rest. 💀
        </h2>
        <p className="text-lg mb-8 text-[var(--color-ash)] max-w-2xl mx-auto">
          Chugging another cold brew or doomscrolling won't save you. Real energy isn't poured from a cup—it’s forged under tension. Wake up your nervous system and get your blood pumping.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-none text-[var(--color-abyss)] bg-[var(--color-bronze)] hover:bg-yellow-600 font-display font-bold text-2xl uppercase tracking-widest transition-all"
        >
          <span>🔥</span>
          {loading ? 'Forging...' : user ? 'Enter the Battlefield' : 'Unleash the Beast'}
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs text-[var(--color-ash)] uppercase tracking-widest opacity-50">
        <p>© 2026 B.E.A.S.T. · No Retreat, No Surrender</p>
      </footer>
    </div>
  )
}
