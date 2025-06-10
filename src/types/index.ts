
export interface VisualizerStep {
  message: string;
  isFinalStep: boolean;
  // Specific highlight structure will vary by visualizer type
}

export interface ArrayVisualizerStep extends VisualizerStep {
  array: number[];
  highlights: Array<{
    index: number;
    color: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted' | 'neutral' | 'info';
    label?: string;
  }>;
}

export interface SearchStep extends ArrayVisualizerStep {
  target?: number;
  currentIndex?: number; // For linear search
  low?: number;           // For binary search
  high?: number;          // For binary search
  mid?: number;           // For binary search
  targetFoundAtIndex?: number | null;
}

export interface SortStep extends ArrayVisualizerStep {
  comparing?: [number, number] | null;
  swapping?: [number, number] | null;
  sortedIndices?: number[]; // Indices that are in their final sorted position
  pivotIndex?: number; // For QuickSort
  subArrayBounds?: { start: number, end: number }; // For merge sort partitions etc.
}

// --- Graph Algorithm Types ---
export interface GraphNode {
  id: string;
  label?: string;
  x?: number; // For positioning in visualization
  y?: number; // For positioning in visualization
}

export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  weight?: number;
  directed?: boolean;
}

export type GraphHighlightColor = 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted' | 'neutral' | 'info' | 'visited' | 'path';

export interface GraphElementHighlight {
  id: string; // Node or Edge ID
  color: GraphHighlightColor;
  type: 'node' | 'edge';
  label?: string;
}

export interface GraphStep extends VisualizerStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  distances?: Record<string, number | typeof Infinity>; // Node ID to distance from start
  predecessors?: Record<string, string | null>; // Node ID to predecessor Node ID
  currentNodeId?: string; // Current node being processed
  highlights: GraphElementHighlight[];
  targetFoundPath?: string[]; // Array of node IDs forming the path
}
// --- End Graph Algorithm Types ---


export type AlgorithmType = 'search' | 'sort' | 'graph';

export type SearchAlgorithmKey = 'linear-search' | 'binary-search';
export type SortAlgorithmKey = 'bubble-sort' | 'merge-sort' | 'quick-sort';
export type GraphAlgorithmKey = 'dijkstra' | 'bellman-ford' | 'a-star';

export type AlgorithmKey = SearchAlgorithmKey | SortAlgorithmKey | GraphAlgorithmKey;

export interface BaseAlgorithm {
  key: AlgorithmKey;
  name: string;
  description: string;
  complexity: {
    timeAverage?: string; // Dijkstra/A* depend on priority queue implementation
    timeWorst: string;
    spaceWorst: string;
  };
  type: AlgorithmType;
}

// Specific algorithm types can extend BaseAlgorithm if needed, but for now, one interface works.
export type VisualizerAlgorithm = BaseAlgorithm;


export type AlgorithmGenerator = 
  Generator<SearchStep, SearchStep | void, void> |
  Generator<SortStep, SortStep | void, void> |
  Generator<GraphStep, GraphStep | void, void>;

