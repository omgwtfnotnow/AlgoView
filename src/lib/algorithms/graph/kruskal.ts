
import type { GraphStep, GraphNode, GraphEdge, GraphElementHighlight, GraphHighlightColor } from '@/types';
import { DSU } from '../dsu';

export function* kruskalGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Generator<GraphStep, GraphStep | undefined, void> {
  if (nodes.length === 0) {
    const emptyStep: GraphStep = { nodes, edges, message: "Graph is empty.", isFinalStep: true, highlights: [], mstWeight: 0 };
    yield emptyStep;
    return emptyStep;
  }

  const sortedEdges = [...edges].sort((a, b) => (a.weight || 0) - (b.weight || 0));
  const dsu = new DSU(nodes.map(n => n.id));
  const mstEdges: GraphEdge[] = [];
  let mstWeight = 0;

  const createHighlights = (
    consideringEdgeId?: string,
    mstEdgeIds: string[] = [],
    discardedEdgeId?: string
  ): GraphElementHighlight[] => {
    const nodeInMst = new Set<string>();
    mstEdgeIds.forEach(edgeId => {
      const edge = edges.find(e => e.id === edgeId);
      if (edge) {
        nodeInMst.add(edge.source);
        nodeInMst.add(edge.target);
      }
    });

    return nodes.map(n => ({
      id: n.id,
      type: 'node' as 'node',
      color: nodeInMst.has(n.id) ? 'path' : 'neutral' as GraphHighlightColor,
      label: n.label || n.id,
    })).concat(edges.map(e => {
      let color: GraphHighlightColor = 'neutral';
      if (mstEdgeIds.includes(e.id)) color = 'path'; 
      else if (e.id === consideringEdgeId) color = 'secondary'; 
      else if (e.id === discardedEdgeId) color = 'muted'; 
      return { id: e.id, type: 'edge' as 'edge', color };
    }));
  };

  yield {
    nodes: [...nodes],
    edges: [...edges], 
    message: "Starting Kruskal's algorithm. Edges sorted by weight.",
    isFinalStep: false,
    highlights: createHighlights(),
    mstWeight: 0,
  };

  for (const edge of sortedEdges) {
    yield {
      nodes: [...nodes],
      edges: [...edges],
      message: `Considering edge ${edge.id} (${edge.source}-${edge.target}) with weight ${edge.weight || 0}.`,
      isFinalStep: false,
      highlights: createHighlights(edge.id, mstEdges.map(e => e.id)),
      mstWeight,
    };

    if (dsu.find(edge.source) !== dsu.find(edge.target)) {
      dsu.union(edge.source, edge.target);
      mstEdges.push(edge);
      mstWeight += (edge.weight || 0);

      yield {
        nodes: [...nodes],
        edges: [...edges],
        message: `Added edge ${edge.id} to MST. Current MST weight: ${mstWeight.toFixed(2)}.`,
        isFinalStep: false,
        highlights: createHighlights(undefined, mstEdges.map(e => e.id)),
        mstWeight,
      };
    } else {
      yield {
        nodes: [...nodes],
        edges: [...edges],
        message: `Discarded edge ${edge.id} (forms a cycle).`,
        isFinalStep: false,
        highlights: createHighlights(undefined, mstEdges.map(e => e.id), edge.id),
        mstWeight,
      };
    }

    if (mstEdges.length === nodes.length - 1 && nodes.length > 0) {
      
      break;
    }
  }

  const finalMessage = mstEdges.length < nodes.length - 1 && nodes.length > 0
    ? `Kruskal's algorithm complete. Graph may be disconnected. MST weight: ${mstWeight.toFixed(2)}.`
    : `Kruskal's algorithm complete. MST weight: ${mstWeight.toFixed(2)}.`;
  
  const finalStep: GraphStep = {
    nodes: [...nodes],
    edges: [...edges], 
    message: finalMessage,
    isFinalStep: true,
    highlights: createHighlights(undefined, mstEdges.map(e => e.id)),
    mstWeight,
  };
  yield finalStep;
  return finalStep;
}
