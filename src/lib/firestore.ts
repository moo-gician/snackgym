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
  totalCalories?: number;
  todaySessions?: number;
  currentStreak?: number;
  lastWorkoutDate?: string;
  snooze_until?: string | null;
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

/**
 * 세션 완료 시 유저의 칼로리, 스트릭, 오늘 달성 횟수를 업데이트합니다.
 */
export async function recordSessionComplete(uid: string, earnedCalories: number) {
  const { getDoc } = await import('firebase/firestore');
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const data = userSnap.data() as Partial<UserProfile>;
  
  // 현재 유저의 로컬 날짜 기준 (YYYY-MM-DD)
  const now = new Date();
  const todayDate = now.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toLocaleDateString('en-CA');

  let {
    totalCalories = 0,
    todaySessions = 0,
    currentStreak = 0,
    lastWorkoutDate = ''
  } = data;

  totalCalories += earnedCalories;

  if (lastWorkoutDate === todayDate) {
    todaySessions += 1;
  } else if (lastWorkoutDate === yesterdayDate) {
    todaySessions = 1;
    currentStreak += 1;
  } else {
    // 며칠 쉬었거나 완전 처음인 경우
    todaySessions = 1;
    currentStreak = 1; // 오늘부터 다시 1일
  }

  await updateDoc(userRef, {
    totalCalories,
    todaySessions,
    currentStreak,
    lastWorkoutDate: todayDate,
    updatedAt: new Date().toISOString()
  });
}
