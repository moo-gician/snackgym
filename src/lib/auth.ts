import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google 로그인 실패:', error)
    throw error
  }
}

export function signOut() {
  return auth.signOut()
}
