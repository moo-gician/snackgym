type BodyMapProps = {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
};

// Organized by side and order from top to bottom
const MUSCLES = [
  { id: 'Shoulders', label: 'Shoulders', side: 'left' },
  { id: 'Back', label: 'Back', side: 'left' },
  { id: 'Biceps', label: 'Biceps', side: 'left' },
  { id: 'Glutes', label: 'Glutes', side: 'left' },
  
  { id: 'Chest', label: 'Chest', side: 'right' },
  { id: 'Triceps', label: 'Triceps', side: 'right' },
  { id: 'Core', label: 'Core', side: 'right' },
  { id: 'Legs', label: 'Legs', side: 'right' },
];

export default function BodyMap({ selectedMuscles, onChange }: BodyMapProps) {
  const toggleMuscle = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    if (selectedMuscles.includes(id)) {
      onChange(selectedMuscles.filter(m => m !== id));
    } else {
      onChange([...selectedMuscles, id]);
    }
  };

  const leftMuscles = MUSCLES.filter(m => m.side === 'left');
  const rightMuscles = MUSCLES.filter(m => m.side === 'right');

  const renderMuscleButton = (m: typeof MUSCLES[0]) => {
    const isSelected = selectedMuscles.includes(m.id);
    return (
      <button 
        key={m.id}
        onClick={() => toggleMuscle(m.id)}
        className={`pointer-events-auto group relative px-4 py-3 md:py-4 font-display font-bold text-xs md:text-sm uppercase tracking-widest rounded-none border transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 ${
          isSelected 
            ? 'bg-[var(--color-blood)]/20 text-[var(--color-blood)] border-[var(--color-blood)]/50 shadow-[0_0_15px_rgba(197,0,13,0.2)]' 
            : 'bg-[var(--color-charcoal)] text-white border-gray-700 hover:border-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
        }`}
      >
        {isSelected && <span className="w-2 h-2 bg-[var(--color-blood)] rounded-full animate-pulse"></span>}
        {m.label}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none relative pb-4">
      
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"></rect>
        </svg>
      </div>

      {/* Human Body Map Container */}
      <div className="relative flex-1 flex justify-center py-4 w-full h-[55vh] max-h-[550px] min-h-[450px]">
        
        {/* The warrior image fills the height and centers */}
        <img 
          alt="Warrior Muscle Map" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp91qYJ0ZDXVd73s-6NDwPG7PoTpae0qkUmFFVfTUYFfrPYUy9wUrcP3Ih6DiYQb7-ZEH61_xW5fwn6Z2A1EsVIO85W7wN6WN-QOGLCTNfzQ3D7wgyyxB5HxebZ2zj7z-9OjMRM_FOQCZf_71vcfKpYh25ET7gabC3JkARtO2SuQi-Rt3oWJ2mXMbO9bhL8qmGMDhYlciDxtEXGMMupmlLpVXZAjW4zkDLtBrzTj-6YYAm9YFvP3vZ"
          className="h-full object-contain drop-shadow-[0_0_15px_rgba(200,154,81,0.1)] z-10"
        />

        {/* Overlay buttons evenly spaced */}
        <div className="absolute inset-0 flex justify-between px-2 py-4 pointer-events-none z-20">
          
          {/* Left Column */}
          <div className="flex flex-col justify-evenly items-start h-full w-1/2">
            {leftMuscles.map(renderMuscleButton)}
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-evenly items-end h-full w-1/2">
            {rightMuscles.map(renderMuscleButton)}
          </div>

        </div>
      </div>
    </div>
  );
}
