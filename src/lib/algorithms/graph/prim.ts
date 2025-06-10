
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';

export function* primGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeIdInput?: string
): Generator<GraphStep, GraphStep | undefined, void> {
  if (nodes.length === 0) {
    const emptyStep: GraphStep = { nodes, edges, message: "Graph is empty.", isFinalStep: true, highlights: [], mstWeight: 0 };
    yield emptyStep;
    return emptyStep;
  }

  let startNode = nodes.find(n => n.id === startNodeIdInput);
  if (!startNode) {
    startNode = nodes[0]; // Default to first node if startNodeId is invalid or not provided
  }
  const startNodeId = startNode.id;

  const mstEdges: GraphEdge[] = [];
  let mstWeight = 0;
  const visitedNodes = new Set<string>();
  
  // Priority Queue stores [weight, sourceNodeId, targetNodeId, edgeId]
  // For simplicity, we'll use an array and sort, but a MinHeap is more efficient
  const edgeCandidates: { weight: number; source: string; target: string; id: string }[] = [];

  const createHighlights = (
    currentMstNodeIds: Set<string>,
    candidateEdgeIds: string[],
    selectedEdgeId?: string
  ): GraphElementHighlight[] => {
    return nodes.map(n => ({
      id: n.id,
      type: 'node' as 'node',
      color: currentMstNodeIds.has(n.id) ? 'path' : 'neutral' as GraphHighlightColor,
      label: n.label || n.id,
    })).concat(edges.map(e => {
      let color: GraphHighlightColor = 'neutral';
      if (mstEdges.find(me => me.id === e.id)) color = 'path'; // Edge in MST
      else if (selectedEdgeId === e.id) color = 'accent'; // Edge just selected
      else if (candidateEdgeIds.includes(e.id)) color = 'secondary'; // Candidate edge
      return { id: e.id, type: 'edge' as 'edge', color };
    }));
  };

  visitedNodes.add(startNodeId);

  yield {
    nodes: [...nodes],
    edges: [...edges],
    message: `Starting Prim's algorithm from node ${startNode.label || startNodeId}.`,
    isFinalStep: false,
    highlights: createHighlights(visitedNodes, []),
    mstWeight: 0,
  };

  // Add initial edges from startNode
  edges.forEach(edge => {
    if (edge.source === startNodeId && !visitedNodes.has(edge.target)) {
      edgeCandidates.push({ weight: edge.weight || 0, source: edge.source, target: edge.target, id: edge.id });
    } else if (edge.target === startNodeId && !edge.source && !visitedNodes.has(edge.source) && !edge.directed) { // Undirected
      edgeCandidates.push({ weight: edge.weight || 0, source: edge.target, target: edge.source, id: edge.id });
    }
  });
  edgeCandidates.sort((a, b) => a.weight - b.weight);

  yield {
    nodes: [...nodes],
    edges: [...edges],
    message: `Added initial candidate edges from ${startNode.label || startNodeId}. Candidates count: ${edgeCandidates.length}`,
    isFinalStep: false,
    highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id)),
    mstWeight: 0,
  };


  while (edgeCandidates.length > 0 && mstEdges.length < nodes.length - 1) {
    const bestCandidate = edgeCandidates.shift(); // Get minimum weight edge
    if (!bestCandidate) break; 

    // The target of this edge is the node we are trying to add to visited set
    const { weight, source: u, target: v, id: edgeId } = bestCandidate;

    if (visitedNodes.has(v)) { // If target already visited (e.g. parallel edges or complex scenario)
       yield {
        nodes: [...nodes],
        edges: [...edges],
        message: `Considering edge ${edgeId} (${u}-${v}). Node ${v} already in MST. Discarding.`,
        isFinalStep: false,
        highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id), edgeId),
        mstWeight,
      };
      continue; // Skip this edge
    }
    
    yield {
        nodes: [...nodes],
        edges: [...edges],
        message: `Selected edge ${edgeId} (${u}-${v}) with weight ${weight}. Adding ${v} to MST.`,
        isFinalStep: false,
        highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id), edgeId),
        mstWeight,
    };


    mstEdges.push(edges.find(e => e.id === edgeId)!);
    mstWeight += weight;
    visitedNodes.add(v);

    yield {
      nodes: [...nodes],
      edges: [...edges],
      message: `Added edge ${edgeId} and node ${v} to MST. Current MST weight: ${mstWeight.toFixed(2)}.`,
      isFinalStep: false,
      highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id)), // Highlights updated MST
      mstWeight,
    };
    
    if (mstEdges.length === nodes.length -1) break; // MST complete

    // Add new candidate edges from the newly added node v
    edges.forEach(edge => {
      if (edge.source === v && !visitedNodes.has(edge.target)) {
        edgeCandidates.push({ weight: edge.weight || 0, source: edge.source, target: edge.target, id: edge.id });
      } else if (edge.target === v && !edge.directed && !visitedNodes.has(edge.source)) {
        edgeCandidates.push({ weight: edge.weight || 0, source: edge.target, target: edge.source, id: edge.id });
      }
    });
    edgeCandidates.sort((a, b) => a.weight - b.weight); // Re-sort after adding new candidates
    
     yield {
      nodes: [...nodes],
      edges: [...edges],
      message: `Updated candidate edges from new MST node ${v}. Candidates count: ${edgeCandidates.length}`,
      isFinalStep: false,
      highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id)),
      mstWeight,
    };
  }

  const finalMessage = mstEdges.length < nodes.length - 1 && nodes.length > 0
    ? `Prim's algorithm complete. Graph may be disconnected. MST weight: ${mstWeight.toFixed(2)}.`
    : `Prim's algorithm complete. MST weight: ${mstWeight.toFixed(2)}.`;

  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges],
    message: finalMessage,
    isFinalStep: true,
    highlights: createHighlights(visitedNodes, []), // Show final MST
    mstWeight,
  };
  yield finalStep;
  return finalStep;
}
