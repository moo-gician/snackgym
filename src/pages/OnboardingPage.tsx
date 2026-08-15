import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { saveOnboardingData } from '../lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Home, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import BodyMap from '../components/BodyMap';
import { IconBodyweight, IconDumbbell, IconPullupBar, IconMat, IconBand, IconBarbell, IconBench } from '../components/EquipmentIcons';

type CourseType = 'MICRO' | 'COMPACT' | 'CIRCUIT' | null;
type SpotterType = 'SPARTAN' | 'TSUNDERE' | 'ANGEL' | null;
type NotificationMethod = 'telegram' | 'email' | 'none' | null;

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
  const [sessionsPerDay, setSessionsPerDay] = useState(() => Number(sessionStorage.getItem('ob_sessions')) || 6);
  const [activeDays, setActiveDays] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('ob_activeDays');
    return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5]; // Mon-Fri default
  });

  const [spotter, setSpotter] = useState<SpotterType>(() => {
    return (sessionStorage.getItem('ob_spotter') as SpotterType) || null;
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
          if (data.equipment && data.equipment.length > 0) setEquipment(data.equipment);
          if (data.targetMuscles && data.targetMuscles.length > 0) setMuscles(data.targetMuscles);
          if (data.course) setCourse(data.course);
          if (data.workStartTime) setWorkStartTime(data.workStartTime);
          if (data.workEndTime) setWorkEndTime(data.workEndTime);
          if (data.sessionsPerDay) setSessionsPerDay(data.sessionsPerDay);
          if (data.activeDays) setActiveDays(data.activeDays);
          if (data.spotter) setSpotter(data.spotter);
          if (data.notificationMethod) setNotificationMethod(data.notificationMethod);
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
  useEffect(() => sessionStorage.setItem('ob_sessions', sessionsPerDay.toString()), [sessionsPerDay]);
  useEffect(() => sessionStorage.setItem('ob_activeDays', JSON.stringify(activeDays)), [activeDays]);
  useEffect(() => { if (spotter) sessionStorage.setItem('ob_spotter', spotter); }, [spotter]);
  useEffect(() => { if (notificationMethod) sessionStorage.setItem('ob_notif', notificationMethod); }, [notificationMethod]);

  const nextStep = () => setStep(s => Math.min(6, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

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
        sessionsPerDay,
        activeDays,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        spotter: spotter as any,
        notificationMethod: notificationMethod as any
      });
      
      console.log("Onboarding data saved successfully!");
      
      // Cleanup session storage
      ['ob_equipment', 'ob_muscles', 'ob_course', 'ob_workStart', 'ob_workEnd', 'ob_sessions', 'ob_activeDays', 'ob_spotter', 'ob_notif'].forEach(k => sessionStorage.removeItem(k));

      if (notificationMethod === 'telegram') {
        const telegramUrl = `https://t.me/SnackGym_Supporter_Bot?start=${user.uid}`;
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
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div 
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= idx ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 animate-fade-in-up">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-6">What's in your workspace?</h1>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { id: 'Bodyweight', Icon: IconBodyweight, label: 'Bodyweight' },
                { id: 'Dumbbell', Icon: IconDumbbell, label: 'Dumbbells' },
                { id: 'PullupBar', Icon: IconPullupBar, label: 'Pull-up Bar' },
                { id: 'Mat', Icon: IconMat, label: 'Yoga Mat' },
                { id: 'Band', Icon: IconBand, label: 'Resistance Band' },
                { id: 'Barbell', Icon: IconBarbell, label: 'Barbell' },
                { id: 'Bench', Icon: IconBench, label: 'Bench' },
              ].map(item => {
                const eq = item.id;
                const isSelected = equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    disabled={eq === 'Bodyweight'}
                    onClick={() => setEquipment(prev => 
                      prev.includes(eq) ? prev.filter(i => i !== eq) : [...prev, eq]
                    )}
                    className={`group aspect-[5/4] rounded-3xl border flex flex-col items-center justify-center text-center tap-scale transition-all overflow-hidden relative ${
                      isSelected 
                        ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${eq === 'Bodyweight' ? 'opacity-90' : ''}`}
                  >
                    <div className={`w-14 h-14 flex items-center justify-center transition-transform duration-300 ${isSelected ? '-translate-y-3 scale-110' : 'group-hover:-translate-y-3 group-hover:scale-110'}`}>
                      <item.Icon />
                    </div>
                    <div className={`absolute bottom-3 left-0 w-full text-center transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className={`font-bold text-xs ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-6">What do you want to pump?</h1>
            <div className="mt-8">
              <BodyMap selectedMuscles={muscles} onChange={setMuscles} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Pick your routine style</h1>
            
            <div className="grid grid-cols-1 gap-4 mt-8">
              <button 
                onClick={() => setCourse('MICRO')}
                className={`group w-full h-40 rounded-3xl border flex flex-col items-center justify-center p-4 transition-all ${
                  course === 'MICRO' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`text-6xl mb-3 transition-transform duration-300 ${course === 'MICRO' ? 'scale-110' : 'group-hover:scale-110'}`}>⚡</span>
                <div className="text-center flex flex-col">
                  <span className={`font-bold text-lg ${course === 'MICRO' ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>Micro Snack (1-2m)</span>
                  <span className="text-xs text-gray-500">1 set. Right at your desk.</span>
                </div>
              </button>

              <button 
                onClick={() => setCourse('COMPACT')}
                className={`group w-full h-40 rounded-3xl border flex flex-col items-center justify-center p-4 transition-all ${
                  course === 'COMPACT' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`text-6xl mb-3 transition-transform duration-300 ${course === 'COMPACT' ? 'scale-110' : 'group-hover:scale-110'}`}>🔥</span>
                <div className="text-center flex flex-col">
                  <span className={`font-bold text-lg ${course === 'COMPACT' ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>Compact Target (3-5m)</span>
                  <span className="text-xs text-gray-500">0 rest. Max pump.</span>
                </div>
              </button>

              <button 
                onClick={() => setCourse('CIRCUIT')}
                className={`group w-full h-40 rounded-3xl border flex flex-col items-center justify-center p-4 transition-all ${
                  course === 'CIRCUIT' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`text-6xl mb-3 transition-transform duration-300 ${course === 'CIRCUIT' ? 'scale-110' : 'group-hover:scale-110'}`}>👑</span>
                <div className="text-center flex flex-col">
                  <span className={`font-bold text-lg ${course === 'CIRCUIT' ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>Short Circuit (6-10m)</span>
                  <span className="text-xs text-gray-500">Full body recharge loop.</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Set your schedule</h1>

            <div className="mt-8 bg-white p-5 rounded-3xl border border-gray-200">
              <span className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">Active Days</span>
              <div className="flex justify-between gap-1">
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
                      onClick={() => setActiveDays(prev => 
                        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
                      )}
                      className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all tap-scale ${
                        isActive 
                          ? 'bg-[var(--color-primary)] text-white shadow-md shadow-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <div className="flex-1 bg-white p-5 rounded-3xl border border-gray-200 flex flex-col items-center">
                <span className="text-4xl mb-4 block">🌅</span>
                <span className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Start</span>
                <input type="time" value={workStartTime} onChange={e => setWorkStartTime(e.target.value)} className="w-full text-center font-bold text-xl outline-none bg-transparent" />
              </div>
              <div className="flex-1 bg-white p-5 rounded-3xl border border-gray-200 flex flex-col items-center">
                <span className="text-4xl mb-4 block">🌃</span>
                <span className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">End</span>
                <input type="time" value={workEndTime} onChange={e => setWorkEndTime(e.target.value)} className="w-full text-center font-bold text-xl outline-none bg-transparent" />
              </div>
            </div>
            
            <div className="mt-6 bg-white p-5 rounded-3xl border border-gray-200 flex flex-col items-center">
              <span className="text-4xl mb-4 block">🎯</span>
              <span className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Daily Goal</span>
              <select value={sessionsPerDay} onChange={e => setSessionsPerDay(Number(e.target.value))} className="text-center font-bold text-xl outline-none bg-transparent w-full">
                <option value={4}>4 times / day</option>
                <option value={6}>6 times / day (Recommended)</option>
                <option value={8}>8 times / day</option>
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Choose your spotter</h1>
            
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { id: 'SPARTAN', emoji: '🤬', label: 'Spartan' },
                { id: 'TSUNDERE', emoji: '😒', label: 'Tsundere' },
                { id: 'ANGEL', emoji: '🥰', label: 'Angel' },
              ].map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setSpotter(sp.id as SpotterType)}
                  className={`group aspect-[3/4] rounded-3xl flex flex-col items-center justify-center border transition-all ${
                    spotter === sp.id 
                      ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`text-6xl mb-2 transition-transform duration-300 ${spotter === sp.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {sp.emoji}
                  </span>
                  <div className="w-full text-center">
                    <span className={`font-bold text-sm ${spotter === sp.id ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>{sp.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {spotter && (
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm italic text-gray-600 animate-fade-in-up">
                {spotter === 'SPARTAN' && `"Get up, lazy bones! Time to crush it! 🤬"`}
                {spotter === 'TSUNDERE' && `"It's time to work out... Not that I care if you get fit. 😒"`}
                {spotter === 'ANGEL' && `"You're doing great! Keep it up! Let's do a quick session! 🥰"`}
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 flex flex-col items-center text-center pt-10">
            <h1 className="text-3xl font-bold mb-6">Almost Done!</h1>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => setNotificationMethod('telegram')}
                className={`group aspect-square rounded-3xl border flex flex-col items-center justify-center p-4 transition-all ${
                  notificationMethod === 'telegram' ? 'border-[#2AABEE] bg-[#E8F5FE]' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`text-6xl mb-2 transition-transform duration-300 ${notificationMethod === 'telegram' ? 'scale-110' : 'group-hover:scale-110'}`}>✈️</span>
                <div className="w-full text-center">
                  <span className={`font-bold text-sm ${notificationMethod === 'telegram' ? 'text-[#2AABEE]' : 'text-gray-500'}`}>Telegram</span>
                </div>
              </button>

              <button 
                onClick={() => setNotificationMethod('none')}
                className={`group aspect-square rounded-3xl border flex flex-col items-center justify-center p-4 transition-all ${
                  notificationMethod === 'none' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`text-6xl mb-2 transition-transform duration-300 ${notificationMethod === 'none' ? 'scale-110' : 'group-hover:scale-110'}`}>🔕</span>
                <div className="w-full text-center">
                  <span className={`font-bold text-sm ${notificationMethod === 'none' ? 'text-gray-600' : 'text-gray-500'}`}>In-App</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-[68px] left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-30 pointer-events-none">
        <div className="max-w-md mx-auto flex gap-4 pointer-events-auto">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 tap-scale bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={24} />
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
            className={`flex-1 h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 tap-scale disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg ${
              step === 6 && notificationMethod === 'telegram' ? 'bg-[#2AABEE] shadow-[#2AABEE]/30' : 'bg-[#1A2E1A] shadow-black/10'
            }`}
          >
            {step === 6 
              ? (notificationMethod === 'telegram' ? 'Connect Telegram' : 'Complete Setup') 
              : 'Next'} 
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* ----------------- BOTTOM NAV ----------------- */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 pb-safe z-40">
        <div className="flex items-center justify-around p-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col items-center p-2 transition-colors text-gray-400 hover:text-gray-600"
          >
            <Home size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col items-center p-2 transition-colors text-gray-400 hover:text-gray-600"
          >
            <BarChart2 size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Progress</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col items-center p-2 transition-colors text-[var(--color-primary)]"
          >
            <SettingsIcon size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
