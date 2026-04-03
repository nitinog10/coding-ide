export function calculateXP(codeLength: number, success: boolean): number {
  const baseXP = 10;
  const complexityMultiplier = Math.min(1 + (codeLength / 100), 3.0);
  const successMultiplier = success ? 1.5 : 0.5;
  
  const xp = Math.floor(baseXP * complexityMultiplier * successMultiplier);
  return Math.min(xp, 1000);
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return nextLevel * nextLevel * 100;
}
