import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { recordSessionComplete } from '../lib/firestore';
// @ts-ignore - using basic confetti or custom animation if needed.
// For now we'll simulate confetti with CSS.

export default function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [confetti, setConfetti] = useState<string | null>(null);

  // Mock data for MVP UI testing
  const exercises = [
    { id: 'ex1', name: 'Dumbbell Bench Press', weight: '12kg', reps: 12 },
    { id: 'ex2', name: 'One-Arm Dumbbell Row', weight: '14kg', reps: 10 },
  ];

  const handleCheck = (exId: string) => {
    if (!completed[exId]) {
      setConfetti(exId);
      setTimeout(() => setConfetti(null), 1000);
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
      if (!window.confirm("Unchecked exercises will be skipped. End session?")) {
        return;
      }
    }
    
    if (auth.currentUser) {
      const earnedCalories = calculateCalories();
      try {
        await recordSessionComplete(auth.currentUser.uid, earnedCalories);
      } catch (err) {
        console.error("Failed to save session record:", err);
      }
    }
    navigate('/dashboard');
  };

  const handleFullSkip = () => {
    if (window.confirm("Skip entire session? (This will affect your completion stats)")) {
      navigate('/dashboard');
    }
  };

  const allCompleted = exercises.every(ex => completed[ex.id]);

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col max-w-md mx-auto relative bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⚡ Compact Assault</h1>
          <p className="text-sm text-gray-500">Session {id}</p>
        </div>
        <button onClick={handleFullSkip} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
          Skip All
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {exercises.map(ex => (
          <div 
            key={ex.id}
            onClick={() => handleCheck(ex.id)}
            className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden ${
              completed[ex.id] 
                ? 'border-[var(--color-primary)] bg-[#F0FCF2] scale-[0.98] opacity-60' 
                : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
            }`}
          >
            {confetti === ex.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-5xl animate-ping">🎉</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold transition-all ${completed[ex.id] ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {ex.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {ex.weight} / {ex.reps} reps
                </p>
              </div>
              <div className={`transition-transform duration-300 ${completed[ex.id] ? 'scale-110 text-[var(--color-primary)]' : 'text-gray-300'}`}>
                {completed[ex.id] ? <CheckCircle2 size={32} /> : <Circle size={32} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => handleFinish(!allCompleted)}
            className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 tap-scale transition-all ${
              allCompleted 
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-green-200' 
                : 'bg-gray-800 text-white'
            }`}
          >
            {allCompleted ? '🎉 Finish!' : 'Finish Early (Skip remaining)'}
          </button>
        </div>
      </div>
    </div>
  );
}
