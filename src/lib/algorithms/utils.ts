export function generateRandomArray(size: number, maxValue: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (maxValue + 1)));
}


export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function swap(arr: number[], i: number, j: number) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
