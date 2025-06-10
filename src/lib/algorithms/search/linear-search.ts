import type { SearchStep } from '@/types';

export function* linearSearchGenerator(
  array: number[],
  target: number
): Generator<SearchStep, SearchStep, void> {
  const initialHighlights = array.map((_, i) => ({ index: i, color: 'neutral' as const }));
  yield { 
    array: [...array], 
    target, 
    message: `Starting Linear Search for ${target}.`, 
    isFinalStep: false, 
    highlights: initialHighlights 
  };

  for (let i = 0; i < array.length; i++) {
    const currentHighlights = [...initialHighlights];
    currentHighlights[i] = { index: i, color: 'primary' }; // Current element being checked
    
    yield {
      array: [...array],
      target,
      currentIndex: i,
      message: `Checking element at index ${i} (value: ${array[i]})...`,
      isFinalStep: false,
      highlights: currentHighlights,
    };

    if (array[i] === target) {
      currentHighlights[i] = { index: i, color: 'accent', label: 'Found!' };
      const finalStep = {
        array: [...array],
        target,
        currentIndex: i,
        targetFoundAtIndex: i,
        message: `Element ${target} found at index ${i}.`,
        isFinalStep: true,
        highlights: currentHighlights,
      };
      yield finalStep;
      return finalStep;
    }
    currentHighlights[i] = { index: i, color: 'muted' }; // Mark as checked
  }
  
  const finalStepNotFound = {
    array: [...array],
    target,
    message: `Element ${target} not found in the array.`,
    isFinalStep: true,
    highlights: array.map((_, i) => ({ index: i, color: 'muted' as const })),
  };
  yield finalStepNotFound;
  return finalStepNotFound;
}
