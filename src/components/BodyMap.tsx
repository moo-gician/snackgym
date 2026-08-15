type BodyMapProps = {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
};

const MUSCLES = [
  { id: 'Shoulders', label: 'Shoulders', side: 'left', y: 15, offset: '15%' },
  { id: 'Chest', label: 'Chest', side: 'right', y: 25, offset: '15%' },
  { id: 'Back', label: 'Back', side: 'left', y: 35, offset: '20%' },
  { id: 'Biceps', label: 'Biceps', side: 'left', y: 45, offset: '25%' },
  { id: 'Triceps', label: 'Triceps', side: 'right', y: 48, offset: '25%' },
  { id: 'Core', label: 'Core', side: 'right', y: 58, offset: '12%' },
  { id: 'Glutes', label: 'Glutes', side: 'left', y: 65, offset: '15%' },
  { id: 'Legs', label: 'Legs', side: 'right', y: 78, offset: '15%' },
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

        {/* Overlay buttons and lines */}
        {MUSCLES.map(m => {
          const isSelected = selectedMuscles.includes(m.id);
          const isLeft = m.side === 'left';
          
          return (
            <div 
              key={m.id}
              className="absolute w-full px-2 pointer-events-none z-20 flex items-center"
              style={{ top: `${m.y}%` }}
            >
              {isLeft ? (
                <>
                  <button 
                    onClick={() => toggleMuscle(m.id)}
                    className={`pointer-events-auto group relative px-4 py-2 font-display font-bold text-xs md:text-sm uppercase tracking-widest rounded-none border transition-all active:scale-95 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-[var(--color-bronze)] text-[var(--color-abyss)] border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.4)]' 
                        : 'bg-[var(--color-charcoal)] text-[var(--color-ash)] border-gray-700 hover:border-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {m.label}
                  </button>
                  <div 
                    className={`flex-1 h-[1px] transition-colors duration-300 ${isSelected ? 'bg-[var(--color-bronze)]' : 'bg-gray-700'}`} 
                    style={{ marginRight: `calc(50% - ${m.offset})` }} 
                  />
                </>
              ) : (
                <>
                  <div 
                    className={`flex-1 h-[1px] transition-colors duration-300 ${isSelected ? 'bg-[var(--color-bronze)]' : 'bg-gray-700'}`} 
                    style={{ marginLeft: `calc(50% - ${m.offset})` }} 
                  />
                  <button 
                    onClick={() => toggleMuscle(m.id)}
                    className={`pointer-events-auto group relative px-4 py-2 font-display font-bold text-xs md:text-sm uppercase tracking-widest rounded-none border transition-all active:scale-95 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-[var(--color-bronze)] text-[var(--color-abyss)] border-[var(--color-bronze)] shadow-[0_0_15px_rgba(200,154,81,0.4)]' 
                        : 'bg-[var(--color-charcoal)] text-[var(--color-ash)] border-gray-700 hover:border-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {m.label}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Tags Below */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center z-10 relative px-4">
        {selectedMuscles.length === 0 ? (
          <span className="text-sm text-gray-500 italic font-medium">Tap muscle groups to select...</span>
        ) : (
          selectedMuscles.map(m => (
            <div key={m} className="bg-[var(--color-blood)]/20 text-[var(--color-blood)] px-3 py-1.5 font-display font-bold text-sm uppercase rounded-sm flex items-center gap-2 border border-[var(--color-blood)]/40 shadow-sm">
              <span className="w-2 h-2 bg-[var(--color-blood)] rounded-full animate-pulse"></span>
              {m}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
