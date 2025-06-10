import type { SortStep } from '@/types';

function* merge(
  array: number[],
  left: number,
  mid: number,
  right: number,
  originalFullArrayRef: number[], 
  mainArrayOffset: number 
): Generator<SortStep, void, void> {
  const n1 = mid - left + 1;
  const n2 = right - mid;

  const L = new Array(n1);
  const R = new Array(n2);

  for (let i = 0; i < n1; i++) L[i] = array[left + i];
  for (let j = 0; j < n2; j++) R[j] = array[mid + 1 + j];
  
  const currentBounds = { start: left + mainArrayOffset, end: right + mainArrayOffset };

  yield {
    array: [...originalFullArrayRef],
    message: `Merging subarrays: Left from index ${left+mainArrayOffset} to ${mid+mainArrayOffset}, Right from ${mid + 1 + mainArrayOffset} to ${right+mainArrayOffset}. Left values: [${L.join(', ')}], Right values: [${R.join(', ')}]`,
    isFinalStep: false,
    subArrayBounds: currentBounds,
    highlights: originalFullArrayRef.map((_, i) => {
      if (i >= currentBounds.start && i <= currentBounds.end) return { index: i, color: 'primary' };
      return { index: i, color: 'neutral' };
    }),
  };

  let i = 0; 
  let j = 0; 
  let k = left; 

  while (i < n1 && j < n2) {
    yield {
      array: [...originalFullArrayRef],
      comparing: [left + i + mainArrayOffset, mid + 1 + j + mainArrayOffset],
      message: `Comparing L[${i}] (${L[i]}) and R[${j}] (${R[j]}). Placing element into index ${k + mainArrayOffset}.`,
      isFinalStep: false,
      subArrayBounds: currentBounds,
      highlights: originalFullArrayRef.map((val, idx) => {
        if (idx === left + i + mainArrayOffset || idx === mid + 1 + j + mainArrayOffset) return { index: idx, color: 'secondary' };
        if (idx >= currentBounds.start && idx <= currentBounds.end) return { index: idx, color: 'primary' };
        return { index: idx, color: 'neutral' };
      }),
    };
    if (L[i] <= R[j]) {
      array[k] = L[i];
      originalFullArrayRef[k + mainArrayOffset] = L[i]; 
      i++;
    } else {
      array[k] = R[j];
      originalFullArrayRef[k + mainArrayOffset] = R[j]; 
      j++;
    }
    k++;
    yield { 
      array: [...originalFullArrayRef],
      message: `Element placed. Array segment being merged: [${array.slice(left, k).join(', ')}]`,
      isFinalStep: false,
      subArrayBounds: currentBounds,
      highlights: originalFullArrayRef.map((val, idx) => {
         if (idx === (k-1) + mainArrayOffset) return { index:idx, color: 'accent' }; 
         if (idx >= currentBounds.start && idx <= currentBounds.end) return { index: idx, color: 'primary' };
         return { index: idx, color: 'neutral' };
      }),
    };
  }

  while (i < n1) {
    array[k] = L[i];
    originalFullArrayRef[k + mainArrayOffset] = L[i];
    yield {
      array: [...originalFullArrayRef],
      message: `Copying remaining L[${i}] (${L[i]}) to index ${k + mainArrayOffset}.`,
      isFinalStep: false,
      subArrayBounds: currentBounds,
      highlights: originalFullArrayRef.map((val, idx) => {
         if (idx === k + mainArrayOffset) return { index:idx, color: 'accent' };
         if (idx >= currentBounds.start && idx <= currentBounds.end) return { index: idx, color: 'primary' };
         return { index: idx, color: 'neutral' };
      }),
    };
    i++;
    k++;
  }

  while (j < n2) {
    array[k] = R[j];
    originalFullArrayRef[k + mainArrayOffset] = R[j];
    yield {
      array: [...originalFullArrayRef],
      message: `Copying remaining R[${j}] (${R[j]}) to index ${k + mainArrayOffset}.`,
      isFinalStep: false,
      subArrayBounds: currentBounds,
      highlights: originalFullArrayRef.map((val, idx) => {
         if (idx === k + mainArrayOffset) return { index:idx, color: 'accent' };
         if (idx >= currentBounds.start && idx <= currentBounds.end) return { index: idx, color: 'primary' };
         return { index: idx, color: 'neutral' };
      }),
    };
    j++;
    k++;
  }
  yield {
      array: [...originalFullArrayRef],
      message: `Subarray from index ${left+mainArrayOffset} to ${right+mainArrayOffset} merged.`,
      isFinalStep: false,
      subArrayBounds: currentBounds,
      highlights: originalFullArrayRef.map((_, idx) => {
        if (idx >= currentBounds.start && idx <= currentBounds.end) return { index: idx, color: 'accent' }; 
        return { index: idx, color: 'neutral' };
      }),
    };
}

function* mergeSortRecursive(
  array: number[], 
  left: number,
  right: number,
  originalFullArrayRef: number[], 
  mainArrayOffset: number 
): Generator<SortStep, void, void> {
  if (left >= right) {
    
    if (left === right) { 
       yield {
        array: [...originalFullArrayRef],
        message: `Base case: element at index ${left + mainArrayOffset} is a subarray of size 1.`,
        isFinalStep: false,
        subArrayBounds: { start: left + mainArrayOffset, end: right + mainArrayOffset },
        highlights: originalFullArrayRef.map((_, i) => 
          (i === left + mainArrayOffset) ? { index: i, color: 'info' } : { index: i, color: 'neutral' }
        ),
      };
    }
    return;
  }
  const mid = Math.floor((left + right) / 2);
  
  yield {
    array: [...originalFullArrayRef],
    message: `Splitting array. Left part: indices ${left+mainArrayOffset} to ${mid+mainArrayOffset}. Right part: indices ${mid + 1+mainArrayOffset} to ${right+mainArrayOffset}.`,
    isFinalStep: false,
    subArrayBounds: { start: left + mainArrayOffset, end: right + mainArrayOffset },
    highlights: originalFullArrayRef.map((_, i) => {
      if (i >= left + mainArrayOffset && i <= right + mainArrayOffset) return { index: i, color: 'primary' };
      return { index: i, color: 'neutral' };
    }),
  };

  yield* mergeSortRecursive(array, left, mid, originalFullArrayRef, mainArrayOffset);
  yield* mergeSortRecursive(array, mid + 1, right, originalFullArrayRef, mainArrayOffset);
  yield* merge(array, left, mid, right, originalFullArrayRef, mainArrayOffset);
}


export function* mergeSortGenerator(
  inputArray: number[]
): Generator<SortStep, SortStep, void> {
  const arrayCopy = [...inputArray]; 
  
  yield {
    array: [...inputArray], 
    message: 'Starting Merge Sort.',
    isFinalStep: false,
    highlights: inputArray.map((_, i) => ({ index: i, color: 'neutral' })),
  };

  
  
  
  yield* mergeSortRecursive(arrayCopy, 0, arrayCopy.length - 1, arrayCopy, 0);

  const finalStep = {
    array: [...arrayCopy],
    message: 'Merge Sort complete. Array is sorted.',
    isFinalStep: true,
    highlights: arrayCopy.map((_, i) => ({ index: i, color: 'accent', label: 'Sorted' })),
    sortedIndices: arrayCopy.map((_, i) => i),
  };
  yield finalStep;
  return finalStep;
}
