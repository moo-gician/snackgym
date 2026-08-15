type BodyMapProps = {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
};

const MUSCLES = [
  { id: 'Shoulders', label: 'Shoulders', side: 'left', y: 25, paths: ['zone-shoulders'] },
  { id: 'Chest', label: 'Chest', side: 'right', y: 35, paths: ['zone-chest'] },
  { id: 'Back', label: 'Back', side: 'left', y: 40, paths: [] },
  { id: 'Biceps', label: 'Biceps', side: 'left', y: 55, paths: ['zone-arms-l'] },
  { id: 'Triceps', label: 'Triceps', side: 'right', y: 50, paths: ['zone-arms-r'] },
  { id: 'Core', label: 'Core', side: 'right', y: 65, paths: ['zone-core'] },
  { id: 'Legs', label: 'Legs', side: 'left', y: 75, paths: ['zone-legs-l', 'zone-legs-r'] },
];

const SVG_PATHS = {
  'zone-shoulders': 'M 330 380 L 518 380 L 590 480 L 258 480 Z',
  'zone-chest': 'M 280 480 L 568 480 L 530 620 L 318 620 Z',
  'zone-core': 'M 318 620 L 530 620 L 500 780 L 348 780 Z',
  'zone-arms-l': 'M 258 480 L 190 480 L 220 700 L 280 700 Z',
  'zone-arms-r': 'M 590 480 L 658 480 L 628 700 L 568 700 Z',
  'zone-legs-l': 'M 348 780 L 424 780 L 424 1100 L 230 1100 Z',
  'zone-legs-r': 'M 424 780 L 500 780 L 618 1100 L 424 1100 Z',
};

export default function BodyMap({ selectedMuscles, onChange }: BodyMapProps) {
  const toggleMuscle = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    if (selectedMuscles.includes(id)) {
      onChange(selectedMuscles.filter(m => m !== id));
    } else {
      onChange([...selectedMuscles, id]);
    }
  };

  // Determine which SVG paths are active
  const activePaths = new Set<string>();
  MUSCLES.forEach(m => {
    if (selectedMuscles.includes(m.id)) {
      m.paths.forEach(p => activePaths.add(p));
    }
  });

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
      <div className="relative flex-1 flex justify-center items-center py-4 w-full min-h-[450px]">
        <div className="relative w-full max-w-[280px] aspect-[848/1264] mx-auto z-10">
          <img 
            alt="Warrior Muscle Map" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp91qYJ0ZDXVd73s-6NDwPG7PoTpae0qkUmFFVfTUYFfrPYUy9wUrcP3Ih6DiYQb7-ZEH61_xW5fwn6Z2A1EsVIO85W7wN6WN-QOGLCTNfzQ3D7wgyyxB5HxebZ2zj7z-9OjMRM_FOQCZf_71vcfKpYh25ET7gabC3JkARtO2SuQi-Rt3oWJ2mXMbO9bhL8qmGMDhYlciDxtEXGMMupmlLpVXZAjW4zkDLtBrzTj-6YYAm9YFvP3vZ"
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(200,154,81,0.1)]"
          />
          
          {/* Interactive Muscle Zones */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 848 1264">
            {Object.entries(SVG_PATHS).map(([id, d]) => (
              <path 
                key={id} 
                d={d} 
                className={`transition-colors duration-300 fill-current ${activePaths.has(id) ? 'text-[var(--color-bronze)]/40' : 'text-transparent'}`} 
              />
            ))}
          </svg>

          {/* Floating Labels */}
          {MUSCLES.map(m => {
            const isSelected = selectedMuscles.includes(m.id);
            const isLeft = m.side === 'left';
            
            return (
              <div 
                key={m.id}
                className="absolute z-20 flex items-center"
                style={{ 
                  top: `${m.y}%`, 
                  [isLeft ? 'right' : 'left']: '100%',
                  marginRight: isLeft ? '8px' : '0',
                  marginLeft: isLeft ? '0' : '8px',
                }}
              >
                <button 
                  onClick={() => toggleMuscle(m.id)}
                  className={`group relative px-3 py-1 font-display font-bold text-[10px] uppercase tracking-widest rounded-none border transition-all active:scale-95 whitespace-nowrap ${
                    isSelected 
                      ? 'bg-[var(--color-bronze)] text-[var(--color-abyss)] border-[var(--color-bronze)] shadow-[0_0_10px_rgba(200,154,81,0.4)]' 
                      : 'bg-[var(--color-charcoal)] text-[var(--color-ash)] border-gray-700 hover:border-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Connecting Line */}
                  <div 
                    className={`absolute top-1/2 w-6 h-[1px] transition-colors ${isSelected ? 'bg-[var(--color-bronze)]' : 'bg-gray-700'} ${isLeft ? '-right-6' : '-left-6'}`} 
                  />
                  {m.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Tags Below */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center z-10 relative">
        {selectedMuscles.length === 0 ? (
          <span className="text-sm text-gray-500 italic font-medium">Tap muscle groups to select...</span>
        ) : (
          selectedMuscles.map(m => (
            <div key={m} className="bg-[var(--color-blood)]/20 text-[var(--color-blood)] px-2 py-1 font-display font-bold text-xs uppercase rounded-sm flex items-center gap-1 border border-[var(--color-blood)]/40">
              <span className="w-1.5 h-1.5 bg-[var(--color-blood)] rounded-full animate-pulse"></span>
              {m}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
