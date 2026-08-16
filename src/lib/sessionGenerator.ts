import { EXERCISE_DB, type Exercise } from './exerciseDB';

export function generateSessionExercises(
  poolIds: string[],
  course: 'MICRO' | 'COMPACT' | 'CIRCUIT',
  existingIds: string[] = []
): Exercise[] {
  let targetCount = 2; // MICRO (1-2 mins)
  if (course === 'COMPACT') targetCount = 4; // COMPACT (3-5 mins)
  if (course === 'CIRCUIT') targetCount = 8; // CIRCUIT (6-10 mins)
  
  if (existingIds.length > 0) {
    targetCount = existingIds.length + 2;
  }

  const availableIds = poolIds.filter(id => !existingIds.includes(id));
  
  const shuffled = [...availableIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const needCount = targetCount - existingIds.length;
  const pickedIds = shuffled.slice(0, needCount);

  const finalIds = [...existingIds, ...pickedIds];
  
  return finalIds.map(id => EXERCISE_DB.find(ex => ex.id === id)!).filter(Boolean);
}
