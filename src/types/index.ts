
export interface VisualizerStep {
  message: string;
  isFinalStep: boolean;
  
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
  currentIndex?: number; 
  low?: number;           
  high?: number;          
  mid?: number;           
  targetFoundAtIndex?: number | undefined; 
}

export interface SortStep extends ArrayVisualizerStep {
  comparing?: [number, number] | undefined; 
  swapping?: [number, number] | undefined; 
  sortedIndices?: number[]; 
  pivotIndex?: number; 
  subArrayBounds?: { start: number, end: number }; 
}


export interface GraphNode {
  id: string;
  label?: string;
  x?: number; 
  y?: number; 
}

export interface GraphEdge {
  id: string;
  source: string; 
  target: string; 
  weight?: number;
  directed?: boolean;
}

export type GraphHighlightColor = 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted' | 'neutral' | 'info' | 'visited' | 'path';

export interface GraphElementHighlight {
  id: string; 
  color: GraphHighlightColor;
  type: 'node' | 'edge';
  label?: string; 
}

export interface GraphStep extends VisualizerStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  distances?: Record<string, number | typeof Infinity>; 
  predecessors?: Record<string, string | null>; 
  currentNodeId?: string; 
  highlights: GraphElementHighlight[];
  targetFoundPath?: string[]; 
  
  
  fScores?: Record<string, number | typeof Infinity>; 
  
  
  distanceMatrix?: Record<string, Record<string, number | typeof Infinity>>;
  nextHopMatrix?: Record<string, Record<string, string | null>>; 
  currentKNodeId?: string; 
  currentSourceNodeId?: string; 
  currentDestNodeId?: string; 
  negativeCycleDetected?: boolean; 

  
  mstWeight?: number; 
}



export type AlgorithmType = 'search' | 'sort' | 'graph';

export type SearchAlgorithmKey = 'linear-search' | 'binary-search';
export type SortAlgorithmKey = 'bubble-sort' | 'merge-sort' | 'quick-sort';
export type GraphAlgorithmKey = 'dijkstra' | 'bellman-ford' | 'a-star' | 'floyd-warshall' | 'kruskal' | 'prim';

export type AlgorithmKey = SearchAlgorithmKey | SortAlgorithmKey | GraphAlgorithmKey;

export interface BaseAlgorithm {
  key: AlgorithmKey;
  name: string;
  description: string;
  complexity: {
    timeAverage?: string;
    timeWorst: string;
    spaceWorst: string;
  };
  type: AlgorithmType;
}

export type VisualizerAlgorithm = BaseAlgorithm;


export type AlgorithmGenerator = 
  Generator<SearchStep, SearchStep | undefined, void> |
  Generator<SortStep, SortStep | undefined, void> |
  Generator<GraphStep, GraphStep | undefined, void>;
