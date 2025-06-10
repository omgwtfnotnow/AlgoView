
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
    startNode = nodes[0]; 
  }
  const startNodeId = startNode.id;

  const mstEdges: GraphEdge[] = [];
  let mstWeight = 0;
  const visitedNodes = new Set<string>();
  
  
  
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
      if (mstEdges.find(me => me.id === e.id)) color = 'path'; 
      else if (selectedEdgeId === e.id) color = 'accent'; 
      else if (candidateEdgeIds.includes(e.id)) color = 'secondary'; 
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

  
  edges.forEach(edge => {
    if (edge.source === startNodeId && !visitedNodes.has(edge.target)) {
      edgeCandidates.push({ weight: edge.weight || 0, source: edge.source, target: edge.target, id: edge.id });
    } else if (edge.target === startNodeId && !edge.source && !visitedNodes.has(edge.source) && !edge.directed) { 
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
    const bestCandidate = edgeCandidates.shift(); 
    if (!bestCandidate) break; 

    
    
    const { weight, source: u, target: v, id: edgeId } = bestCandidate;

    if (visitedNodes.has(v)) { 
       yield {
        nodes: [...nodes],
        edges: [...edges],
        message: `Considering edge ${edgeId} (${u}-${v}). Node ${v} already in MST. Discarding.`,
        isFinalStep: false,
        highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id), edgeId),
        mstWeight,
      };
      continue; 
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
      highlights: createHighlights(visitedNodes, edgeCandidates.map(ec => ec.id)), 
      mstWeight,
    };
    
    if (mstEdges.length === nodes.length -1) break; 

    
    edges.forEach(edge => {
      if (edge.source === v && !visitedNodes.has(edge.target)) {
        edgeCandidates.push({ weight: edge.weight || 0, source: edge.source, target: edge.target, id: edge.id });
      } else if (edge.target === v && !edge.directed && !visitedNodes.has(edge.source)) {
        edgeCandidates.push({ weight: edge.weight || 0, source: edge.target, target: edge.source, id: edge.id });
      }
    });
    edgeCandidates.sort((a, b) => a.weight - b.weight); 
    
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
    highlights: createHighlights(visitedNodes, []), 
    mstWeight,
  };
  yield finalStep;
  return finalStep;
}
