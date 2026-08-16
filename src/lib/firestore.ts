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
  todayCalories?: number;
  weeklyCalories?: number;
  monthlyCalories?: number;
  todaySessions?: number;
  currentStreak?: number;
  lastWorkoutDate?: string;
  lastWeekResetDate?: string;
  lastMonthResetDate?: string;
  snooze_until?: string | null;
  updatedAt: string;
  alarmTimes?: string[];
  completedAlarms?: string[];
  skippedAlarms?: string[];
  splitStrategy?: string;
  customExercisePool?: Record<string, string[]>;
  blacklistedExercises?: string[];
  currentSplitIndex?: number;
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
export async function recordSessionComplete(uid: string, earnedCalories: number, alarmTime?: string) {
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
    todayCalories = 0,
    weeklyCalories = 0,
    monthlyCalories = 0,
    todaySessions = 0,
    currentStreak = 0,
    lastWorkoutDate = '',
    lastWeekResetDate = '',
    lastMonthResetDate = '',
    completedAlarms = [],
    skippedAlarms = []
  } = data;

  const getMondayDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay() || 7; // Sun is 0 -> 7
    if (day !== 1) {
      date.setHours(-24 * (day - 1));
    }
    return date.toLocaleDateString('en-CA');
  };

  const currentWeekMonday = getMondayDate(now);
  const currentMonthStr = todayDate.substring(0, 7); // YYYY-MM

  // Reset daily
  if (lastWorkoutDate !== todayDate) {
    todayCalories = 0;
  }
  // Reset weekly
  if (lastWeekResetDate !== currentWeekMonday) {
    weeklyCalories = 0;
    lastWeekResetDate = currentWeekMonday;
  }
  // Reset monthly
  if (lastMonthResetDate !== currentMonthStr) {
    monthlyCalories = 0;
    lastMonthResetDate = currentMonthStr;
  }

  totalCalories += earnedCalories;
  todayCalories += earnedCalories;
  weeklyCalories += earnedCalories;
  monthlyCalories += earnedCalories;

  if (lastWorkoutDate === todayDate) {
    todaySessions += 1;
  } else if (lastWorkoutDate === yesterdayDate) {
    todaySessions = 1;
    currentStreak += 1;
    completedAlarms = [];
    skippedAlarms = [];
  } else {
    // 며칠 쉬었거나 완전 처음인 경우
    todaySessions = 1;
    currentStreak = 1; // 오늘부터 다시 1일
    completedAlarms = [];
    skippedAlarms = [];
  }

  if (alarmTime && !completedAlarms.includes(alarmTime)) {
    completedAlarms.push(alarmTime);
  }

  await updateDoc(userRef, {
    totalCalories,
    todayCalories,
    weeklyCalories,
    monthlyCalories,
    todaySessions,
    currentStreak,
    lastWorkoutDate: todayDate,
    lastWeekResetDate,
    lastMonthResetDate,
    completedAlarms,
    skippedAlarms,
    updatedAt: new Date().toISOString()
  });
}

/**
 * 특정 세션 건너뛰기
 */
export async function skipSession(uid: string, alarmTime: string) {
  const { getDoc } = await import('firebase/firestore');
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const data = userSnap.data() as Partial<UserProfile>;
  
  const now = new Date();
  const todayDate = now.toLocaleDateString('en-CA');
  
  let {
    lastWorkoutDate = '',
    completedAlarms = [],
    skippedAlarms = []
  } = data;

  // 만약 날짜가 바뀌었다면 배열 초기화 (여기서도 체크)
  if (lastWorkoutDate !== todayDate) {
    completedAlarms = [];
    skippedAlarms = [];
    // streak이나 다른 항목은 운동 완료 시에만 올려야 하므로 여기서는 배열 초기화만 진행
    // 다만 lastWorkoutDate가 달라진 상태에서 스킵하면 운동 없이 스킵부터 한 셈
    // 굳이 lastWorkoutDate를 업데이트하진 않고 배열만 비움
  }

  if (!skippedAlarms.includes(alarmTime) && !completedAlarms.includes(alarmTime)) {
    skippedAlarms.push(alarmTime);
  }

  await updateDoc(userRef, {
    skippedAlarms,
    completedAlarms,
    ...(lastWorkoutDate !== todayDate ? { lastWorkoutDate: todayDate, todaySessions: 0 } : {}),
    updatedAt: new Date().toISOString()
  });
}
