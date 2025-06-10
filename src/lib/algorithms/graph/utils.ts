
import type { GraphNode, GraphEdge } from '@/types';

export function generateRandomGraph(
  numNodes: number,
  numEdges: number,
  maxWeight: number = 10,
  directed: boolean = false
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // To avoid duplicate edges

  for (let i = 0; i < numNodes; i++) {
    nodes.push({ id: `n${i}`, label: `N${i}` });
  }

  if (numNodes === 0) return { nodes, edges };
  if (numNodes === 1 && numEdges > 0) numEdges = 0;


  for (let i = 0; i < numEdges; i++) {
    let sourceIndex = Math.floor(Math.random() * numNodes);
    let targetIndex = Math.floor(Math.random() * numNodes);

    // Avoid self-loops and ensure different source/target if only 2 nodes.
    // Give up after some tries to prevent infinite loop on dense graphs or small node counts.
    let tries = 0;
    while ((sourceIndex === targetIndex || edgeSet.has(`${sourceIndex}-${targetIndex}`) || (!directed && edgeSet.has(`${targetIndex}-${sourceIndex}`))) && tries < numNodes * numNodes) {
      sourceIndex = Math.floor(Math.random() * numNodes);
      targetIndex = Math.floor(Math.random() * numNodes);
      tries++;
    }
     if (sourceIndex === targetIndex && numNodes > 1) continue; // Skip if still a self-loop

    if (!edgeSet.has(`${sourceIndex}-${targetIndex}`) && (directed || !edgeSet.has(`${targetIndex}-${sourceIndex}`))) {
      edges.push({
        id: `e${i}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        weight: Math.floor(Math.random() * maxWeight) + 1,
        directed,
      });
      edgeSet.add(`${sourceIndex}-${targetIndex}`);
      if(!directed) edgeSet.add(`${targetIndex}-${sourceIndex}`);
    }
  }

  return { nodes, edges };
}
