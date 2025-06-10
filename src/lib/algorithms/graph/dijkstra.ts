
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

export function* dijkstraGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  targetNodeId?: string // Optional target node
): Generator<GraphStep, GraphStep | undefined, void> {
  if (!nodes.find(n => n.id === startNodeId)) {
    const errorStep: GraphStep = {
      nodes,
      edges,
      message: `Error: Start node "${startNodeId}" not found in the graph. Please ensure the ID is correct.`,
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
      message: `Error: Target node "${targetNodeId}" not found in the graph. Please ensure the ID is correct or leave it empty if not searching for a specific target.`,
      isFinalStep: true,
      highlights: [],
    };
    yield errorStep;
    return errorStep;
  }


  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();
  const pq: { id: string; distance: number }[] = []; // Priority Queue (min-heap by distance)

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });
  distances[startNodeId] = 0;

  pq.push({ id: startNodeId, distance: 0 });
  // No need to sort pq initially, the loop logic handles it

  const createHighlights = (currentProcessingNodeId?: string, pathNodes?: string[], pathEdges?: string[]): GraphElementHighlight[] => {
    return nodes.map(n => {
      let color: GraphHighlightColor = 'neutral';
      let label = distances[n.id] === Infinity ? '∞' : String(distances[n.id]);

      if (pathNodes?.includes(n.id)) {
        color = 'path';
      } else if (n.id === currentProcessingNodeId) {
        color = 'secondary';
      } else if (visited.has(n.id)) {
        color = 'visited';
      } else if (pq.some(item => item.id === n.id)) {
        color = 'primary';
      }
      return { id: n.id, type: 'node', color, label };
    }).concat(edges.map(e => {
      let color: GraphHighlightColor = 'neutral';
      if (pathEdges?.includes(e.id)) {
        color = 'path';
      }
      return { id: e.id, type: 'edge', color };
    }));
  };
  
  yield {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: `Starting Dijkstra's from node ${startNodeId}. Initializing distances. Priority queue: [${pq.map(item => `${item.id}(${item.distance})`).join(', ')}]`,
    isFinalStep: false,
    highlights: createHighlights(),
  };

  while (pq.length > 0) {
    pq.sort((a, b) => a.distance - b.distance); // Re-sort to simulate min-priority queue
    const { id: u } = pq.shift()!; // Get node with smallest distance

    if (visited.has(u)) continue; // Already processed this node with a shorter path
    visited.add(u);

    yield {
      nodes: [...nodes],
      edges: [...edges],
      distances: { ...distances },
      predecessors: { ...predecessors },
      currentNodeId: u,
      message: `Visiting node ${u}. Distance: ${distances[u]}. Marked as visited. PQ: [${pq.map(item => `${item.id}(${item.distance})`).join(', ')}]`,
      isFinalStep: false,
      highlights: createHighlights(u),
    };
    
    if (targetNodeId && u === targetNodeId) {
        // Target found, break loop and yield final path step
        break; 
    }

    // Get neighbors of u
    const neighbors = edges.filter(edge => edge.source === u || (edge.target === u && !edge.directed));
    for (const edge of neighbors) {
      const v = edge.source === u ? edge.target : edge.source;
      
      // Create highlights for examining edge
      const examiningEdgeHighlights = createHighlights(u);
      const edgeHIndex = examiningEdgeHighlights.findIndex(h => h.id === edge.id && h.type === 'edge');
      if (edgeHIndex !== -1) examiningEdgeHighlights[edgeHIndex].color = 'info';
      const nodeVIndex = examiningEdgeHighlights.findIndex(h => h.id === v && h.type === 'node');
      if (nodeVIndex !== -1 && examiningEdgeHighlights[nodeVIndex].color !== 'secondary' && examiningEdgeHighlights[nodeVIndex].color !== 'visited') {
          examiningEdgeHighlights[nodeVIndex].color = 'info'; // Highlight neighbor being considered
      }

      yield {
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        currentNodeId: u,
        message: `Examining neighbor ${v} of ${u} via edge ${edge.id} (weight ${edge.weight || 1}).`,
        isFinalStep: false,
        highlights: examiningEdgeHighlights,
      };

      if (visited.has(v)) { // If neighbor already visited, skip relaxation (unless graph allows re-opening nodes, standard Dijkstra doesn't for non-negative weights)
         yield {
            nodes: [...nodes],
            edges: [...edges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            currentNodeId: u,
            message: `Neighbor ${v} already visited. Skipping relaxation.`,
            isFinalStep: false,
            highlights: createHighlights(u), // Revert examining highlights
        };
        continue;
      }


      const weight = edge.weight || 1; // Default weight to 1 if undefined
      const altDistance = distances[u] + weight;

      if (altDistance < distances[v]) {
        distances[v] = altDistance;
        predecessors[v] = u;
        
        // Remove old entry for v if exists, then add new one
        const vInPqIndex = pq.findIndex(item => item.id === v);
        if (vInPqIndex > -1) pq.splice(vInPqIndex, 1);
        pq.push({ id: v, distance: altDistance });

        const relaxedHighlights = createHighlights(u);
        const relaxedEdgeHIndex = relaxedHighlights.findIndex(h => h.id === edge.id && h.type === 'edge');
         if (relaxedEdgeHIndex !== -1) relaxedHighlights[relaxedEdgeHIndex].color = 'primary'; // Edge used for relaxation

        const relaxedNodeVIndex = relaxedHighlights.findIndex(h => h.id === v && h.type === 'node');
        if (relaxedNodeVIndex !== -1) {
            relaxedHighlights[relaxedNodeVIndex].label = String(altDistance); // Update label with new distance
            relaxedHighlights[relaxedNodeVIndex].color = 'primary'; // Mark as updated in PQ
        }

        yield {
            nodes: [...nodes],
            edges: [...edges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            currentNodeId: u,
            message: `Relaxed edge ${edge.id} to ${v}. New shortest distance to ${v} is ${altDistance}. Updated ${v} in priority queue. PQ: [${pq.map(item => `${item.id}(${item.distance})`).join(', ')}]`,
            isFinalStep: false,
            highlights: relaxedHighlights,
        };
      } else {
         yield {
            nodes: [...nodes],
            edges: [...edges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            currentNodeId: u,
            message: `Path to ${v} via ${u} (cost ${altDistance}) is not shorter than current distance ${distances[v]}. No relaxation.`,
            isFinalStep: false,
            highlights: createHighlights(u), // Revert examining highlights
        };
      }
    }
  }

  let finalMessage = `Dijkstra's complete. All reachable nodes visited.`;
  let finalPathNodes: string[] | undefined = undefined;
  let finalPathEdges: string[] | undefined = undefined;

  if (targetNodeId && targetNodeId.trim() !== '') {
    if (distances[targetNodeId] === Infinity || !visited.has(targetNodeId)) {
      finalMessage = `Target node ${targetNodeId} is not reachable from ${startNodeId}.`;
    } else {
      finalMessage = `Shortest path to ${targetNodeId} found. Distance: ${distances[targetNodeId]}.`;
      finalPathNodes = [];
      finalPathEdges = [];
      let curr: string | null = targetNodeId;
      while (curr && curr !== startNodeId) {
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
      if(curr === startNodeId) finalPathNodes.unshift(startNodeId); // Add start node to path
      if(finalPathNodes.length <=1 && distances[targetNodeId] !== Infinity && startNodeId !== targetNodeId) { // Path reconstruction failed or target is start
        finalPathNodes = undefined;
        finalPathEdges = undefined;
        if(startNodeId !== targetNodeId) finalMessage = `Could not reconstruct path to ${targetNodeId}, though it's marked reachable. Predecessor data might be incomplete.`;
        else finalMessage = `Target node ${targetNodeId} is the start node. Distance: 0.`;

      } else if (startNodeId === targetNodeId) {
        finalPathNodes = [startNodeId];
        finalPathEdges = [];
      }
    }
  }


  const finalHighlights = createHighlights(undefined, finalPathNodes, finalPathEdges);
  
  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: finalMessage,
    isFinalStep: true,
    targetFoundPath: finalPathNodes,
    highlights: finalHighlights,
  };
  yield finalStep;
  return finalStep;
}

