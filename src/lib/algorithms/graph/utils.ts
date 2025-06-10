
import type { GraphNode, GraphEdge } from '@/types';

export function generateRandomGraph(
  numNodes: number,
  numEdges: number,
  maxWeight: number = 10,
  directed: boolean = false,
  allowNegativeWeights: boolean = false,
  minWeight?: number // If allowNegativeWeights is true, this can be negative
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // To avoid duplicate edges

  for (let i = 0; i < numNodes; i++) {
    nodes.push({ id: `n${i}`, label: `N${i}` });
  }

  if (numNodes === 0) return { nodes, edges };
  if (numNodes === 1 && numEdges > 0) numEdges = 0;

  const actualMinWeight = allowNegativeWeights ? (minWeight !== undefined ? minWeight : -Math.floor(maxWeight / 2)) : 1;
  const actualMaxWeight = maxWeight;


  for (let i = 0; i < numEdges; i++) {
    let sourceIndex = Math.floor(Math.random() * numNodes);
    let targetIndex = Math.floor(Math.random() * numNodes);

    let tries = 0;
    while ((sourceIndex === targetIndex || edgeSet.has(`${sourceIndex}-${targetIndex}`) || (!directed && edgeSet.has(`${targetIndex}-${sourceIndex}`))) && tries < numNodes * numNodes * 2) { // Increased tries for dense/small graphs
      sourceIndex = Math.floor(Math.random() * numNodes);
      targetIndex = Math.floor(Math.random() * numNodes);
      tries++;
    }
    
    if (sourceIndex === targetIndex && numNodes > 1 && tries >= numNodes * numNodes * 2) continue; // Give up on this edge if can't find non-self-loop

    if (!edgeSet.has(`${sourceIndex}-${targetIndex}`) && (directed || !edgeSet.has(`${targetIndex}-${sourceIndex}`))) {
      const weightRange = actualMaxWeight - actualMinWeight + 1;
      const randomWeight = Math.floor(Math.random() * weightRange) + actualMinWeight;
      
      edges.push({
        id: `e${i}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        weight: randomWeight,
        directed,
      });
      edgeSet.add(`${sourceIndex}-${targetIndex}`);
      if(!directed) edgeSet.add(`${targetIndex}-${sourceIndex}`);
    }
  }

  return { nodes, edges };
}

    