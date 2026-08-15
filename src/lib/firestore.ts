import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  uid: string;
  onboardingComplete: boolean;
  is_active: boolean;
  equipment: string[];
  targetMuscles: string[];
  course: 'MICRO' | 'COMPACT' | 'CIRCUIT';
  workStartTime: string;
  workEndTime: string;
  sessionsPerDay: number;
  spotter: 'SPARTAN' | 'TSUNDERE' | 'ANGEL';
  notificationMethod: 'telegram' | 'email' | 'none';
  activeDays: number[];
  timezone: string;
  updatedAt: string;
};

/**
 * 온보딩 완료 시 Firestore에 유저 데이터를 저장합니다.
 */
export async function saveOnboardingData(uid: string, data: Omit<UserProfile, 'uid' | 'updatedAt' | 'onboardingComplete' | 'is_active'>) {
  const userRef = doc(db, 'users', uid);
  
  const payload: UserProfile = {
    uid,
    onboardingComplete: true,
    is_active: true, // 활성화 상태로 시작
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // setDoc with merge: true ensures we don't accidentally wipe out other fields if they exist
  await setDoc(userRef, payload, { merge: true });
  return payload;
}

/**
 * 회원 탈퇴 시 데이터를 보존하고 비활성화(Soft Delete) 처리합니다.
 */
export async function deactivateUser(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    is_active: false,
    updatedAt: new Date().toISOString()
  });
}
