export interface VisualizerStep {
  array: number[];
  message: string;
  isFinalStep: boolean;
  highlights: Array<{ 
    index: number; 
    color: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted' | 'neutral' | 'info';
    label?: string; 
  }>;
}

export interface SearchStep extends VisualizerStep {
  target?: number;
  currentIndex?: number; // For linear search
  low?: number;           // For binary search
  high?: number;          // For binary search
  mid?: number;           // For binary search
  targetFoundAtIndex?: number | null;
}

export interface SortStep extends VisualizerStep {
  comparing?: [number, number] | null;
  swapping?: [number, number] | null;
  sortedIndices?: number[]; // Indices that are in their final sorted position
  pivotIndex?: number; // For QuickSort
  subArrayBounds?: { start: number, end: number }; // For merge sort partitions etc.
}

export type AlgorithmType = 'search' | 'sort';

export type SearchAlgorithmKey = 'linear-search' | 'binary-search';
export type SortAlgorithmKey = 'bubble-sort' | 'merge-sort' | 'quick-sort';

export interface Algorithm {
  key: SearchAlgorithmKey | SortAlgorithmKey;
  name: string;
  description: string;
  complexity: {
    timeAverage: string;
    timeWorst: string;
    spaceWorst: string;
  };
  type: AlgorithmType;
}

export type AlgorithmGenerator = Generator<SearchStep | SortStep, SearchStep | SortStep | void, void>;
