import { signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export async function signInWithGoogle() {
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      // redirect의 경우 여기서 결과를 받을 수 없으며 App.tsx 등에서 getRedirectResult로 처리됩니다.
      return null;
    } else {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    }
  } catch (error) {
    console.error('Google sign-in failed:', error)
    throw error
  }
}

export function signOut() {
  return auth.signOut()
}
