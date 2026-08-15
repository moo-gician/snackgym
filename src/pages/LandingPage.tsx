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
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-abyss)] text-[var(--color-ash)] font-sans flex flex-col">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--color-abyss)]/90 backdrop-blur-xl border-b border-[var(--color-bronze)]/20">
        <div className="h-16 px-6 max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://lh3.googleusercontent.com/aida/AP1WRLvL3hsJ2y4za4DRON2I13kxqT-k84HauYfDzQw6W6u3cozHNVsMbONuPLoKkpVT9dK2a1_u0uo5vksj3dc0-FFdlJ-HgueDt5Cr7wA0Nbke59Hpo54CjjZVI1U9V7fLylSFWlbOuYQr89qYPV01DmM5z23_uMNsQEX5cTcUVnv7nVqkVilcjqh6NlXdPTs3E1aAlwUkt9IGCc1g546aHK--oY8-vDnNFeA2ALgnjZJX0QPTTSslf65rvyo" alt="BEAST Logo" className="w-8 h-8 object-contain rounded-sm drop-shadow-[0_0_8px_rgba(200,154,81,0.5)]" />
            <span className="font-display font-bold text-xl uppercase tracking-widest text-[var(--color-bronze)]">B.E.A.S.T.</span>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-10 h-10 rounded-none border border-[var(--color-bronze)] bg-[var(--color-abyss)] flex items-center justify-center shadow-[0_0_10px_rgba(200,154,81,0.2)] hover:bg-[var(--color-charcoal)] transition-colors"
          >
            <span className="text-xl leading-none opacity-80 hover:opacity-100">⚔️</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full relative pt-16">
        {/* Hero Section */}
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-end px-6 pb-24 pt-16">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-cover bg-top bg-no-repeat border-b border-[var(--color-bronze)]/30" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuYqZC1aoFbz0Y8r-fW67HW8hAQ11A98HDm2piHhnNm2-kLaX3Mz66Qtv_gtaqPf8sl5gARe5MA3NefkqouGx0JHh_E-4irJgSQxYbnzZg5nh0KiVuM9z8w0z577CEzpyw3GqnQ4CcKzucYFHaxIPW6-mrbX92nKSkjkn9Kiir5D54c72h6AXM8jQejc9WXTF4AbL5UWrDfBS-DFN5mYGRuRHJZGSvB52uM_DdsxQpbHyVMF1aavg6YeVw')" }}>
            {/* Gradient Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-abyss)] via-[var(--color-abyss)]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-abyss)]/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[var(--color-bronze)]/5 mix-blend-overlay"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full flex flex-col items-center text-center max-w-lg mx-auto mt-[35vh]">
            {/* Headline */}
            <h1 className="font-display font-bold text-[64px] leading-[60px] md:text-[80px] md:leading-[80px] text-[var(--color-bone)] uppercase mb-10 flex flex-col items-center drop-shadow-2xl animate-fade-in-up">
              <span className="block text-[var(--color-bone)]">BLOOD.</span>
              <span className="block text-[var(--color-bone)]">SWEAT.</span>
              <span className="block text-[var(--color-blood)] mt-2 drop-shadow-[0_0_20px_rgba(217,26,26,0.5)]">IRON.</span>
            </h1>

            {/* Subcopy */}
            <p className="font-sans text-lg text-[var(--color-ash)] mb-10 max-w-[320px] drop-shadow-md animate-fade-in-up delay-100">
              The 3 PM crash is a battlefield. Don't surrender to your screen. Prove your grit, grab the iron, and let a single, heavy set reignite your blood.
            </p>

            {/* CTA */}
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full sm:w-auto relative group overflow-hidden bg-[var(--color-abyss)]/50 border-2 border-[var(--color-bronze)] text-[var(--color-bronze)] font-display font-bold text-[20px] py-5 px-8 rounded-none uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_30px_rgba(200,154,81,0.15)] hover:bg-[var(--color-bronze)] hover:text-[var(--color-abyss)] hover:shadow-[0_0_40px_rgba(200,154,81,0.4)] animate-fade-in-up delay-200"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl leading-none">⚔️</span>
                {loading ? 'FORGING...' : user ? 'RESUME ASSAULT' : 'ENTER THE ARENA'}
              </span>
            </button>
            
            <p className="mt-6 text-xs animate-fade-in-up delay-300 opacity-50 text-[var(--color-ash)]">
              By continuing, you assume all responsibility for injuries incurred.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full px-6 py-24 bg-[var(--color-abyss)] border-t border-[var(--color-bronze)]/20 flex flex-col items-center">
          {/* Watermark */}
          <div className="absolute top-10 overflow-hidden pointer-events-none flex items-center justify-center opacity-[0.02]">
            <span className="font-display text-[200px] md:text-[300px] leading-none text-[var(--color-blood)] font-black">300</span>
          </div>

          <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
            <h2 className="font-display font-bold text-[40px] leading-[44px] md:text-[56px] md:leading-[60px] text-[var(--color-bone)] uppercase mb-16 tracking-wide drop-shadow-lg">
              NO QUOTAS.<br/>
              <span className="text-[var(--color-blood)] drop-shadow-[0_0_15px_rgba(217,26,26,0.3)]">JUST CARNAGE.</span>
            </h2>

            {/* Feature Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="relative bg-[var(--color-charcoal)]/50 border border-[var(--color-bronze)]/20 p-6 rounded-none group overflow-hidden hover:border-[var(--color-bronze)]/50 transition-colors">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-bronze)]/30 group-hover:bg-[var(--color-bronze)] transition-colors"></div>
                <div className="flex flex-col md:flex-col items-start gap-4">
                  <div className="w-14 h-14 bg-[var(--color-abyss)] flex items-center justify-center border border-[var(--color-bronze)]/40 shadow-[0_0_15px_rgba(200,154,81,0.1)]">
                    <span className="text-2xl text-[var(--color-bronze)]">⚠️</span>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-display font-bold text-xl text-[var(--color-bronze)] uppercase mb-2 tracking-wider">Brutal Alarms</h3>
                    <p className="font-sans text-sm text-[var(--color-ash)]">Unforgiving calls to action right at your desk.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="relative bg-[var(--color-charcoal)]/50 border border-[var(--color-blood)]/20 p-6 rounded-none group overflow-hidden hover:border-[var(--color-blood)]/50 transition-colors shadow-[0_0_10px_rgba(217,26,26,0.05)]">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-blood)]/30 group-hover:bg-[var(--color-blood)] transition-colors"></div>
                <div className="flex flex-col md:flex-col items-start gap-4">
                  <div className="w-14 h-14 bg-[var(--color-abyss)] flex items-center justify-center border border-[var(--color-blood)]/40 shadow-[0_0_15px_rgba(217,26,26,0.15)]">
                    <span className="text-2xl text-[var(--color-blood)]">🩸</span>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-display font-bold text-xl text-[var(--color-blood)] uppercase mb-2 tracking-wider">Max Effort</h3>
                    <p className="font-sans text-sm text-[var(--color-ash)]">One single, heavy set. Push yourself to failure.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="relative bg-[var(--color-charcoal)]/50 border border-[var(--color-bronze)]/20 p-6 rounded-none group overflow-hidden hover:border-[var(--color-bronze)]/50 transition-colors">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-bronze)]/30 group-hover:bg-[var(--color-bronze)] transition-colors"></div>
                <div className="flex flex-col md:flex-col items-start gap-4">
                  <div className="w-14 h-14 bg-[var(--color-abyss)] flex items-center justify-center border border-[var(--color-bronze)]/40 shadow-[0_0_15px_rgba(200,154,81,0.1)]">
                    <span className="text-2xl text-[var(--color-bronze)]">🛡️</span>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-display font-bold text-xl text-[var(--color-bronze)] uppercase mb-2 tracking-wider">Spartan Glory</h3>
                    <p className="font-sans text-sm text-[var(--color-ash)]">Earn your place in the ranks. No retreat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 text-center pb-8 pt-8 bg-[var(--color-abyss)] border-t border-[var(--color-bronze)]/10 text-xs text-[var(--color-ash)] uppercase tracking-widest opacity-50 flex flex-col gap-2">
          <p className="font-display font-bold text-[var(--color-bone)]">B.E.A.S.T. (Brutal Extreme Assault Spartan Trainer)</p>
          <p>© 2026 B.E.A.S.T. · No Retreat, No Surrender</p>
        </footer>
      </main>
    </div>
  )
}
