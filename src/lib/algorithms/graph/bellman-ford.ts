
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

export function* bellmanFordGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  targetNodeId?: string
): Generator<GraphStep, GraphStep | undefined, void> {
  if (!nodes.find(n => n.id === startNodeId)) {
    const errorStep: GraphStep = {
      nodes,
      edges,
      message: `Error: Start node "${startNodeId}" not found.`,
      isFinalStep: true,
      highlights: [],
    };
    yield errorStep;
    return errorStep;
  }
   if (targetNodeId && targetNodeId.trim() !== '' && !nodes.find(n => n.id === targetNodeId)) {
     const errorStep: GraphStep = {
      nodes,
      edges,
      message: `Error: Target node "${targetNodeId}" not found.`,
      isFinalStep: true,
      highlights: [],
    };
    yield errorStep;
    return errorStep;
  }


  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });
  distances[startNodeId] = 0;

  const createHighlights = (
    currentEdgeId?: string,
    updatedNodeId?: string,
    passNum?: number,
    isNegativeCycleCheck?: boolean,
    negativeCycleNodeId?: string
  ): GraphElementHighlight[] => {
    return nodes.map(n => {
      let color: GraphHighlightColor = 'neutral';
      const label = distances[n.id] === Infinity ? '∞' : String(distances[n.id]);

      if (n.id === updatedNodeId) {
        color = 'primary'; 
      } else if (n.id === negativeCycleNodeId) {
        color = 'destructive'; 
      } else if (predecessors[n.id] !== null || n.id === startNodeId) {
        color = 'visited'; 
      }
      return { id: n.id, type: 'node', color, label };
    }).concat(edges.map(e => {
      let color: GraphHighlightColor = 'neutral';
      if (e.id === currentEdgeId) {
        color = isNegativeCycleCheck ? 'destructive' : 'secondary'; 
      }
      return { id: e.id, type: 'edge', color };
    }));
  };

  yield {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: `Starting Bellman-Ford from node ${startNodeId}. Initializing distances.`,
    isFinalStep: false,
    highlights: createHighlights(),
  };

  
  for (let i = 0; i < nodes.length - 1; i++) {
    let relaxedThisPass = false;
    yield {
      nodes: [...nodes],
      edges: [...edges],
      distances: { ...distances },
      predecessors: { ...predecessors },
      message: `Pass ${i + 1} of ${nodes.length -1}. Relaxing edges.`,
      isFinalStep: false,
      highlights: createHighlights(undefined, undefined, i+1),
    };

    for (const edge of edges) {
      const u = edge.source;
      const v = edge.target;
      const weight = edge.weight || 0; 

      yield { 
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        message: `Pass ${i + 1}: Considering edge ${edge.id} (${u} -> ${v}, weight ${weight}).`,
        isFinalStep: false,
        highlights: createHighlights(edge.id, undefined, i+1),
      };

      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
        predecessors[v] = u;
        relaxedThisPass = true;
        yield {
          nodes: [...nodes],
          edges: [...edges],
          distances: { ...distances },
          predecessors: { ...predecessors },
          message: `Pass ${i + 1}: Relaxed edge ${edge.id}. Distance to ${v} updated to ${distances[v]}.`,
          isFinalStep: false,
          highlights: createHighlights(edge.id, v, i+1),
        };
      }
    }
    if (!relaxedThisPass && i < nodes.length -2) { 
        yield {
            nodes: [...nodes],
            edges: [...edges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            message: `Pass ${i + 1}: No distances updated in this pass. Shortest paths found. Checking for negative cycles next.`,
            isFinalStep: false, 
            highlights: createHighlights(undefined, undefined, i + 1),
        };
        break; 
    }
  }

  
  yield {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: `Checking for negative-weight cycles...`,
    isFinalStep: false,
    highlights: createHighlights(undefined, undefined, undefined, true),
  };

  for (const edge of edges) {
    const u = edge.source;
    const v = edge.target;
    const weight = edge.weight || 0;

    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
      
      
      let cycleNode = v;
      const path = new Set<string>();
      for(let k=0; k<nodes.length; ++k) { 
        path.add(cycleNode);
        if(predecessors[cycleNode] === null) break;
        cycleNode = predecessors[cycleNode]!;
        if(path.has(cycleNode)) break; 
      }
      
      const finalHighlights = createHighlights(edge.id, v, undefined, true, v);
      
      path.forEach(nodeId => {
        const nodeIdx = finalHighlights.findIndex(h => h.id === nodeId && h.type === 'node');
        if(nodeIdx !== -1) finalHighlights[nodeIdx].color = 'destructive';
      });
      
      const edgeIdx = finalHighlights.findIndex(h => h.id === edge.id && h.type === 'edge');
      if(edgeIdx !== -1) finalHighlights[edgeIdx].color = 'destructive';


      const negCycleStep: GraphStep = {
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        message: `Negative-weight cycle detected involving edge ${edge.id} (${u} -> ${v}). Further relaxation possible for node ${v}. Shortest paths are undefined or infinitely negative for nodes reachable from this cycle.`,
        isFinalStep: true,
        highlights: finalHighlights,
      };
      yield negCycleStep;
      return negCycleStep;
    }
  }
  
  let finalMessage = `Bellman-Ford complete. No negative-weight cycles detected.`;
  let finalPathNodes: string[] | undefined = undefined;
  let finalPathEdges: string[] | undefined = undefined;

  if (targetNodeId && targetNodeId.trim() !== '') {
    if (distances[targetNodeId] === Infinity) {
      finalMessage = `Target node ${targetNodeId} is not reachable from ${startNodeId}.`;
    } else {
      finalMessage = `Shortest path to ${targetNodeId} found. Distance: ${distances[targetNodeId]}.`;
      finalPathNodes = [];
      finalPathEdges = [];
      let curr: string | null = targetNodeId;
      const pathTraceSet = new Set<string>(); 
      while (curr && curr !== startNodeId && !pathTraceSet.has(curr)) {
        pathTraceSet.add(curr);
        finalPathNodes.unshift(curr);
        const predNode = predecessors[curr];
        if (predNode) {
           const edgeToHighlight = edges.find(e => (e.source === predNode && e.target === curr) || (e.target === predNode && e.source === curr && !e.directed)); 
           if (edgeToHighlight) {
                finalPathEdges.unshift(edgeToHighlight.id);
           }
        }
        curr = predNode;
      }
      if (curr === startNodeId) {
         finalPathNodes.unshift(startNodeId);
      } else if (pathTraceSet.has(curr!)) { 
        finalMessage = `Path to target ${targetNodeId} involves a cycle (likely due to earlier state if negative cycle wasn't global). Distance ${distances[targetNodeId]} shown, but path reconstruction complex.`;
        finalPathNodes = undefined; 
        finalPathEdges = undefined;
      } else if (finalPathNodes.length === 0 && startNodeId !== targetNodeId) { 
        finalMessage = `Could not reconstruct path to ${targetNodeId}, though distance is ${distances[targetNodeId]}.`;
        finalPathNodes = undefined;
        finalPathEdges = undefined;
      } else if (startNodeId === targetNodeId) {
        finalPathNodes = [startNodeId];
        finalPathEdges = [];
      }
    }
  }

  const finalStepHighlights = createHighlights();
  
   if (finalPathNodes && finalPathEdges) {
    finalPathNodes.forEach(nodeId => {
      const nodeIdx = finalStepHighlights.findIndex(h => h.id === nodeId && h.type === 'node');
      if (nodeIdx !== -1) finalStepHighlights[nodeIdx].color = 'path';
    });
    finalPathEdges.forEach(edgeId => {
      const edgeIdx = finalStepHighlights.findIndex(h => h.id === edgeId && h.type === 'edge');
      if (edgeIdx !== -1) finalStepHighlights[edgeIdx].color = 'path';
    });
  }


  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: finalMessage,
    isFinalStep: true,
    targetFoundPath: finalPathNodes,
    highlights: finalStepHighlights,
  };
  yield finalStep;
  return finalStep;
}

    
