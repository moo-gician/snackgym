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
          <p className="text-base font-medium" style={{ color: '#4A6741' }}>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  // TODO: 로그인 후 대시보드 (온보딩 → 홈 화면)
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #E8F5E9 0%, #F8FAF8 100%)' }}>
      <div className="text-center p-8">
        <div className="text-5xl mb-4">💪</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A2E1A' }}>
          {user.displayName}님, 반갑습니다!
        </h2>
        <p style={{ color: '#4A6741' }}>대시보드 준비 중입니다 🌿</p>
      </div>
    </div>
  )
}

export default App
