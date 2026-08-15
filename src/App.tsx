import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './lib/firebase'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import './index.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      
      // Handle redirect after login (e.g. from Deep Link)
      if (currentUser) {
        const redirectPath = sessionStorage.getItem('redirectPath')
        if (redirectPath) {
          sessionStorage.removeItem('redirectPath')
          navigate(redirectPath)
        }
      }
    })
    return unsubscribe
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🌿</div>
          <p className="text-base font-medium" style={{ color: 'var(--color-text-sub)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Guard: Not logged in
  if (!user) {
    // If they tried to access a protected route, save it for redirect
    if (location.pathname !== '/') {
      sessionStorage.setItem('redirectPath', location.pathname)
    }
    return <LandingPage />
  }

  return (
    <Routes>
      {/* If logged in and at root, redirect to onboarding or dashboard */}
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      {/* TODO: Create SessionPage & Dashboard */}
      <Route path="/session/:id" element={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Session View</h2>
          <p>Session ID: {location.pathname.split('/').pop()}</p>
        </div>
      } />
      
      <Route path="/dashboard" element={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.displayName}</h2>
          <p>Dashboard coming soon...</p>
        </div>
      } />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
