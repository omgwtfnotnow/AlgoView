
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

export function* dijkstraGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  targetNodeId?: string // Optional target node
): Generator<GraphStep, GraphStep | void, void> {
  if (!nodes.find(n => n.id === startNodeId)) {
    const errorStep: GraphStep = {
      nodes,
      edges,
      message: `Error: Start node "${startNodeId}" not found in the graph.`,
      isFinalStep: true,
      highlights: [],
    };
    yield errorStep;
    return errorStep;
  }
  if (targetNodeId && !nodes.find(n => n.id === targetNodeId)) {
     const errorStep: GraphStep = {
      nodes,
      edges,
      message: `Error: Target node "${targetNodeId}" not found in the graph.`,
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
  pq.sort((a, b) => a.distance - b.distance); // Simple sort for PQ simulation

  const initialHighlights: GraphElementHighlight[] = nodes.map(n => ({
    id: n.id,
    type: 'node',
    color: n.id === startNodeId ? 'primary' : 'neutral',
    label: `${distances[n.id] === Infinity ? '∞' : distances[n.id]}`
  })).concat(edges.map(e => ({ id: e.id, type: 'edge', color: 'neutral' })));

  yield {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: `Starting Dijkstra's from node ${startNodeId}. Initializing distances.`,
    isFinalStep: false,
    highlights: initialHighlights,
  };

  while (pq.length > 0) {
    pq.sort((a, b) => a.distance - b.distance); // Re-sort to simulate min-priority queue
    const { id: u, distance: uDistance } = pq.shift()!; // Get node with smallest distance

    if (visited.has(u)) continue;
    visited.add(u);

    const currentHighlights: GraphElementHighlight[] = nodes.map(n => {
      let color: GraphHighlightColor = 'neutral';
      if (n.id === u) color = 'secondary'; // Current processing node
      else if (visited.has(n.id)) color = 'visited';
      else if (pq.some(item => item.id === n.id)) color = 'primary'; // In priority queue
      return { id: n.id, type: 'node', color, label: `${distances[n.id] === Infinity ? '∞' : distances[n.id]}` };
    }).concat(edges.map(e => ({ id: e.id, type: 'edge', color: 'neutral' })));
    
    yield {
      nodes: [...nodes],
      edges: [...edges],
      distances: { ...distances },
      predecessors: { ...predecessors },
      currentNodeId: u,
      message: `Visiting node ${u}. Distance: ${uDistance}. Examining neighbors.`,
      isFinalStep: false,
      highlights: currentHighlights,
    };
    
    if (targetNodeId && u === targetNodeId) {
        break; // Found target node
    }

    const neighbors = edges.filter(edge => edge.source === u || (edge.target === u && !edge.directed));
    for (const edge of neighbors) {
      const v = edge.source === u ? edge.target : edge.source;
      if (visited.has(v)) continue;

      const weight = edge.weight || 1;
      const altDistance = distances[u] + weight;

      const edgeHighlightColor: GraphHighlightColor = 'info';
      const neighborHighlights = [...currentHighlights];
      const edgeHIndex = neighborHighlights.findIndex(h => h.id === edge.id && h.type === 'edge');
      if (edgeHIndex !== -1) neighborHighlights[edgeHIndex].color = edgeHighlightColor;
      const nodeVIndex = neighborHighlights.findIndex(h => h.id === v && h.type === 'node');
       if (nodeVIndex !== -1 && neighborHighlights[nodeVIndex].color !== 'secondary') {
            neighborHighlights[nodeVIndex].color = 'info'; // Highlight neighbor being considered
        }


      yield {
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        currentNodeId: u,
        message: `Checking neighbor ${v} via edge ${edge.id} (weight ${weight}). Current distance to ${v}: ${distances[v]}. New path distance: ${altDistance}.`,
        isFinalStep: false,
        highlights: neighborHighlights,
      };

      if (altDistance < distances[v]) {
        distances[v] = altDistance;
        predecessors[v] = u;
        pq.push({ id: v, distance: altDistance });
        // Update highlights for the relaxed node
        const nodeVHighlightIndex = neighborHighlights.findIndex(h => h.id === v && h.type === 'node');
        if (nodeVHighlightIndex !== -1) {
            neighborHighlights[nodeVHighlightIndex].label = `${altDistance}`;
            neighborHighlights[nodeVHighlightIndex].color = 'primary'; // Updated, in PQ
        }
         const edgeToVIndex = neighborHighlights.findIndex(h => h.id === edge.id && h.type === 'edge');
          if(edgeToVIndex !== -1) neighborHighlights[edgeToVIndex].color = 'primary';


        yield {
            nodes: [...nodes],
            edges: [...edges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            currentNodeId: u,
            message: `Relaxed edge ${edge.id} to ${v}. New distance to ${v} is ${altDistance}. Adding/Updating ${v} in priority queue.`,
            isFinalStep: false,
            highlights: [...neighborHighlights], // Show updated distance on node
        };
      }
    }
  }

  let finalMessage = `Dijkstra's complete. All reachable nodes visited.`;
  let finalPath: string[] | undefined = undefined;
  const finalHighlights = nodes.map(n => ({
    id: n.id,
    type: 'node' as const,
    color: visited.has(n.id) ? 'visited' as GraphHighlightColor : 'muted' as GraphHighlightColor,
    label: `${distances[n.id] === Infinity ? '∞' : distances[n.id]}`
  })).concat(edges.map(e => ({ id: e.id, type: 'edge' as const, color: 'muted' as GraphHighlightColor })));


  if (targetNodeId) {
    if (distances[targetNodeId] === Infinity) {
      finalMessage = `Target node ${targetNodeId} is not reachable from ${startNodeId}.`;
    } else {
      finalMessage = `Shortest path to ${targetNodeId} found. Distance: ${distances[targetNodeId]}.`;
      finalPath = [];
      let curr: string | null = targetNodeId;
      while (curr) {
        finalPath.unshift(curr);
        const predNode = predecessors[curr];
        if (predNode) {
           const edgeToHighlight = edges.find(e => (e.source === predNode && e.target === curr) || (e.source === curr && e.target === predNode && !e.directed));
           if(edgeToHighlight) {
                const edgeHIdx = finalHighlights.findIndex(h => h.id === edgeToHighlight.id && h.type === 'edge');
                if(edgeHIdx !== -1) finalHighlights[edgeHIdx].color = 'path';
           }
        }
        curr = predNode;
      }
       finalPath.forEach(nodeId => {
            const nodeHIdx = finalHighlights.findIndex(h => h.id === nodeId && h.type === 'node');
            if(nodeHIdx !== -1) finalHighlights[nodeHIdx].color = 'path';
       });
    }
  }


  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...distances },
    predecessors: { ...predecessors },
    message: finalMessage,
    isFinalStep: true,
    targetFoundPath: finalPath,
    highlights: finalHighlights,
  };
  yield finalStep;
  return finalStep;
}
