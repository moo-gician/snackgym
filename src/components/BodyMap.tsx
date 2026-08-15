import { useState } from 'react';

type BodyMapProps = {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
};

const MUSCLES = {
  FRONT: [
    { id: '가슴', label: '가슴 (Chest)', x: 50, y: 30 },
    { id: '복근', label: '복근 (Core)', x: 50, y: 45 },
    { id: '어깨', label: '어깨 (Shoulders)', x: 30, y: 25 },
    { id: '팔', label: '팔 (Arms)', x: 20, y: 40 },
    { id: '하체', label: '하체 (Legs)', x: 50, y: 70 },
  ],
  BACK: [
    { id: '등', label: '등 (Back)', x: 50, y: 35 },
    { id: '허리', label: '허리 (Lower Back)', x: 50, y: 50 },
    { id: '둔근', label: '둔근 (Glutes)', x: 50, y: 60 },
  ]
};

export default function BodyMap({ selectedMuscles, onChange }: BodyMapProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleMuscle = (id: string) => {
    if (selectedMuscles.includes(id)) {
      onChange(selectedMuscles.filter(m => m !== id));
    } else {
      onChange([...selectedMuscles, id]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Flip Container */}
      <div 
        className="relative w-64 h-96 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front Side */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-3xl shadow-sm flex items-center justify-center overflow-hidden">
            <div className="absolute top-4 left-4 font-bold text-gray-400 text-sm">FRONT</div>
            <div className="absolute bottom-4 text-xs text-gray-400">터치하여 뒷면 보기</div>
            
            {/* Simple silhouette representation */}
            <div className="w-24 h-64 bg-gray-100 rounded-full opacity-50 absolute"></div>
            
            {MUSCLES.FRONT.map(m => (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); toggleMuscle(m.id); }}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  selectedMuscles.includes(m.id) 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-600 border border-gray-300 shadow-sm hover:scale-105'
                }`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                {m.id}
              </button>
            ))}
          </div>

          {/* Back Side */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-3xl shadow-sm flex items-center justify-center overflow-hidden rotate-y-180">
            <div className="absolute top-4 right-4 font-bold text-gray-400 text-sm">BACK</div>
            <div className="absolute bottom-4 text-xs text-gray-400">터치하여 앞면 보기</div>
            
            {/* Simple silhouette representation */}
            <div className="w-24 h-64 bg-gray-100 rounded-full opacity-50 absolute"></div>
            
            {MUSCLES.BACK.map(m => (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); toggleMuscle(m.id); }}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  selectedMuscles.includes(m.id) 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-600 border border-gray-300 shadow-sm hover:scale-105'
                }`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                {m.id}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {selectedMuscles.length === 0 ? (
          <span className="text-sm text-gray-400">선택된 부위가 없습니다</span>
        ) : (
          selectedMuscles.map(m => (
            <span key={m} className="px-3 py-1 bg-[#F0FCF2] text-[var(--color-primary)] rounded-full text-sm font-bold">
              {m}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
