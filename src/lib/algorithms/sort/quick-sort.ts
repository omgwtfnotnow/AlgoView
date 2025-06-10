import type { SortStep } from '@/types';
import { swap } from '../utils';

function* partition(
  array: number[],
  low: number,
  high: number
): Generator<SortStep, number, void> {
  const pivot = array[high];
  let i = low - 1; 

  yield {
    array: [...array],
    pivotIndex: high,
    subArrayBounds: { start: low, end: high },
    message: `Partitioning from index ${low} to ${high}. Pivot is ${pivot} (at index ${high}).`,
    isFinalStep: false,
    highlights: array.map((_, k) => {
      if (k === high) return { index: k, color: 'destructive', label: 'Pivot' };
      if (k >= low && k <= high) return { index: k, color: 'primary' };
      return { index: k, color: 'neutral' };
    }),
  };

  for (let j = low; j < high; j++) {
    yield {
      array: [...array],
      pivotIndex: high,
      comparing: [j, high],
      subArrayBounds: { start: low, end: high },
      message: `Comparing element at index ${j} (${array[j]}) with pivot ${pivot}.`,
      isFinalStep: false,
      highlights: array.map((_, k) => {
        if (k === high) return { index: k, color: 'destructive', label: 'Pivot' };
        if (k === j) return { index: k, color: 'secondary' }; 
        if (k <= i && k >= low) return { index: k, color: 'info' }; 
        if (k >= low && k <= high) return { index: k, color: 'primary' };
        return { index: k, color: 'neutral' };
      }),
    };

    if (array[j] < pivot) {
      i++;
      yield {
        array: [...array], 
        pivotIndex: high,
        swapping: [i,j],
        subArrayBounds: { start: low, end: high },
        message: `Element ${array[j]} < pivot. Swapping ${array[i]} (at index ${i}) and ${array[j]} (at index ${j}).`,
        isFinalStep: false,
        highlights: array.map((_, k) => {
          if (k === high) return { index: k, color: 'destructive', label: 'Pivot' };
          if (k === i || k ===j) return { index: k, color: 'accent' }; 
          if (k < i && k >=low ) return { index: k, color: 'info' };
          if (k >= low && k <= high) return { index: k, color: 'primary' };
          return { index: k, color: 'neutral' };
        }),
      };
      swap(array, i, j);
      yield { 
        array: [...array],
        pivotIndex: high,
        subArrayBounds: { start: low, end: high },
        message: `Swap complete. Smaller elements partition boundary is now at index ${i}.`,
        isFinalStep: false,
        highlights: array.map((_, k) => {
          if (k === high) return { index: k, color: 'destructive', label: 'Pivot' };
          if (k <= i && k >= low) return { index: k, color: 'info' };
          if (k >= low && k <= high) return { index: k, color: 'primary' };
          return { index: k, color: 'neutral' };
        }),
      };
    }
  }
  
  yield { 
    array: [...array],
    pivotIndex: high,
    swapping: [i+1, high],
    subArrayBounds: { start: low, end: high },
    message: `Placing pivot ${pivot} in its sorted position. Swapping ${array[i+1]} (at index ${i+1}) and ${array[high]} (pivot at index ${high}).`,
    isFinalStep: false,
    highlights: array.map((_, k) => {
      if (k === high || k === i+1) return { index: k, color: 'accent' }; 
      if (k <= i && k >= low) return { index: k, color: 'info' };
      if (k >= low && k <= high) return { index: k, color: 'primary' };
      return { index: k, color: 'neutral' };
    }),
  };
  swap(array, i + 1, high);
  const pivotFinalIndex = i + 1;
  yield { 
    array: [...array],
    pivotIndex: pivotFinalIndex,
    subArrayBounds: { start: low, end: high },
    message: `Pivot ${array[pivotFinalIndex]} (original pivot) is now at its sorted position: index ${pivotFinalIndex}.`,
    isFinalStep: false, 
    highlights: array.map((_, k) => {
      if (k === pivotFinalIndex) return { index: k, color: 'accent', label: 'Sorted Pivot' };
      if (k < pivotFinalIndex && k >= low) return { index: k, color: 'info' }; 
      if (k > pivotFinalIndex && k <= high) return { index: k, color: 'primary' }; 
      return { index: k, color: 'neutral' };
    }),
  };
  return pivotFinalIndex;
}

function* quickSortRecursive(
  array: number[],
  low: number,
  high: number,
  sortedIndices: Set<number>
): Generator<SortStep, void, void> {
  if (low < high) {
    yield {
      array: [...array],
      subArrayBounds: { start: low, end: high },
      message: `Recursively sorting subarray from index ${low} to ${high}.`,
      isFinalStep: false,
      highlights: array.map((_, k) => {
        if (sortedIndices.has(k)) return { index:k, color: 'accent', label: 'Sorted'};
        if (k >= low && k <= high) return { index: k, color: 'primary' };
        return { index: k, color: 'neutral' };
      }),
    };

    const pivotIndex = yield* partition(array, low, high);
    sortedIndices.add(pivotIndex); 
    
    yield { 
      array: [...array],
      message: `Pivot at index ${pivotIndex} is sorted. Recursively sorting left and right partitions.`,
      isFinalStep: false,
      highlights: array.map((_, k) => {
        if (k === pivotIndex) return { index: k, color: 'accent', label: 'Sorted' };
        if (k >= low && k < pivotIndex) return { index: k, color: 'info' }; 
        if (k > pivotIndex && k <= high) return { index: k, color: 'primary' }; 
        return { index: k, color: 'neutral' };
      }),
    };

    yield* quickSortRecursive(array, low, pivotIndex - 1, sortedIndices);
    yield* quickSortRecursive(array, pivotIndex + 1, high, sortedIndices);
  } else if (low === high) { 
    sortedIndices.add(low);
     yield {
      array: [...array],
      message: `Base case: Element at index ${low} is sorted.`,
      isFinalStep: false,
      highlights: array.map((_, k) => sortedIndices.has(k) ? { index: k, color: 'accent', label: 'Sorted' } : { index:k, color: 'neutral'})
    };
  }
}

export function* quickSortGenerator(
  inputArray: number[]
): Generator<SortStep, SortStep, void> {
  const array = [...inputArray];
  const sortedIndices = new Set<number>();

  yield {
    array: [...array],
    message: 'Starting Quick Sort.',
    isFinalStep: false,
    highlights: array.map((_, i) => ({ index: i, color: 'neutral' })),
  };

  yield* quickSortRecursive(array, 0, array.length - 1, sortedIndices);

  const finalStep = {
    array: [...array],
    message: 'Quick Sort complete. Array is sorted.',
    isFinalStep: true,
    highlights: array.map((_, i) => ({ index: i, color: 'accent', label: 'Sorted' })),
    sortedIndices: Array.from(sortedIndices).sort((a,b) => a-b),
  };
  yield finalStep;
  return finalStep;
}
