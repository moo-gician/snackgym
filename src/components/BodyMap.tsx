type BodyMapProps = {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
};

const MUSCLES = [
  { id: '어깨', label: '어깨', side: 'left', y: 22 },
  { id: '가슴', label: '가슴', side: 'left', y: 35 },
  { id: '복근', label: '복근', side: 'left', y: 48 },
  { id: '하체', label: '하체', side: 'left', y: 70 },
  
  { id: '팔', label: '팔', side: 'right', y: 22 },
  { id: '등', label: '등', side: 'right', y: 35 },
  { id: '허리', label: '허리', side: 'right', y: 48 },
  { id: '둔근', label: '둔근', side: 'right', y: 65 },
];

export default function BodyMap({ selectedMuscles, onChange }: BodyMapProps) {
  const toggleMuscle = (id: string) => {
    if (selectedMuscles.includes(id)) {
      onChange(selectedMuscles.filter(m => m !== id));
    } else {
      onChange([...selectedMuscles, id]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="relative w-full max-w-sm h-[400px] mx-auto overflow-hidden">
        
        {/* Center Gray Silhouette */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
          <svg viewBox="0 0 100 200" className="h-[90%] text-gray-200 drop-shadow-sm" fill="currentColor">
            {/* Head */}
            <circle cx="50" cy="20" r="12" />
            
            {/* Torso & Legs */}
            <path d="M 35 40 
                     Q 50 37 65 40 
                     L 70 95 
                     L 60 105 
                     L 58 185 
                     C 58 190 50 190 51 185 
                     L 49 110
                     L 49 185 
                     C 50 190 42 190 42 185 
                     L 40 105 
                     L 30 95 Z" />
                     
            {/* Left Arm */}
            <path d="M 33 42 
                     C 22 45 15 65 14 85 
                     C 13 95 21 95 22 85 
                     L 28 65 Z" />
                     
            {/* Right Arm */}
            <path d="M 67 42 
                     C 78 45 85 65 86 85 
                     C 87 95 79 95 78 85 
                     L 72 65 Z" />
          </svg>
        </div>
        
        {/* Muscle Cards and Connecting Lines */}
        {MUSCLES.map(m => {
          const isSelected = selectedMuscles.includes(m.id);
          const isLeft = m.side === 'left';
          
          return (
            <div 
              key={m.id} 
              className="absolute flex items-center w-1/2"
              style={{ 
                top: `${m.y}%`, 
                left: isLeft ? 0 : '50%',
                flexDirection: isLeft ? 'row' : 'row-reverse'
              }}
            >
              {/* Card */}
              <button 
                onClick={() => toggleMuscle(m.id)}
                className={`z-20 px-3 py-2 text-[13px] font-bold rounded-xl border-2 transition-all bg-white whitespace-nowrap
                  ${isSelected ? 'border-[var(--color-primary)] text-[var(--color-primary)] shadow-md scale-105' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:scale-105'}
                `}
                style={{
                  marginLeft: isLeft ? '4px' : 'auto', 
                  marginRight: isLeft ? 'auto' : '4px' 
                }}
              >
                {m.label}
              </button>
              
              {/* Connecting Line (behind silhouette) */}
              <div 
                className={`flex-1 h-[2px] z-0 transition-colors duration-300 ${isSelected ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} 
              />
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {selectedMuscles.length === 0 ? (
          <span className="text-sm text-gray-400 font-medium">선택된 부위가 없습니다</span>
        ) : (
          selectedMuscles.map(m => (
            <span key={m} className="px-3 py-1 bg-[#F0FCF2] text-[var(--color-primary)] rounded-full text-sm font-bold shadow-sm">
              {m}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
