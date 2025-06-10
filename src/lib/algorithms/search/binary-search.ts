import type { SearchStep } from '@/types';

export function* binarySearchGenerator(
  array: number[], 
  target: number
): Generator<SearchStep, SearchStep, void> {
  let low = 0;
  let high = array.length - 1;
  
  const getHighlights = (currentLow: number, currentHigh: number, currentMid?: number, found?: boolean): SearchStep['highlights'] => {
    return array.map((_, i) => {
      if (found && i === currentMid) return { index: i, color: 'accent', label: 'Found!' };
      if (i === currentMid) return { index: i, color: 'primary', label: 'Mid' };
      if (i === currentLow) return { index: i, color: 'secondary', label: 'Low' };
      if (i === currentHigh) return { index: i, color: 'secondary', label: 'High' };
      if (i >= currentLow && i <= currentHigh) return { index: i, color: 'info' }; 
      return { index: i, color: 'muted' }; 
    });
  };

  yield {
    array: [...array],
    target,
    low,
    high,
    message: `Starting Binary Search for ${target}. Array must be sorted.`,
    isFinalStep: false,
    highlights: getHighlights(low, high),
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = array[mid];

    yield {
      array: [...array],
      target,
      low,
      high,
      mid,
      message: `Checking middle element at index ${mid} (value: ${guess}). Low: ${low}, High: ${high}.`,
      isFinalStep: false,
      highlights: getHighlights(low, high, mid),
    };

    if (guess === target) {
      const finalStep = {
        array: [...array],
        target,
        low,
        high,
        mid,
        targetFoundAtIndex: mid,
        message: `Element ${target} found at index ${mid}.`,
        isFinalStep: true,
        highlights: getHighlights(low, high, mid, true),
      };
      yield finalStep;
      return finalStep;
    } else if (guess < target) {
      low = mid + 1;
      yield {
        array: [...array],
        target,
        low,
        high,
        mid,
        message: `Target ${target} > ${guess}. New Low: ${low}.`,
        isFinalStep: false,
        highlights: getHighlights(low, high, mid),
      };
    } else {
      high = mid - 1;
      yield {
        array: [...array],
        target,
        low,
        high,
        mid,
        message: `Target ${target} < ${guess}. New High: ${high}.`,
        isFinalStep: false,
        highlights: getHighlights(low, high, mid),
      };
    }
  }

  const finalStepNotFound = {
    array: [...array],
    target,
    low,
    high,
    message: `Element ${target} not found. Search range exhausted.`,
    isFinalStep: true,
    highlights: array.map((_, i) => ({ index: i, color: 'muted' as const })),
  };
  yield finalStepNotFound;
  return finalStepNotFound;
}
