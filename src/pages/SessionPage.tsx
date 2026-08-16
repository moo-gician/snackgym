import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, User, Plus } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { recordSessionComplete } from '../lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import type { Exercise } from '../lib/exerciseDB';
import { generateSessionExercises } from '../lib/sessionGenerator';

export default function SessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scheduledTime = searchParams.get('time');
  
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [spark, setSpark] = useState<string | null>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [courseType, setCourseType] = useState<'MICRO'|'COMPACT'|'CIRCUIT'>('MICRO');
  const [dayName, setDayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const firstName = auth.currentUser?.displayName?.split(' ')[0] || 'Recruit';

  const quotes = useMemo(() => [
    `You're already here. Quitting now would be embarrassing, ${firstName}.`,
    `Those weights won't lift themselves, ${firstName}. Get moving.`,
    `Pain is just weakness leaving your body, ${firstName}. Do not stop.`,
    `Excuses burn zero calories, ${firstName}. Let's see what you've got.`,
    `I've seen better form from a wet noodle. Prove me wrong, ${firstName}.`,
    `This is where the magic happens, ${firstName}. Keep pushing!`,
    `Your mind will quit a thousand times before your body does, ${firstName}.`,
    `Don't count the days, ${firstName}, make the days count.`,
    `Sweat is magic, ${firstName}. Cover yourself in it daily.`,
    `${firstName}, the only bad workout is the one that didn't happen.`,
    `You are stronger than you think, ${firstName}. Show me!`,
    `${firstName}, resting is for when you're done, not when you're tired.`,
    `Embrace the suck, ${firstName}. That's where growth lives.`,
    `Are you going to talk about it or be about it, ${firstName}?`,
    `Rome wasn't built in a day, but they worked on it every single day, ${firstName}.`,
    `Focus, ${firstName}! Mind muscle connection.`,
    `You can either suffer the pain of discipline or the pain of regret, ${firstName}.`,
    `${firstName}, every drop of sweat is a down payment on your goals.`,
    `Leave it all on the floor, ${firstName}. No regrets.`,
    `This is your arena, ${firstName}. Conquer it!`
  ], [firstName]);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [targetQuote, setTargetQuote] = useState('');
  const [displayedQuote, setDisplayedQuote] = useState('');

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * 20));
  }, []);

  useEffect(() => {
    setTargetQuote(quotes[quoteIndex % quotes.length]);
  }, [quoteIndex, quotes]);

  const handleSpotterClick = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setQuoteIndex(prev => prev + 1);
  };

  useEffect(() => {
    if (!targetQuote) return;
    setDisplayedQuote('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedQuote(targetQuote.substring(0, i));
      if (i > targetQuote.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [targetQuote]);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const customPool = data.customExercisePool || {};
          const course = data.course || 'MICRO';
          setCourseType(course);
          
          let splitIdx = data.currentSplitIndex || 0;
          
          // Logic: check if last completed date is not today. If not, and they completed something yesterday, advance splitIndex.
          // For MVP, we will advance splitIndex after handleFinish. Here we just read it.
          const dayKeys = Object.keys(customPool);
          if (dayKeys.length > 0) {
            const todayKey = dayKeys[splitIdx % dayKeys.length];
            setDayName(todayKey);
            const availableIds = customPool[todayKey] || [];
            setPoolIds(availableIds);
            
            // Generate initial list
            if (availableIds.length > 0) {
              const generated = generateSessionExercises(availableIds, course, []);
              setExercises(generated);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load session data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Wait for auth to be ready
    const unsub = auth.onAuthStateChanged(user => {
      if (user) loadData();
    });
    return () => unsub();
  }, []);

  const addMoreExercises = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    const existingIds = exercises.map(ex => ex.id);
    const updated = generateSessionExercises(poolIds, courseType, existingIds);
    setExercises(updated);
  };

  const handleCheck = (exId: string) => {
    if (!completed[exId]) {
      setSpark(exId);
      setTimeout(() => setSpark(null), 800);
    }
    setCompleted(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const calculateCalories = () => {
    return exercises.reduce((total, ex) => {
      if (!completed[ex.id]) return total;
      
      let baseKcal = 0.1; // default
      const name = ex.name.toLowerCase();
      if (name.includes('press') || name.includes('squat') || name.includes('pull') || name.includes('row')) {
        baseKcal = 0.15;
      } else if (name.includes('curl') || name.includes('raise') || name.includes('fly')) {
        baseKcal = 0.05;
      }

      let weightVal = 0;
      if (typeof ex.baseWeight === 'string') {
        const match = ex.baseWeight.match(/\d+/);
        if (match) weightVal = parseInt(match[0], 10);
      } else if (typeof ex.baseWeight === 'number') {
        weightVal = ex.baseWeight;
      }
      
      let repsVal = 10;
      if (typeof ex.baseReps === 'number') {
        repsVal = ex.baseReps;
      } else if (typeof ex.baseReps === 'string') {
        const match = ex.baseReps.match(/\d+/);
        if (match) repsVal = parseInt(match[0], 10);
      }

      const weightMultiplier = (weightVal * 0.01) + 1;
      return total + (repsVal * baseKcal * weightMultiplier);
    }, 0);
  };

  const handleFinish = async (isEarly: boolean) => {
    const firstName = auth.currentUser?.displayName?.split(' ')[0] || 'Recruit';
    
    if (isEarly) {
      if (!window.confirm(`Cowardice recorded, ${firstName}. Your spotter will remember this. Unchecked exercises will be skipped. Retreat?`)) {
        return;
      }
    }
    
    if (auth.currentUser) {
      const earnedCalories = calculateCalories();
      if (earnedCalories > 0) {
        try {
          await recordSessionComplete(auth.currentUser.uid, earnedCalories, scheduledTime || undefined);
        } catch (err) {
          console.error("Failed to save session record:", err);
        }
      }
    }
    navigate('/dashboard');
  };

  const allCompleted = exercises.every(ex => completed[ex.id]);

  return (
    <div className="min-h-screen pb-24 flex flex-col relative bg-[var(--color-abyss)] text-[var(--color-ash)] font-sans">
      
      {/* GLOBAL HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--color-abyss)]/80 backdrop-blur-xl pt-safe border-b border-gray-900">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <img alt="B.E.A.S.T. Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLvL3hsJ2y4za4DRON2I13kxqT-k84HauYfDzQw6W6u3cozHNVsMbONuPLoKkpVT9dK2a1_u0uo5vksj3dc0-FFdlJ-HgueDt5Cr7wA0Nbke59Hpo54CjjZVI1U9V7fLylSFWlbOuYQr89qYPV01DmM5z23_uMNsQEX5cTcUVnv7nVqkVilcjqh6NlXdPTs3E1aAlwUkt9IGCc1g546aHK--oY8-vDnNFeA2ALgnjZJX0QPTTSslf65rvyo" />
            <span className="font-display font-bold text-[16px] uppercase tracking-wider text-[var(--color-bronze)] leading-none mt-1">Active Assault</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-none border border-[var(--color-bronze)] bg-[var(--color-abyss)] flex items-center justify-center shadow-[0_0_10px_rgba(200,154,81,0.2)] hover:bg-[var(--color-charcoal)] transition-colors">
            <User size={18} className="text-[var(--color-bronze)]" />
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pt-24">
        {/* Session Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-[var(--color-bone)]">
              {scheduledTime ? `${scheduledTime} SESSION` : 'MANUAL ASSAULT'}
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-blood)] mt-1">
              {scheduledTime ? `SCHEDULED STRIKE` : `UNSCHEDULED STRIKE`} {dayName ? `// ${dayName}` : ''}
            </p>
          </div>
        </div>

        {/* Spotter UI */}
        <div className="mb-8 relative animate-fade-in-up">
          <div className="absolute -left-2 top-0 w-1 h-full bg-[var(--color-blood)]"></div>
          <div 
            onClick={handleSpotterClick}
            className="bg-[var(--color-charcoal)] border border-gray-800 p-4 pl-6 relative shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--color-blood)] shrink-0 bg-[var(--color-abyss)] shadow-[0_0_10px_rgba(217,26,26,0.3)]">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD51FeObMtC6z6ZBtJD8p6aNUgd5xOxJmaxBhjMam0av-ygMXreK223xu94s9zt2p0xexAYJZAN4j31JplRuwrkCgLsWb8f83fxT7FPPVmbI5JuNU5V6i1OMfNdTD7agx2yArUXmxHdaESYc-KnNuwfRu_b86KMi9AsmxCZG_jUf5rrpUhP3VE8saA2CZO1DXeM24KLHR-xUTzAOY3yJ88F9Ct03InCCfqxmjaoHErs8D0xqnq108-0" alt="Spartan Spotter" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-headline-md text-[var(--color-blood)] uppercase tracking-wider block mb-1">Spartan Spotter</span>
                <p className="font-body-md text-[var(--color-bone)] italic leading-snug min-h-[3rem]">
                  {displayedQuote}
                  <span className="animate-pulse opacity-50 ml-1 block inline-block w-2 h-4 bg-[var(--color-blood)] align-middle"></span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="text-[var(--color-bronze)] font-display font-bold animate-pulse uppercase tracking-widest">Calibrating Weapons...</span>
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {exercises.map(ex => {
              const emoji = ex.equipment === 'Dumbbell' ? '🦾' : ex.equipment === 'Mat' ? '🧘' : ex.equipment === 'PullupBar' ? '🐒' : ex.equipment === 'Bodyweight' ? '🤸' : '🏋️';
              return (
                <div 
                  key={ex.id}
                  onClick={() => handleCheck(ex.id)}
                  className={`relative p-5 rounded-none border transition-all cursor-pointer overflow-hidden ${
                    completed[ex.id] 
                      ? 'border-[var(--color-bronze)] bg-[var(--color-abyss)] opacity-60 shadow-[0_0_10px_rgba(200,154,81,0.2)]' 
                      : 'border-gray-800 bg-[var(--color-charcoal)] hover:border-[var(--color-ash)]'
                  }`}
                >
                  {spark === ex.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-6xl animate-pulse">💥</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex gap-4 items-start">
                      <span className={`text-2xl mt-0.5 transition-all duration-300 ${completed[ex.id] ? 'grayscale opacity-50' : ''}`}>
                        {emoji}
                      </span>
                      <div>
                        <h3 className={`text-xl font-display font-bold uppercase tracking-wider transition-all ${completed[ex.id] ? 'line-through text-gray-600' : 'text-[var(--color-bone)]'}`}>
                          {ex.name}
                        </h3>
                        <p className={`text-sm mt-1 font-bold tracking-widest uppercase ${completed[ex.id] ? 'text-gray-700' : 'text-[var(--color-ash)]'}`}>
                          ({ex.muscleGroup}) {ex.baseWeight} / {ex.baseReps} {typeof ex.baseReps === 'number' ? 'reps' : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 shrink-0 ${completed[ex.id] ? 'scale-110 text-[var(--color-bronze)]' : 'text-gray-700'}`}>
                      {completed[ex.id] ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                    </div>
                  </div>
                </div>
              );
            })}

            {exercises.length > 0 && exercises.length < poolIds.length && (
              <button 
                onClick={addMoreExercises}
                className="w-full mt-6 py-4 border-2 border-dashed border-[var(--color-bronze)]/50 text-[var(--color-bronze)] hover:bg-[var(--color-bronze)] hover:text-[var(--color-abyss)] transition-all font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus size={20} /> I CAN DO MORE
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-abyss)] via-[var(--color-abyss)] to-transparent">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => handleFinish(!allCompleted)}
            className={`w-full h-16 rounded-none font-display font-bold text-xl uppercase tracking-widest flex items-center justify-center gap-2 tap-scale transition-all border ${
              allCompleted 
                ? 'bg-[var(--color-bronze)] text-[var(--color-abyss)] border-[var(--color-bronze)] shadow-[0_0_20px_rgba(200,154,81,0.4)]' 
                : 'bg-[var(--color-charcoal)] text-[var(--color-blood)] border-[var(--color-blood)] hover:bg-[var(--color-blood)] hover:text-[var(--color-abyss)]'
            }`}
          >
            {allCompleted ? `⚔️ Glory Achieved, ${auth.currentUser?.displayName?.split(' ')[0] || ''}`.trim() : 'Retreat Early'}
          </button>
        </div>
      </div>
    </div>
  );
}
