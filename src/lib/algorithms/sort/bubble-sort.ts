import type { SortStep } from '@/types';
import { swap } from '../utils';

export function* bubbleSortGenerator(
  inputArray: number[]
): Generator<SortStep, SortStep, void> {
  const array = [...inputArray];
  const n = array.length;
  let swapped;

  const getHighlights = (pass: number, currentComparison?: [number, number], isSwapping?: boolean, sortedCount?: number): SortStep['highlights'] => {
    return array.map((_, i) => {
      if (sortedCount && i >= n - sortedCount) return { index: i, color: 'accent', label: 'Sorted' };
      if (currentComparison?.includes(i)) {
        return { index: i, color: isSwapping ? 'destructive' : 'primary' };
      }
      return { index: i, color: 'neutral' };
    });
  };

  yield {
    array: [...array],
    message: `Starting Bubble Sort. Pass 1.`,
    isFinalStep: false,
    highlights: getHighlights(0),
  };

  let sortedElementsCount = 0;
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    yield {
      array: [...array],
      message: `Pass ${i + 1}. Comparing elements. Largest will bubble to the end.`,
      isFinalStep: false,
      highlights: getHighlights(i, undefined, false, sortedElementsCount),
    };
    for (let j = 0; j < n - 1 - i; j++) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        message: `Comparing ${array[j]} and ${array[j + 1]}.`,
        isFinalStep: false,
        highlights: getHighlights(i, [j, j + 1], false, sortedElementsCount),
      };
      if (array[j] > array[j + 1]) {
        yield {
          array: [...array], 
          comparing: [j, j+1],
          swapping: [j, j + 1],
          message: `Swapping ${array[j]} and ${array[j + 1]}.`,
          isFinalStep: false,
          highlights: getHighlights(i, [j, j + 1], true, sortedElementsCount),
        };
        swap(array, j, j + 1);
        swapped = true;
        yield {
          array: [...array], 
          comparing: [j, j+1],
          message: `Elements ${array[j+1]} and ${array[j]} swapped (original values).`,
          isFinalStep: false,
          highlights: getHighlights(i, [j, j+1], false, sortedElementsCount),
        };
      }
    }
    sortedElementsCount++;
     yield {
      array: [...array],
      message: `Pass ${i + 1} complete. Element ${array[n - 1 - i]} is sorted.`,
      isFinalStep: false,
      highlights: getHighlights(i, undefined, false, sortedElementsCount),
    };
    if (!swapped) {
      
      break;
    }
  }
  
  const finalStep = {
    array: [...array],
    message: 'Bubble Sort complete. Array is sorted.',
    isFinalStep: true,
    highlights: array.map((_, i) => ({ index: i, color: 'accent' as const, label: 'Sorted' })),
    sortedIndices: array.map((_, i) => i),
  };
  yield finalStep;
  return finalStep;
}
