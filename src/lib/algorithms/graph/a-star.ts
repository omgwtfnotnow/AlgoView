
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

// Heuristic function (Euclidean distance)
function heuristic(nodeA: GraphNode, nodeB: GraphNode): number {
  if (nodeA.x === undefined || nodeA.y === undefined || nodeB.x === undefined || nodeB.y === undefined) {
    // Fallback if coordinates are missing - this makes A* behave like Dijkstra
    // console.warn("A* heuristic: Coordinates missing, using h=0.");
    return 0; 
  }
  return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
}

export function* aStarGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  targetNodeId: string // Target is mandatory for A*
): Generator<GraphStep, GraphStep | undefined, void> {
  
  const startNode = nodes.find(n => n.id === startNodeId);
  const targetNode = nodes.find(n => n.id === targetNodeId);

  if (!startNode) {
    const errorStep: GraphStep = { nodes, edges, message: `Error: Start node "${startNodeId}" not found.`, isFinalStep: true, highlights: [] };
    yield errorStep;
    return errorStep;
  }
  if (!targetNode) {
    const errorStep: GraphStep = { nodes, edges, message: `Error: Target node "${targetNodeId}" not found.`, isFinalStep: true, highlights: [] };
    yield errorStep;
    return errorStep;
  }

  const openSet: string[] = [startNodeId]; // Nodes to be evaluated
  const cameFrom: Record<string, string> = {}; // For path reconstruction

  const gScore: Record<string, number> = {}; // Cost from start along best known path.
  nodes.forEach(node => gScore[node.id] = Infinity);
  gScore[startNodeId] = 0;

  const fScore: Record<string, number> = {}; // Estimated total cost from start to goal through y.
  nodes.forEach(node => fScore[node.id] = Infinity);
  fScore[startNodeId] = heuristic(startNode, targetNode);
  
  let heuristicUsedCoordinates = true; // Flag to track if heuristic used coordinates

  const createHighlights = (
    currentProcessingNodeId?: string,
    currentNeighborId?: string,
    pathNodes?: string[],
  ): GraphElementHighlight[] => {
    return nodes.map(n => {
      let color: GraphHighlightColor = 'neutral';
      let label = `${n.label || n.id}`;
      const g = gScore[n.id] === Infinity ? '∞' : gScore[n.id].toFixed(1);
      const hValNode = nodes.find(node => node.id === n.id);
      const hTargetNode = nodes.find(node => node.id === targetNodeId);
      let h = 'N/A';
      if(hValNode && hTargetNode) {
         const hCalc = heuristic(hValNode, hTargetNode);
         if (hValNode.x === undefined) heuristicUsedCoordinates = false; // Track if fallback was used
         h = hCalc.toFixed(1);
      }
      const f = fScore[n.id] === Infinity ? '∞' : fScore[n.id].toFixed(1);
      
      label += `\ng:${g} h:${h}\nf:${f}`;

      if (pathNodes?.includes(n.id)) color = 'path';
      else if (n.id === currentProcessingNodeId) color = 'secondary'; // Current
      else if (openSet.includes(n.id)) color = 'primary';         // In OpenSet
      else if (gScore[n.id] !== Infinity && !openSet.includes(n.id)) color = 'visited'; // In ClosedSet (processed)
      
      if (n.id === currentNeighborId && color !=='path') color = 'info'; // Examining neighbor

      return { id: n.id, type: 'node', color, label };
    }).concat(edges.map(e => {
      let color: GraphHighlightColor = 'neutral';
       if (pathNodes && cameFrom[e.target] === e.source && pathNodes.includes(e.target) && pathNodes.includes(e.source)) {
        color = 'path';
      } else if (pathNodes && cameFrom[e.source] === e.target && pathNodes.includes(e.source) && pathNodes.includes(e.target) && !e.directed) {
        color = 'path'; // For undirected graphs path
      }
      return { id: e.id, type: 'edge', color };
    }));
  };
  
  let initialMessage = `Starting A* Search from ${startNode.label || startNodeId} to ${targetNode.label || targetNodeId}.`;
  if (startNode.x === undefined || startNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) {
    initialMessage += " (Warning: Node coordinates missing, heuristic may be 0, A* might behave like Dijkstra).";
    heuristicUsedCoordinates = false;
  }


  yield {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...gScore }, // gScore is equivalent to distances
    fScores: { ...fScore },
    predecessors: { ...cameFrom },
    message: initialMessage,
    isFinalStep: false,
    highlights: createHighlights(),
  };

  while (openSet.length > 0) {
    // Find node in openSet having the lowest fScore[] value
    let currentId = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (fScore[openSet[i]] < fScore[currentId]) {
        currentId = openSet[i];
      }
    }
    
    const currentNode = nodes.find(n => n.id === currentId)!;

    if (currentId === targetNodeId) {
      // Path found
      const path: string[] = [];
      let curr = targetNodeId;
      while (cameFrom[curr]) {
        path.unshift(curr);
        curr = cameFrom[curr];
      }
      path.unshift(startNodeId);
      const finalStepPath: GraphStep = {
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...gScore },
        fScores: { ...fScore },
        predecessors: { ...cameFrom },
        targetFoundPath: path,
        message: `Path found to ${targetNode.label || targetNodeId}! Cost: ${gScore[targetNodeId].toFixed(2)}. Path: ${path.map(id => nodes.find(n=>n.id===id)?.label || id).join(' -> ')}`,
        isFinalStep: true,
        highlights: createHighlights(currentId, undefined, path),
      };
      yield finalStepPath;
      return finalStepPath;
    }

    // Remove current from openSet
    openSet.splice(openSet.indexOf(currentId), 1);

    yield {
      nodes: [...nodes],
      edges: [...edges],
      distances: { ...gScore },
      fScores: { ...fScore },
      predecessors: { ...cameFrom },
      currentNodeId: currentId,
      message: `Visiting node ${currentNode.label || currentId}. Removed from OpenSet. Adding to ClosedSet. F-Score: ${fScore[currentId].toFixed(2)}`,
      isFinalStep: false,
      highlights: createHighlights(currentId),
    };

    const neighbors = edges.filter(edge => edge.source === currentId || (edge.target === currentId && !edge.directed));
    for (const edge of neighbors) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      const neighborNode = nodes.find(n => n.id === neighborId)!;
      const weight = edge.weight || 1; // Default weight

      const tentativeGScore = gScore[currentId] + weight;

      yield {
        nodes: [...nodes],
        edges: [...edges],
        distances: { ...gScore },
        fScores: { ...fScore },
        predecessors: { ...cameFrom },
        currentNodeId: currentId,
        message: `Evaluating neighbor ${neighborNode.label || neighborId} of ${currentNode.label || currentId}. Tentative gScore: ${tentativeGScore.toFixed(2)}. Current gScore: ${gScore[neighborId] === Infinity ? '∞' : gScore[neighborId].toFixed(2)}`,
        isFinalStep: false,
        highlights: createHighlights(currentId, neighborId),
      };

      if (tentativeGScore < gScore[neighborId]) {
        cameFrom[neighborId] = currentId;
        gScore[neighborId] = tentativeGScore;
        const hNeighbor = heuristic(neighborNode, targetNode);
        if (neighborNode.x === undefined) heuristicUsedCoordinates = false;
        fScore[neighborId] = gScore[neighborId] + hNeighbor;
        
        let neighborMessage = `Path to ${neighborNode.label || neighborId} improved. New gScore: ${gScore[neighborId].toFixed(2)}, hScore: ${hNeighbor.toFixed(2)}, fScore: ${fScore[neighborId].toFixed(2)}.`;
        if (!openSet.includes(neighborId)) {
          openSet.push(neighborId);
          neighborMessage += ` Added ${neighborNode.label || neighborId} to OpenSet.`;
        } else {
            neighborMessage += ` Updated ${neighborNode.label || neighborId} in OpenSet.`;
        }
        
        yield {
          nodes: [...nodes],
          edges: [...edges],
          distances: { ...gScore },
          fScores: { ...fScore },
          predecessors: { ...cameFrom },
          currentNodeId: currentId,
          message: neighborMessage,
          isFinalStep: false,
          highlights: createHighlights(currentId, neighborId),
        };
      } else {
         yield {
          nodes: [...nodes],
          edges: [...edges],
          distances: { ...gScore },
          fScores: { ...fScore },
          predecessors: { ...cameFrom },
          currentNodeId: currentId,
          message: `Path to ${neighborNode.label || neighborId} via ${currentNode.label || currentId} (gScore: ${tentativeGScore.toFixed(2)}) is not better. No update.`,
          isFinalStep: false,
          highlights: createHighlights(currentId, neighborId),
        };
      }
    }
  }

  // Open set is empty, but goal was never reached
  const finalStepFailure: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    distances: { ...gScore },
    fScores: { ...fScore },
    predecessors: { ...cameFrom },
    message: `Failed to find a path to ${targetNode.label || targetNodeId}. OpenSet is empty. ${!heuristicUsedCoordinates ? "(Warning: Node coordinates missing, A* may have behaved like Dijkstra)." : ""}`,
    isFinalStep: true,
    highlights: createHighlights(),
  };
  yield finalStepFailure;
  return finalStepFailure;
}
