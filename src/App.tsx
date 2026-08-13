import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './lib/firebase'
import LandingPage from './pages/LandingPage'
import './index.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #E8F5E9 0%, #F8FAF8 100%)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🌿</div>
          <p className="text-base font-medium" style={{ color: '#4A6741' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  // TODO: Post-login dashboard (Onboarding → Home)
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #E8F5E9 0%, #F8FAF8 100%)' }}>
      <div className="text-center p-8">
        <div className="text-5xl mb-4">💪</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A2E1A' }}>
          Welcome, {user.displayName}!
        </h2>
        <p style={{ color: '#4A6741' }}>Dashboard coming soon 🌿</p>
      </div>
    </div>
  )
}

export default App
