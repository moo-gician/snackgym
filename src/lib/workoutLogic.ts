import { EXERCISE_DB } from './exerciseDB';

export type SplitStrategy = '1-Split (Full Body)' | '2-Split (Upper/Lower)' | '2-Split (Push/Core)' | '2-Split (Push/Pull)' | '3-Split (Push/Pull/Legs)';

export function calculateSplitStrategy(
  targetMuscles: string[],
  sessionsPerDay: number
): SplitStrategy {
  const numMuscles = targetMuscles.length;
  if (numMuscles === 0) return '1-Split (Full Body)'; // Default if nothing selected

  if (numMuscles <= 2) {
    return '1-Split (Full Body)'; // Single or double target -> 1 Split with antagonist fallback
  }

  // Check which major groups are included
  const hasLegs = targetMuscles.includes('Legs');
  const hasBack = targetMuscles.includes('Back');
  const hasCore = targetMuscles.includes('Core');
  const hasPush = targetMuscles.includes('Chest') || targetMuscles.includes('Shoulders');
  
  if (!hasLegs) {
    if (!hasBack && hasPush && numMuscles >= 3) {
      return '2-Split (Push/Core)';
    }
    if (hasBack && hasPush && numMuscles >= 3) {
      return '2-Split (Push/Pull)';
    }
    return '1-Split (Full Body)';
  }

  if (sessionsPerDay >= 3 && numMuscles >= 4) {
    return '3-Split (Push/Pull/Legs)';
  } else if (sessionsPerDay <= 2 && numMuscles >= 4) {
    return '2-Split (Upper/Lower)';
  }

  return '1-Split (Full Body)';
}

export function generateCustomPool(
  splitStrategy: SplitStrategy,
  equipment: string[],
  targetMuscles: string[]
): Record<string, string[]> {
  const pool: Record<string, string[]> = {};
  
  // Base filtered DB based on equipment and target muscles
  const baseFilteredDB = EXERCISE_DB.filter(ex => {
    // Equipment check
    if (ex.equipment !== 'Bodyweight' && !equipment.includes(ex.equipment)) return false;
    // Muscle check
    if (targetMuscles.length > 0 && !targetMuscles.includes(ex.muscleGroup)) return false;
    return true;
  });

  if (splitStrategy === '3-Split (Push/Pull/Legs)') {
    pool['Day A (Push)'] = baseFilteredDB.filter(ex => ex.splitType === 'Push').map(e => e.id);
    pool['Day B (Pull)'] = baseFilteredDB.filter(ex => ex.splitType === 'Pull').map(e => e.id);
    pool['Day C (Legs & Core)'] = baseFilteredDB.filter(ex => ex.splitType === 'Legs' || ex.splitType === 'Core').map(e => e.id);
  } else if (splitStrategy === '2-Split (Upper/Lower)') {
    pool['Day A (Upper)'] = baseFilteredDB.filter(ex => ex.splitType === 'Push' || ex.splitType === 'Pull').map(e => e.id);
    pool['Day B (Lower & Core)'] = baseFilteredDB.filter(ex => ex.splitType === 'Legs' || ex.splitType === 'Core').map(e => e.id);
  } else if (splitStrategy === '2-Split (Push/Core)') {
    pool['Day A (Push)'] = baseFilteredDB.filter(ex => ex.splitType === 'Push').map(e => e.id);
    pool['Day B (Core & Pull)'] = baseFilteredDB.filter(ex => ex.splitType === 'Core' || ex.splitType === 'Pull').map(e => e.id);
  } else if (splitStrategy === '2-Split (Push/Pull)') {
    pool['Day A (Push)'] = baseFilteredDB.filter(ex => ex.splitType === 'Push').map(e => e.id);
    pool['Day B (Pull & Core)'] = baseFilteredDB.filter(ex => ex.splitType === 'Pull' || ex.splitType === 'Core').map(e => e.id);
  } else {
    // 1-Split (Full Body)
    pool['Day A (Full Body)'] = baseFilteredDB.map(e => e.id);
  }

  return pool;
}

export function autoDowngradeSplitIfNeeded(
  strategy: SplitStrategy,
  pool: Record<string, string[]>,
  blacklistedExercises: string[]
): { finalStrategy: SplitStrategy, finalPool: Record<string, string[]>, wasDowngraded: boolean } {
  let wasDowngraded = false;
  let currentStrategy = strategy;
  let currentPool = pool;

  // We only count exercises that are NOT blacklisted to see if the split is valid
  const checkValid = (p: Record<string, string[]>) => Object.values(p).every(arr => 
    arr.filter(id => !blacklistedExercises.includes(id)).length >= 2
  );

  if (!checkValid(currentPool)) {
    wasDowngraded = true;
    if (currentStrategy === '3-Split (Push/Pull/Legs)') {
      // Downgrade to 2-Split
      currentStrategy = '2-Split (Upper/Lower)';
      currentPool = {
        'Day A (Upper)': [...new Set([...(pool['Day A (Push)']||[]), ...(pool['Day B (Pull)']||[])])],
        'Day B (Lower & Core)': pool['Day C (Legs & Core)'] || []
      };
    }
  }

  // Check again
  if (!checkValid(currentPool) && currentStrategy !== '1-Split (Full Body)') {
    wasDowngraded = true;
    currentStrategy = '1-Split (Full Body)';
    currentPool = {
      'Day A (Full Body)': [...new Set(Object.values(currentPool).flat())]
    };
  }

  // If even 1-split is invalid, we return it as is but UI should prevent them from proceeding.
  return { finalStrategy: currentStrategy, finalPool: currentPool, wasDowngraded };
}
