import { EXERCISE_DB, type Exercise } from './exerciseDB';

export function generateSessionExercises(
  poolIds: string[],
  course: 'MICRO' | 'COMPACT' | 'CIRCUIT',
  existingIds: string[] = []
): Exercise[] {
  let targetCount = 3;
  if (course === 'COMPACT') targetCount = 5;
  if (course === 'CIRCUIT') targetCount = 7;
  
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
