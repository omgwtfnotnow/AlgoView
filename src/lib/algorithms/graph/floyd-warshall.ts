
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

export function* floydWarshallGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Generator<GraphStep, GraphStep | undefined, void> {
  const nodeIds = nodes.map(n => n.id);
  const numNodes = nodes.length;
  if (numNodes === 0) {
    const emptyStep: GraphStep = { nodes, edges, message: "Graph is empty.", isFinalStep: true, highlights: [] };
    yield emptyStep;
    return emptyStep;
  }

  const distanceMatrix: Record<string, Record<string, number | typeof Infinity>> = {};
  const nextHopMatrix: Record<string, Record<string, string | null>> = {};

  // Initialization
  for (const id1 of nodeIds) {
    distanceMatrix[id1] = {};
    nextHopMatrix[id1] = {};
    for (const id2 of nodeIds) {
      if (id1 === id2) {
        distanceMatrix[id1][id2] = 0;
        nextHopMatrix[id1][id2] = id2;
      } else {
        distanceMatrix[id1][id2] = Infinity;
        nextHopMatrix[id1][id2] = null;
      }
    }
  }

  for (const edge of edges) {
    const u = edge.source;
    const v = edge.target;
    const weight = edge.weight === undefined ? 1 : edge.weight;
    if (distanceMatrix[u][v] > weight) { // Handle parallel edges by taking the minimum
        distanceMatrix[u][v] = weight;
        nextHopMatrix[u][v] = v;
    }
    if (!edge.directed && distanceMatrix[v][u] > weight) { // For undirected graphs
        distanceMatrix[v][u] = weight;
        nextHopMatrix[v][u] = u;
    }
  }
  
  const createInitialHighlights = (): GraphElementHighlight[] => {
      return nodes.map(n => ({ id: n.id, type: 'node', color: 'neutral' as GraphHighlightColor}))
                  .concat(edges.map(e => ({id: e.id, type: 'edge', color: 'neutral' as GraphHighlightColor})));
  }

  yield {
    nodes: [...nodes],
    edges: [...edges],
    distanceMatrix: JSON.parse(JSON.stringify(distanceMatrix)),
    nextHopMatrix: JSON.parse(JSON.stringify(nextHopMatrix)),
    message: "Initialized distance and next hop matrices.",
    isFinalStep: false,
    highlights: createInitialHighlights(),
  };

  // Main Floyd-Warshall loops
  for (let kIdx = 0; kIdx < numNodes; kIdx++) {
    const kNodeId = nodeIds[kIdx];
    for (let iIdx = 0; iIdx < numNodes; iIdx++) {
      const iNodeId = nodeIds[iIdx];
      for (let jIdx = 0; jIdx < numNodes; jIdx++) {
        const jNodeId = nodeIds[jIdx];

        const currentHighlights: GraphElementHighlight[] = nodes.map(n => {
            let color: GraphHighlightColor = 'neutral';
            if (n.id === kNodeId) color = 'secondary'; // Intermediate node k
            else if (n.id === iNodeId) color = 'primary';   // Source node i
            else if (n.id === jNodeId && iNodeId !== jNodeId) color = 'info';      // Destination node j
            return { id: n.id, type: 'node', color, label: n.label || n.id };
        }).concat(edges.map(e => ({id: e.id, type: 'edge', color: 'neutral'})));
        
        // Highlight edges forming path i->k and k->j if they exist conceptually
        const ikEdge = edges.find(e => (e.source === iNodeId && e.target === kNodeId) || (!e.directed && e.source === kNodeId && e.target === iNodeId));
        const kjEdge = edges.find(e => (e.source === kNodeId && e.target === jNodeId) || (!e.directed && e.source === jNodeId && e.target === kNodeId));
        if(ikEdge) {
            const hIdx = currentHighlights.findIndex(h => h.id === ikEdge.id && h.type==='edge');
            if(hIdx !== -1) currentHighlights[hIdx].color = 'primary';
        }
         if(kjEdge) {
            const hIdx = currentHighlights.findIndex(h => h.id === kjEdge.id && h.type==='edge');
            if(hIdx !== -1) currentHighlights[hIdx].color = 'info';
        }


        yield {
          nodes: [...nodes],
          edges: [...edges],
          distanceMatrix: JSON.parse(JSON.stringify(distanceMatrix)),
          nextHopMatrix: JSON.parse(JSON.stringify(nextHopMatrix)),
          currentKNodeId: kNodeId,
          currentSourceNodeId: iNodeId,
          currentDestNodeId: jNodeId,
          message: `Iteration k=${kNodeId}, i=${iNodeId}, j=${jNodeId}. Checking path ${iNodeId} -> ${kNodeId} -> ${jNodeId}. dist(${iNodeId},${jNodeId}) = ${distanceMatrix[iNodeId][jNodeId]}, dist(${iNodeId},${kNodeId}) + dist(${kNodeId},${jNodeId}) = ${distanceMatrix[iNodeId][kNodeId] === Infinity || distanceMatrix[kNodeId][jNodeId] === Infinity ? '∞' : distanceMatrix[iNodeId][kNodeId] + distanceMatrix[kNodeId][jNodeId]}`,
          isFinalStep: false,
          highlights: currentHighlights,
        };

        if (distanceMatrix[iNodeId][kNodeId] !== Infinity &&
            distanceMatrix[kNodeId][jNodeId] !== Infinity &&
            distanceMatrix[iNodeId][kNodeId] + distanceMatrix[kNodeId][jNodeId] < distanceMatrix[iNodeId][jNodeId]) {
          
          distanceMatrix[iNodeId][jNodeId] = distanceMatrix[iNodeId][kNodeId] + distanceMatrix[kNodeId][jNodeId];
          nextHopMatrix[iNodeId][jNodeId] = nextHopMatrix[iNodeId][kNodeId];

          const updatedHighlights = [...currentHighlights];
          // Highlight path i->j if it exists as a direct edge, to show it's being updated
            const ijEdge = edges.find(e => (e.source === iNodeId && e.target === jNodeId) || (!e.directed && e.source === jNodeId && e.target === iNodeId));
            if(ijEdge){
                const hIdx = updatedHighlights.findIndex(h => h.id === ijEdge.id && h.type==='edge');
                if(hIdx !== -1) updatedHighlights[hIdx].color = 'accent';
            }


          yield {
            nodes: [...nodes],
            edges: [...edges],
            distanceMatrix: JSON.parse(JSON.stringify(distanceMatrix)),
            nextHopMatrix: JSON.parse(JSON.stringify(nextHopMatrix)),
            currentKNodeId: kNodeId,
            currentSourceNodeId: iNodeId,
            currentDestNodeId: jNodeId,
            message: `Updated dist(${iNodeId},${jNodeId}) to ${distanceMatrix[iNodeId][jNodeId]} via ${kNodeId}. Next hop from ${iNodeId} to ${jNodeId} is ${nextHopMatrix[iNodeId][jNodeId]}.`,
            isFinalStep: false,
            highlights: updatedHighlights,
          };
        }
      }
    }
  }

  // Check for negative cycles
  for (let i = 0; i < numNodes; i++) {
    if (distanceMatrix[nodeIds[i]][nodeIds[i]] < 0) {
      const finalStepNegativeCycle: GraphStep = {
        nodes: [...nodes],
        edges: [...edges],
        distanceMatrix: JSON.parse(JSON.stringify(distanceMatrix)),
        nextHopMatrix: JSON.parse(JSON.stringify(nextHopMatrix)),
        message: `Negative-weight cycle detected (e.g., involving node ${nodeIds[i]}). Shortest paths are not well-defined.`,
        isFinalStep: true,
        negativeCycleDetected: true,
        highlights: nodes.map(n => ({ id: n.id, type: 'node', color: distanceMatrix[n.id][n.id] < 0 ? 'destructive' : 'neutral' as GraphHighlightColor}))
                        .concat(edges.map(e => ({id: e.id, type: 'edge', color: 'neutral' as GraphHighlightColor}))),
      };
      yield finalStepNegativeCycle;
      return finalStepNegativeCycle;
    }
  }

  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    distanceMatrix: JSON.parse(JSON.stringify(distanceMatrix)),
    nextHopMatrix: JSON.parse(JSON.stringify(nextHopMatrix)),
    message: "Floyd-Warshall algorithm complete. All-pairs shortest paths computed.",
    isFinalStep: true,
    highlights: createInitialHighlights(), // Reset highlights or show final state
  };
  yield finalStep;
  return finalStep;
}
