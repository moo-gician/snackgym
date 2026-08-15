import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from './lib/firebase'
import { db } from './lib/firebase'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import './index.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Handle redirect login results (for mobile iOS/Android)
    getRedirectResult(auth).catch(console.error);

    // 2. Listen to auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        // Fetch user document to check onboarding status
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.onboardingComplete) {
            sessionStorage.setItem('is_onboarded', 'true');
          } else {
            sessionStorage.removeItem('is_onboarded');
          }
        } catch (e) {
          console.error("Error fetching user status:", e);
        }

        const redirectPath = sessionStorage.getItem('redirectPath')
        if (redirectPath) {
          sessionStorage.removeItem('redirectPath')
          navigate(redirectPath)
        }
      }
      setLoading(false)
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

  const isOnboarded = sessionStorage.getItem('is_onboarded') === 'true';

  return (
    <Routes>
      {/* If logged in and at root, redirect to onboarding or dashboard */}
      <Route path="/" element={<Navigate to={isOnboarded ? "/dashboard" : "/onboarding"} replace />} />
      <Route path="/onboarding" element={isOnboarded ? <Navigate to="/dashboard" replace /> : <OnboardingPage />} />
      
      {/* TODO: Create SessionPage & Dashboard */}
      <Route path="/session/:id" element={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Session View</h2>
          <p>Session ID: {location.pathname.split('/').pop()}</p>
        </div>
      } />
      
      <Route path="/dashboard" element={<DashboardPage />} />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
