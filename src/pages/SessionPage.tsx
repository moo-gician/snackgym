import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { recordSessionComplete } from '../lib/firestore';

export default function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scheduledTime = searchParams.get('time');
  
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [spark, setSpark] = useState<string | null>(null);

  // Mock data for MVP UI testing
  const exercises = [
    { id: 'ex1', name: 'Dumbbell Bench Press', weight: '12kg', reps: 12 },
    { id: 'ex2', name: 'One-Arm Dumbbell Row', weight: '14kg', reps: 10 },
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
    if (isEarly) {
      if (!window.confirm("Cowardice recorded. Unchecked exercises will be skipped. Retreat?")) {
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

  const handleFullSkip = () => {
    if (window.confirm("Skip entire session? Your spotter will remember this.")) {
      navigate('/dashboard');
    }
  };

  const allCompleted = exercises.every(ex => completed[ex.id]);

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col max-w-md mx-auto relative bg-[var(--color-abyss)] text-[var(--color-ash)] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-[var(--color-bone)]">
            ⚡ {scheduledTime ? 'Scheduled Assault' : 'Compact Assault'}
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-blood)] mt-1">
            {scheduledTime ? `STRIKE TIME: ${scheduledTime}` : `Session ${id}`}
          </p>
        </div>
        <button onClick={handleFullSkip} className="px-3 py-1.5 bg-transparent border border-gray-800 text-[var(--color-ash)] rounded-none text-xs font-bold uppercase tracking-widest hover:border-[var(--color-blood)] hover:text-[var(--color-blood)] transition-all">
          Retreat
        </button>
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
              <div>
                <h3 className={`text-xl font-display font-bold uppercase tracking-wider transition-all ${completed[ex.id] ? 'line-through text-gray-600' : 'text-[var(--color-bone)]'}`}>
                  {ex.name}
                </h3>
                <p className={`text-sm mt-1 font-bold tracking-widest uppercase ${completed[ex.id] ? 'text-gray-700' : 'text-[var(--color-ash)]'}`}>
                  {ex.weight} / {ex.reps} reps
                </p>
              </div>
              <div className={`transition-transform duration-300 ${completed[ex.id] ? 'scale-110 text-[var(--color-bronze)]' : 'text-gray-700'}`}>
                {completed[ex.id] ? <CheckCircle2 size={32} /> : <Circle size={32} />}
              </div>
            </div>
          </div>
        ))}
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
            {allCompleted ? '⚔️ Glory Achieved' : 'Retreat Early'}
          </button>
        </div>
      </div>
    </div>
  );
}
