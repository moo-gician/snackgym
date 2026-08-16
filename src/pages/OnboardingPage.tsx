import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { saveOnboardingData } from '../lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import BodyMap from '../components/BodyMap';
import { User, ShieldAlert, RefreshCw } from 'lucide-react';
import { EXERCISE_DB } from '../lib/exerciseDB';
import { calculateSplitStrategy, generateCustomPool, autoDowngradeSplitIfNeeded, type SplitStrategy } from '../lib/workoutLogic';

type CourseType = 'MICRO' | 'COMPACT' | 'CIRCUIT' | null;
type SpotterType = 'SPARTAN' | 'DRILL_SERGEANT' | null;
type NotificationMethod = 'telegram' | 'none' | null;

const TIME_OPTIONS = Array.from({length: 48}).map((_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = (i % 2 === 0) ? '00' : '30';
  return `${h}:${m}`;
});
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '1', 10);
  const [step, setStep] = useState(initialStep);
  
  // Persisted state via sessionStorage to prevent loss on refresh
  const [equipment, setEquipment] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_equipment');
    const parsed = saved ? JSON.parse(saved) : [];
    // Ensure 'Bodyweight' is always the first default
    const filtered = parsed.filter((i: string) => i !== '맨몸' && i !== 'Bodyweight');
    return ['Bodyweight', ...filtered];
  });
  
  const [muscles, setMuscles] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_muscles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [course, setCourse] = useState<CourseType>(() => {
    return (sessionStorage.getItem('ob_course') as CourseType) || null;
  });

  const [workStartTime, setWorkStartTime] = useState(() => sessionStorage.getItem('ob_workStart') || '09:00');
  const [workEndTime, setWorkEndTime] = useState(() => sessionStorage.getItem('ob_workEnd') || '18:00');
  const [targetInterval, setTargetInterval] = useState(() => Number(sessionStorage.getItem('ob_interval')) || 60);
  const [activeDays, setActiveDays] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('ob_activeDays');
    return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5]; // Mon-Fri default
  });

  // Blacklist
  const [blacklistedExercises, setBlacklistedExercises] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_blacklist');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom Pool States
  const [currentSplitStrategy, setCurrentSplitStrategy] = useState<SplitStrategy>('1-Split (Full Body)');
  const [customPool, setCustomPool] = useState<Record<string, string[]>>({});
  const [downgradeWarning, setDowngradeWarning] = useState<string | null>(null);

  const [spotter, setSpotter] = useState<SpotterType>(() => {
    return (sessionStorage.getItem('ob_spotter') as SpotterType) || 'SPARTAN';
  });

  const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>(() => {
    return (sessionStorage.getItem('ob_notif') as NotificationMethod) || null;
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !dataLoaded) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!sessionStorage.getItem('ob_equipment') && data.equipment && data.equipment.length > 0) setEquipment(data.equipment);
          if (!sessionStorage.getItem('ob_muscles') && data.targetMuscles && data.targetMuscles.length > 0) setMuscles(data.targetMuscles);
          if (!sessionStorage.getItem('ob_course') && data.course) setCourse(data.course);
          if (!sessionStorage.getItem('ob_workStart') && data.workStartTime) setWorkStartTime(data.workStartTime);
          if (!sessionStorage.getItem('ob_workEnd') && data.workEndTime) setWorkEndTime(data.workEndTime);
          if (!sessionStorage.getItem('ob_interval') && data.sessionsPerDay) setTargetInterval(data.sessionsPerDay === 4 ? 120 : data.sessionsPerDay >= 8 ? 30 : 60);
          if (!sessionStorage.getItem('ob_activeDays') && data.activeDays) setActiveDays(data.activeDays);
          if (!sessionStorage.getItem('ob_spotter') && data.spotter) setSpotter(data.spotter);
          if (!sessionStorage.getItem('ob_notif') && data.notificationMethod) setNotificationMethod(data.notificationMethod);
          if (!sessionStorage.getItem('ob_blacklist') && data.blacklistedExercises) setBlacklistedExercises(data.blacklistedExercises);
        }
        setDataLoaded(true);
      }
    });
    return () => unsubscribe();
  }, [dataLoaded]);

  useEffect(() => sessionStorage.setItem('ob_equipment', JSON.stringify(equipment)), [equipment]);
  useEffect(() => sessionStorage.setItem('ob_muscles', JSON.stringify(muscles)), [muscles]);
  useEffect(() => { if (course) sessionStorage.setItem('ob_course', course); }, [course]);
  useEffect(() => sessionStorage.setItem('ob_workStart', workStartTime), [workStartTime]);
  useEffect(() => sessionStorage.setItem('ob_workEnd', workEndTime), [workEndTime]);
  useEffect(() => sessionStorage.setItem('ob_interval', targetInterval.toString()), [targetInterval]);
  useEffect(() => { if (spotter) sessionStorage.setItem('ob_spotter', spotter); }, [spotter]);
  useEffect(() => { if (notificationMethod) sessionStorage.setItem('ob_notif', notificationMethod); }, [notificationMethod]);
  useEffect(() => sessionStorage.setItem('ob_blacklist', JSON.stringify(blacklistedExercises)), [blacklistedExercises]);

  const alarmTimes = useMemo(() => {
    if (!workStartTime || !workEndTime) return [];
    const [startH, startM] = workStartTime.split(':').map(Number);
    const [endH, endM] = workEndTime.split(':').map(Number);
    let currentMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    if (endMin <= currentMin) endMin += 24 * 60; // Handle crossing midnight
    
    const times = [];
    while (currentMin <= endMin) {
      const h = Math.floor(currentMin / 60) % 24;
      const hh = h.toString().padStart(2, '0');
      const m = (currentMin % 60).toString().padStart(2, '0');
      times.push(`${hh}:${m}`);
      currentMin += targetInterval;
    }
    return times;
  }, [workStartTime, workEndTime, targetInterval]);

  const recalculatePool = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    const sessionsPerDay = alarmTimes.length > 0 ? alarmTimes.length : 1;
    const initialStrategy = calculateSplitStrategy(muscles, sessionsPerDay);
    const initialPool = generateCustomPool(initialStrategy, equipment, muscles);
    
    const { finalStrategy, finalPool, wasDowngraded } = autoDowngradeSplitIfNeeded(initialStrategy, initialPool, blacklistedExercises);
    
    setCurrentSplitStrategy(finalStrategy);
    setCustomPool(finalPool);
    if (wasDowngraded) {
      setDowngradeWarning(`Your blacklisted exercises forced a downgrade to ${finalStrategy}.`);
    } else {
      setDowngradeWarning(null);
    }
  };

  useEffect(() => {
    if (step === 5) {
      recalculatePool();
    }
  }, [step, equipment, muscles, alarmTimes.length]);

  const toggleExercise = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setBlacklistedExercises(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const nextStep = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setStep(s => Math.min(6, s + 1));
  };
  const prevStep = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setStep(s => Math.max(1, s - 1));
  };

  const completeOnboarding = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Login is required.");
      return;
    }
    
    try {
      await saveOnboardingData(user.uid, {
        equipment,
        targetMuscles: muscles,
        course: course as any,
        workStartTime,
        workEndTime,
        sessionsPerDay: alarmTimes.length > 0 ? alarmTimes.length : 1,
        activeDays,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        spotter: spotter as any,
        notificationMethod: notificationMethod as any,
        alarmTimes,
        splitStrategy: currentSplitStrategy,
        customExercisePool: customPool,
        blacklistedExercises
      });
      
      console.log("Onboarding data saved successfully!");
      
      // Cleanup session storage
      ['ob_equipment', 'ob_muscles', 'ob_course', 'ob_workStart', 'ob_workEnd', 'ob_interval', 'ob_activeDays', 'ob_spotter', 'ob_notif'].forEach(k => sessionStorage.removeItem(k));

      if (notificationMethod === 'telegram') {
        const telegramUrl = `https://t.me/SnackGymBot?start=${user.uid}`;
        window.location.href = telegramUrl;
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-abyss)] text-[var(--color-ash)] font-sans flex flex-col">
      {/* Neo-Brutalist Header */}
      <header className="fixed top-0 w-full z-50 bg-[var(--color-abyss)]/90 backdrop-blur-md pt-safe px-6">
        <div className="h-16 flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="https://lh3.googleusercontent.com/aida/AP1WRLvL3hsJ2y4za4DRON2I13kxqT-k84HauYfDzQw6W6u3cozHNVsMbONuPLoKkpVT9dK2a1_u0uo5vksj3dc0-FFdlJ-HgueDt5Cr7wA0Nbke59Hpo54CjjZVI1U9V7fLylSFWlbOuYQr89qYPV01DmM5z23_uMNsQEX5cTcUVnv7nVqkVilcjqh6NlXdPTs3E1aAlwUkt9IGCc1g546aHK--oY8-vDnNFeA2ALgnjZJX0QPTTSslf65rvyo" alt="B.E.A.S.T. Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-[14px] uppercase tracking-widest text-[var(--color-bronze)] whitespace-nowrap">Armory Onboarding</span>
          <div className="flex-grow flex items-center gap-1 px-2">
            {[1,2,3,4,5,6].map(idx => (
              <div key={idx} className={`h-1 rounded-sm flex-1 transition-all duration-300 ${step >= idx ? 'bg-[var(--color-bronze)] shadow-[0_0_8px_rgba(200,154,81,0.4)]' : 'bg-[var(--color-charcoal)]'}`} />
            ))}
          </div>
          <button 
            onClick={async () => {
              if (auth.currentUser) {
                await signOut(auth);
                navigate('/');
              } else {
                navigate('/');
              }
            }}
            className="w-8 h-8 shrink-0 rounded-none border border-[var(--color-bronze)] bg-[var(--color-abyss)] flex items-center justify-center shadow-[0_0_10px_rgba(200,154,81,0.2)] hover:bg-[var(--color-charcoal)] transition-colors"
          >
            <User size={18} className="text-[var(--color-bronze)]" />
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col pb-[300px] pt-24 px-6 max-w-md mx-auto w-full relative">
        <div className="flex-1 animate-fade-in-up">
          {step === 1 && (
            <div className="flex flex-col text-center">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">WHAT WEAPONS ARE WE USING?</h1>
              <p className="font-display font-bold text-[var(--color-bronze)] mt-2 mb-8 uppercase text-center text-sm tracking-widest">Select your arsenal to calibrate the training protocol.</p>
              
              <div className="grid grid-cols-2 gap-4 pb-12">
                {[
                  { id: 'Bodyweight', emoji: '🤸', label: 'Bodyweight' },
                  { id: 'Dumbbell', emoji: '🦾', label: 'Dumbbells' },
                  { id: 'PullupBar', emoji: '🐒', label: 'Pull-up Bar' },
                  { id: 'Mat', emoji: '🧘', label: 'Yoga Mat' },
                  { id: 'Band', emoji: '🪢', label: 'Resistance Band' },
                  { id: 'Barbell', emoji: '🏋️', label: 'Barbell' },
                  { id: 'Bench', emoji: '🪑', label: 'Bench' },
                  { id: 'CableMachine', emoji: '⛓️', label: 'Cable Machine' },
                  { id: 'ParallelBars', emoji: '🪜', label: 'Parallel Bars' },
                  { id: 'MedicineBall', emoji: '⚽', label: 'Medicine Ball' },
                  { id: 'SmithMachine', emoji: '🏗️', label: 'Smith Machine' },
                  { id: 'EZBar', emoji: '〰️', label: 'EZ Bar' },
                ].map(item => {
                  const eq = item.id;
                  const isSelected = equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      disabled={eq === 'Bodyweight'}
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(50);
                        setEquipment(prev => prev.includes(eq) ? prev.filter(i => i !== eq) : [...prev, eq]);
                      }}
                      className={`group relative w-full aspect-square bg-[var(--color-charcoal)] rounded-none border flex flex-col items-center justify-center p-4 transition-all active:scale-[0.98] ${
                        isSelected 
                          ? 'border-[var(--color-bronze)] text-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.2)]'
                          : 'border-gray-800 text-[var(--color-ash)] hover:border-[var(--color-bronze)] hover:text-[var(--color-bronze)] hover:shadow-[0_0_15px_rgba(200,154,81,0.2)]'
                      } ${eq === 'Bodyweight' ? 'opacity-90' : ''}`}
                    >
                      <div className={`absolute top-0 right-0 w-2 h-2 transition-colors ${isSelected ? 'bg-[var(--color-bronze)]' : 'bg-gray-800 group-hover:bg-[var(--color-bronze)]'}`}></div>
                      <div className={`text-6xl flex items-center justify-center transition-transform duration-300 mb-4 ${isSelected ? 'scale-110 drop-shadow-[0_0_15px_rgba(200,154,81,0.5)]' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>
                        {item.emoji}
                      </div>
                      <span className="font-display font-bold text-sm uppercase tracking-widest text-center leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col text-center">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">WHAT ARE WE DESTROYING TODAY?</h1>
              <p className="font-display font-bold text-[var(--color-bronze)] mt-2 mb-8 uppercase text-center text-sm tracking-widest">Select target muscle groups for annihilation.</p>
              
              <div className="mt-4 pb-12">
                <BodyMap selectedMuscles={muscles} onChange={(newMuscles) => {
                  if (navigator.vibrate) navigator.vibrate(50);
                  setMuscles(newMuscles);
                }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col text-center">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">HOW LONG CAN YOU SURVIVE?</h1>
              <p className="font-display font-bold text-[var(--color-bronze)] mt-2 mb-8 uppercase text-center text-sm tracking-widest">Calibrate the intensity of your suffering.</p>
              
              <div className="flex flex-col gap-4 flex-grow pb-12 w-full max-w-md mx-auto">
                {/* Option 1: MICRO */}
                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(50); setCourse('MICRO'); }}
                  className={`group relative w-full text-left bg-[var(--color-charcoal)] p-5 overflow-hidden transition-all active:scale-[0.98] ${
                    course === 'MICRO' ? 'border-2 border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.3)]' : 'border border-gray-800 hover:border-[var(--color-bronze)]/50 hover:shadow-[0_0_15px_rgba(200,154,81,0.1)]'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-[var(--color-charcoal)] transition-colors ${course === 'MICRO' ? 'bg-[var(--color-bronze)]' : 'bg-transparent group-hover:bg-[var(--color-bronze)]/50'}`}></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <h2 className={`font-display font-bold text-2xl uppercase tracking-widest ${course === 'MICRO' ? 'text-[var(--color-bronze)]' : 'text-[var(--color-bone)] group-hover:text-[var(--color-bronze)]'}`}>
                      Micro Assault
                    </h2>
                    <span className="font-display font-bold text-[var(--color-ash)] bg-[var(--color-abyss)] px-3 py-1.5 text-sm uppercase tracking-widest border border-gray-800">
                      1-2m
                    </span>
                  </div>

                  {/* Scanline effect for selected */}
                  {course === 'MICRO' && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,154,81,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-50 pointer-events-none"></div>
                  )}
                </button>

                {/* Option 2: COMPACT */}
                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(50); setCourse('COMPACT'); }}
                  className={`group relative w-full text-left bg-[var(--color-charcoal)] p-5 overflow-hidden transition-all active:scale-[0.98] ${
                    course === 'COMPACT' ? 'border-2 border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.3)]' : 'border border-gray-800 hover:border-[var(--color-bronze)]/50 hover:shadow-[0_0_15px_rgba(200,154,81,0.1)]'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-[var(--color-charcoal)] transition-colors ${course === 'COMPACT' ? 'bg-[var(--color-bronze)]' : 'bg-transparent group-hover:bg-[var(--color-bronze)]/50'}`}></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <h2 className={`font-display font-bold text-2xl uppercase tracking-widest ${course === 'COMPACT' ? 'text-[var(--color-bronze)]' : 'text-[var(--color-bone)] group-hover:text-[var(--color-bronze)]'}`}>
                      Compact Target
                    </h2>
                    <span className="font-display font-bold text-[var(--color-ash)] bg-[var(--color-abyss)] px-3 py-1.5 text-sm uppercase tracking-widest border border-gray-800">
                      3-5m
                    </span>
                  </div>

                  {course === 'COMPACT' && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,154,81,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-50 pointer-events-none"></div>
                  )}
                </button>

                {/* Option 3: CIRCUIT */}
                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(50); setCourse('CIRCUIT'); }}
                  className={`group relative w-full text-left bg-[var(--color-charcoal)] p-5 overflow-hidden transition-all active:scale-[0.98] ${
                    course === 'CIRCUIT' ? 'border-2 border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.3)]' : 'border border-gray-800 hover:border-[var(--color-bronze)]/50 hover:shadow-[0_0_15px_rgba(200,154,81,0.1)]'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-[var(--color-charcoal)] transition-colors ${course === 'CIRCUIT' ? 'bg-[var(--color-bronze)]' : 'bg-transparent group-hover:bg-[var(--color-bronze)]/50'}`}></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <h2 className={`font-display font-bold text-2xl uppercase tracking-widest ${course === 'CIRCUIT' ? 'text-[var(--color-bronze)]' : 'text-[var(--color-bone)] group-hover:text-[var(--color-bronze)]'}`}>
                      Short Circuit
                    </h2>
                    <span className="font-display font-bold text-[var(--color-ash)] bg-[var(--color-abyss)] px-3 py-1.5 text-sm uppercase tracking-widest border border-gray-800">
                      6-10m
                    </span>
                  </div>

                  {course === 'CIRCUIT' && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,154,81,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-50 pointer-events-none"></div>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col text-left">
              <div className="flex flex-col items-center mb-6">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">STRIKE SCHEDULE</h1>
                <p className="font-display font-bold text-[var(--color-bronze)] mt-2 uppercase text-center text-sm tracking-widest">Calibrate your weekly engagement.</p>
              </div>

              <div className="bg-[var(--color-charcoal)] p-5 rounded-none border border-gray-800 relative mb-4">
                <span className="font-display font-bold text-white mb-4 block uppercase tracking-widest text-sm md:text-base">Active Duty Days</span>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { day: 1, label: 'M' },
                    { day: 2, label: 'T' },
                    { day: 3, label: 'W' },
                    { day: 4, label: 'T' },
                    { day: 5, label: 'F' },
                    { day: 6, label: 'S' },
                    { day: 0, label: 'S' }
                  ].map(({ day, label }) => {
                    const isActive = activeDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if(navigator.vibrate) navigator.vibrate(20);
                          setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())
                        }}
                        className={`aspect-square flex items-center justify-center font-display font-bold text-lg rounded-none relative overflow-hidden transition-all active:scale-[0.9] border ${
                          isActive 
                            ? 'bg-[var(--color-bronze)] text-[var(--color-abyss)] border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.3)]' 
                            : 'bg-transparent text-[var(--color-ash)] border-gray-800 hover:border-[var(--color-bronze)]'
                        }`}
                      >
                        {isActive && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--color-abyss)] opacity-50"></div>}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--color-charcoal)] p-5 rounded-none border border-gray-800 relative mb-4 overflow-hidden">
                <span className="font-display font-bold text-white mb-4 block uppercase tracking-widest text-sm md:text-base">Engagement Window</span>
                <div className="flex flex-row justify-between gap-3 w-full">
                  <div className="flex-1 bg-[var(--color-abyss)] py-4 px-0 md:px-2 rounded-none border border-gray-800 flex flex-col items-center justify-center relative shadow-sm overflow-hidden min-w-0">
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--color-bronze)]/40"></div>
                    <select value={workStartTime} onChange={e => setWorkStartTime(e.target.value)} className="w-full text-center font-display font-bold text-3xl md:text-4xl outline-none bg-transparent text-[var(--color-bone)] leading-none tracking-tighter appearance-none cursor-pointer">
                      {TIME_OPTIONS.map(time => <option key={time} value={time} className="bg-[var(--color-charcoal)] text-lg">{time}</option>)}
                    </select>
                    <span className="font-display font-bold text-[10px] text-[var(--color-ash)] mt-2 uppercase tracking-widest">Commence</span>
                  </div>
                  <div className="flex-1 bg-[var(--color-abyss)] py-4 px-0 md:px-2 rounded-none border border-gray-800 flex flex-col items-center justify-center relative shadow-sm opacity-90 overflow-hidden min-w-0">
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--color-blood)]/40"></div>
                    <select value={workEndTime} onChange={e => setWorkEndTime(e.target.value)} className="w-full text-center font-display font-bold text-3xl md:text-4xl outline-none bg-transparent text-[var(--color-bone)] leading-none tracking-tighter appearance-none cursor-pointer">
                      {TIME_OPTIONS.map(time => <option key={time} value={time} className="bg-[var(--color-charcoal)] text-lg">{time}</option>)}
                    </select>
                    <span className="font-display font-bold text-[10px] text-[var(--color-ash)] mt-2 uppercase tracking-widest">Ceasefire</span>
                  </div>
                </div>
              </div>
              

              <div className="bg-[var(--color-charcoal)] p-5 rounded-none border border-gray-800 relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 right-0 w-3 h-3 transition-colors duration-300 ${targetInterval === 120 ? 'bg-[var(--color-bronze)]' : targetInterval === 60 ? 'bg-orange-600' : 'bg-[var(--color-blood)]'}`}></div>
                
                <span className="font-display font-bold text-white mb-4 block uppercase tracking-widest text-sm md:text-base">TARGET INTERVAL</span>
                
                <div className="flex justify-between items-end mb-2 relative z-10">
                  <span className="font-display font-bold text-[var(--color-ash)] uppercase tracking-widest text-[11px]">Interval</span>
                  <span className={`font-display font-bold transition-colors duration-300 ${targetInterval === 120 ? 'text-[var(--color-bronze)]' : targetInterval === 60 ? 'text-orange-500' : 'text-[var(--color-blood)]'}`}>
                    <span className="text-3xl">{targetInterval === 120 ? '2' : targetInterval === 60 ? '1' : '30'}</span> 
                    <span className="text-sm text-[var(--color-ash)] font-sans tracking-normal ml-1">{targetInterval === 30 ? 'min' : 'hr'}</span>
                  </span>
                </div>
                
                <div 
                  className="flex gap-1 h-4 mt-2 cursor-pointer relative z-10 active:scale-[0.98] transition-transform" 
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    setTargetInterval(prev => prev === 120 ? 60 : prev === 60 ? 30 : 120);
                  }}
                >
                  {Array.from({length: 3}).map((_, i) => {
                    const activeCount = targetInterval === 120 ? 1 : targetInterval === 60 ? 2 : 3;
                    const isFilled = i < activeCount;
                    const colorClass = targetInterval === 120 ? 'bg-[var(--color-bronze)] shadow-[0_0_10px_rgba(200,154,81,0.5)]' :
                                       targetInterval === 60 ? 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.5)]' :
                                       'bg-[var(--color-blood)] shadow-[0_0_15px_rgba(197,0,13,0.8)]';
                    return (
                      <div key={i} className={`flex-1 transition-colors duration-300 ${isFilled ? colorClass : 'bg-[var(--color-abyss)] border border-gray-800 relative overflow-hidden'}`}>
                        {!isFilled && (
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between mt-3 text-[10px] font-display font-bold uppercase tracking-widest relative z-10 mb-6">
                  <span className="text-[var(--color-ash)] opacity-70">Tap to calibrate</span>
                  <span className={`transition-colors duration-300 ${targetInterval === 120 ? 'text-[var(--color-bronze)]' : targetInterval === 60 ? 'text-orange-500' : 'text-[var(--color-blood)]'}`}>
                    {targetInterval === 120 ? 'BASE' : targetInterval === 60 ? 'SPARTAN' : 'DEATH'}
                  </span>
                </div>

                {/* Alarm Times Grid */}
                <div className="border-t border-gray-800 pt-4 mt-2 relative z-10">
                  <span className="font-display font-bold text-[var(--color-ash)] mb-3 block uppercase tracking-widest text-[10px]">Estimated Strike Times ({alarmTimes.length}x)</span>
                  <div className="flex flex-wrap gap-2">
                    {alarmTimes.map(t => (
                      <div key={t} className="px-2 py-1 bg-[var(--color-abyss)] border border-gray-800 text-[var(--color-bone)] font-display font-bold text-xs uppercase shadow-sm">
                        {t}
                      </div>
                    ))}
                    {alarmTimes.length === 0 && (
                      <span className="text-xs text-[var(--color-blood)] font-display font-bold">Invalid Window</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col">
              <div className="flex flex-col items-center mb-6">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">YOUR ARMORY</h1>
                <p className="font-display font-bold text-[var(--color-bronze)] mt-2 uppercase text-center text-sm tracking-widest">Review and customize your weapons.</p>
              </div>

              <div className="bg-[var(--color-charcoal)] border border-gray-800 p-5 mb-6 text-center shadow-md">
                <span className="font-display font-bold text-[var(--color-ash)] uppercase tracking-widest text-xs block mb-2">Master Plan Generated</span>
                <h2 className="font-display font-bold text-2xl text-[var(--color-bone)] tracking-widest">{currentSplitStrategy}</h2>
                {downgradeWarning && (
                  <div className="mt-4 p-3 border-l-2 border-[var(--color-blood)] bg-[var(--color-blood)]/10 text-left">
                    <p className="font-display font-bold text-[var(--color-blood)] text-xs uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={14} /> SPARTAN WARNING
                    </p>
                    <p className="font-body-md text-sm text-[var(--color-ash)] mt-1">{downgradeWarning}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 pb-6">
                {Object.entries(customPool).map(([dayName, exerciseIds], idx) => {
                  const dayColor = idx === 0 ? 'text-[var(--color-bronze)]' : idx === 1 ? 'text-orange-500' : 'text-[var(--color-blood)]';
                  const activeBorderClass = idx === 0 
                    ? 'border-[var(--color-bronze)] shadow-[0_0_10px_rgba(200,154,81,0.1)]' 
                    : idx === 1 
                      ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                      : 'border-[var(--color-blood)] shadow-[0_0_10px_rgba(217,26,26,0.1)]';
                  const checkmarkClass = idx === 0 
                    ? 'border-[var(--color-bronze)] bg-[var(--color-bronze)]/20 text-[var(--color-bronze)]'
                    : idx === 1
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-[var(--color-blood)] bg-[var(--color-blood)]/20 text-[var(--color-blood)]';

                  const activeCount = exerciseIds.filter(id => !blacklistedExercises.includes(id)).length;

                  return (
                    <div key={dayName} className={`border border-gray-800 bg-[var(--color-abyss)]`}>
                      <div className="bg-[var(--color-charcoal)] p-3 border-b border-gray-800 flex items-center justify-between">
                        <h3 className={`font-display font-bold uppercase tracking-widest text-sm ${dayColor}`}>{dayName}</h3>
                        <span className="font-sans text-[10px] text-[var(--color-ash)] uppercase tracking-wider">
                          {activeCount} weapons selected
                        </span>
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        {exerciseIds.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No exercises available. Enable more equipment or muscles.</p>
                        ) : (
                          exerciseIds.map(id => {
                            const ex = EXERCISE_DB.find(e => e.id === id);
                            if (!ex) return null;
                            const isBlacklisted = blacklistedExercises.includes(id);
                            const emoji = ex.equipment === 'Dumbbell' ? '🦾' : ex.equipment === 'Mat' ? '🧘' : ex.equipment === 'PullupBar' ? '🐒' : ex.equipment === 'Bodyweight' ? '🤸' : '🏋️';
                            
                            return (
                              <button
                                key={id}
                                onClick={() => toggleExercise(id)}
                                className={`text-left flex items-center justify-between p-3 border transition-all active:scale-[0.98] ${
                                  !isBlacklisted 
                                    ? `bg-[var(--color-charcoal)] ${activeBorderClass}` 
                                    : 'bg-[var(--color-abyss)] border-gray-800 opacity-60 grayscale'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className={`text-3xl leading-none transition-all ${!isBlacklisted ? '' : 'grayscale opacity-50'}`}>
                                    {emoji}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className={`font-display font-bold uppercase tracking-widest text-sm ${!isBlacklisted ? 'text-[var(--color-bone)]' : 'text-gray-500 line-through'}`}>
                                      {ex.name}
                                    </span>
                                    <span className="font-sans text-[10px] text-[var(--color-ash)] uppercase mt-0.5">
                                      {ex.muscleGroup} • {ex.equipment}
                                    </span>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 border flex items-center justify-center shrink-0 ${!isBlacklisted ? checkmarkClass : 'border-gray-600 bg-transparent text-transparent'}`}>
                                  {(!isBlacklisted) && <span className="text-xs font-bold leading-none">✓</span>}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col text-center pt-8">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--color-bone)] uppercase tracking-wide leading-tight text-center mb-2">NO RETREAT!</h1>
              <p className="font-display font-bold text-[var(--color-bronze)] mt-2 mb-8 uppercase text-center text-sm tracking-widest">Connect your communication channel.</p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(50); setNotificationMethod('telegram'); }}
                  className={`group relative aspect-square rounded-none border flex flex-col items-center justify-center p-4 transition-all active:scale-[0.98] ${
                    notificationMethod === 'telegram' ? 'border-[#2AABEE] bg-[#0A1A24] shadow-[0_0_20px_rgba(42,171,238,0.2)]' : 'border-gray-800 bg-[var(--color-charcoal)] hover:border-[#2AABEE]'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-2 h-2 transition-colors ${notificationMethod === 'telegram' ? 'bg-[#2AABEE]' : 'bg-gray-800 group-hover:bg-[#2AABEE]'}`}></div>
                  <span className={`text-5xl mb-4 transition-transform duration-300 ${notificationMethod === 'telegram' ? 'scale-110 drop-shadow-[0_0_15px_rgba(42,171,238,0.5)]' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>✈️</span>
                  <div className="w-full text-center">
                    <span className={`font-display font-bold text-lg uppercase tracking-wider ${notificationMethod === 'telegram' ? 'text-[#2AABEE]' : 'text-[var(--color-ash)] group-hover:text-[#2AABEE]'}`}>Telegram</span>
                  </div>
                </button>

                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(50); setNotificationMethod('none'); }}
                  className={`group relative aspect-square rounded-none border flex flex-col items-center justify-center p-4 transition-all active:scale-[0.98] ${
                    notificationMethod === 'none' ? 'border-[var(--color-bronze)] bg-[var(--color-charcoal)] shadow-[0_0_20px_rgba(200,154,81,0.2)]' : 'border-gray-800 bg-[var(--color-charcoal)] hover:border-[var(--color-bronze)]'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-2 h-2 transition-colors ${notificationMethod === 'none' ? 'bg-[var(--color-bronze)]' : 'bg-gray-800 group-hover:bg-[var(--color-bronze)]'}`}></div>
                  <span className={`text-5xl mb-4 transition-transform duration-300 ${notificationMethod === 'none' ? 'scale-110 drop-shadow-[0_0_15px_rgba(200,154,81,0.5)]' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>🔕</span>
                  <div className="w-full text-center">
                    <span className={`font-display font-bold text-lg uppercase tracking-wider ${notificationMethod === 'none' ? 'text-[var(--color-bone)]' : 'text-[var(--color-ash)] group-hover:text-[var(--color-bone)]'}`}>In-App</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Action Footer */}
      <div className="fixed bottom-24 w-full z-40 bg-gradient-to-t from-[var(--color-abyss)] via-[var(--color-abyss)]/90 to-transparent pb-4 px-6 pt-10 pointer-events-none">
        <div className="flex flex-col gap-3 max-w-md mx-auto pointer-events-auto">
          {step === 5 && (
            <button 
              onClick={recalculatePool}
              className="w-full h-12 bg-[var(--color-abyss)] border border-[var(--color-ash)] font-display font-bold text-[var(--color-bone)] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-charcoal)] active:scale-[0.98] transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            >
              <RefreshCw size={14} /> RECALCULATE ROUTINE
            </button>
          )}
          <div className="h-16 flex gap-4 w-full">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="w-16 h-14 rounded-none border border-gray-800 flex items-center justify-center text-[var(--color-ash)] tap-scale bg-[var(--color-charcoal)] hover:text-[var(--color-bone)] hover:border-[var(--color-ash)] transition-colors shadow-sm"
            >
              <span className="font-display font-bold text-2xl leading-none -mt-1">←</span>
            </button>
          )}
          
          <button 
            onClick={step === 6 ? completeOnboarding : nextStep}
            disabled={
              (step === 2 && muscles.length === 0) ||
              (step === 3 && !course) ||
              (step === 4 && (!workStartTime || !workEndTime)) ||
              (step === 5 && !spotter) ||
              (step === 6 && !notificationMethod)
            }
            className={`flex-1 h-14 rounded-none text-[var(--color-abyss)] font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2 tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
              step === 6 && notificationMethod === 'telegram' ? 'bg-[#2AABEE] text-white hover:bg-blue-400' : 'bg-[var(--color-bronze)] hover:bg-yellow-600 shadow-[0_0_15px_rgba(200,154,81,0.2)]'
            }`}
          >
            {step === 6 
              ? (notificationMethod === 'telegram' ? 'Connect Telegram' : 'Complete Setup') 
              : 'CONTINUE'} 
          </button>
        </div>
        </div>
      </div>

      {/* ----------------- BOTTOM NAV ----------------- */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-transparent pb-safe px-4 z-50">
        <div className="h-24 flex items-center justify-center pb-4">
          <div className="flex items-center bg-[var(--color-charcoal)]/90 backdrop-blur-md rounded-full p-2 border border-gray-800 shadow-2xl w-full max-w-md mx-auto h-[72px]">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 text-gray-500 hover:text-gray-300"
            >
              <span className="text-2xl mb-1">⚔️</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">Arena</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 text-gray-500 hover:text-gray-300"
            >
              <span className="text-2xl mb-1">🔥</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">History</span>
            </button>
            <button 
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 text-[var(--color-bronze)]"
            >
              <span className="text-2xl mb-1 drop-shadow-[0_0_10px_rgba(200,154,81,0.5)] scale-110">⚙️</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">Settings</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
