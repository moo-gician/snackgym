import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { recordSessionComplete } from '../lib/firestore';

export default function SessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scheduledTime = searchParams.get('time');
  
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [spark, setSpark] = useState<string | null>(null);

  const firstName = auth.currentUser?.displayName?.split(' ')[0] || 'Recruit';

  const quotes = useMemo(() => [
    `You're already here. Quitting now would be embarrassing, ${firstName}.`,
    `Those weights won't lift themselves, ${firstName}. Get moving.`,
    `Pain is just weakness leaving your body. Do not stop.`,
    `Excuses burn zero calories. Let's see what you've got.`,
    `I've seen better form from a wet noodle. Prove me wrong, ${firstName}.`
  ], [firstName]);

  const [targetQuote, setTargetQuote] = useState('');
  const [displayedQuote, setDisplayedQuote] = useState('');

  useEffect(() => {
    setTargetQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [quotes]);

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

  // Mock data for MVP UI testing
  const exercises = [
    { id: 'ex1', emoji: '🦾', name: 'Dumbbell Bench Press', weight: '12kg', reps: 12, muscle: 'Chest' },
    { id: 'ex2', emoji: '🦾', name: 'One-Arm Dumbbell Row', weight: '14kg', reps: 10, muscle: 'Back' },
  ];

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
      if (ex.weight) {
        const match = ex.weight.match(/\d+/);
        if (match) weightVal = parseInt(match[0], 10);
      }
      
      const weightMultiplier = (weightVal * 0.01) + 1;
      return total + (ex.reps * baseKcal * weightMultiplier);
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
              {scheduledTime ? `SCHEDULED STRIKE` : `UNSCHEDULED STRIKE`}
            </p>
          </div>
        </div>

        {/* Spotter UI */}
        <div className="mb-8 relative animate-fade-in-up">
          <div className="absolute -left-2 top-0 w-1 h-full bg-[var(--color-blood)]"></div>
          <div className="bg-[var(--color-charcoal)] border border-gray-800 p-4 pl-6 relative shadow-lg">
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

      <div className="flex-1 space-y-4">
        {exercises.map(ex => (
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
                  {ex.emoji}
                </span>
                <div>
                  <h3 className={`text-xl font-display font-bold uppercase tracking-wider transition-all ${completed[ex.id] ? 'line-through text-gray-600' : 'text-[var(--color-bone)]'}`}>
                    {ex.name}
                  </h3>
                  <p className={`text-sm mt-1 font-bold tracking-widest uppercase ${completed[ex.id] ? 'text-gray-700' : 'text-[var(--color-ash)]'}`}>
                    ({ex.muscle}) {ex.weight} / {ex.reps} reps
                  </p>
                </div>
              </div>
              <div className={`transition-transform duration-300 shrink-0 ${completed[ex.id] ? 'scale-110 text-[var(--color-bronze)]' : 'text-gray-700'}`}>
                {completed[ex.id] ? <CheckCircle2 size={32} /> : <Circle size={32} />}
              </div>
            </div>
          </div>
        ))}
      </div>
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
