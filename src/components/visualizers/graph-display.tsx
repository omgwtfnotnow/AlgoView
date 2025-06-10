
"use client";
import React, { useMemo } from 'react';
import type { GraphStep, GraphNode, GraphEdge, GraphHighlightColor } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GraphDisplayProps {
  step: GraphStep | null;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 450;
const PADDING = 40;
const NODE_RADIUS = 18;
const TEXT_OFFSET_Y = 5; // Offset for text inside node
const EDGE_TEXT_OFFSET_Y = -6; // Offset for edge weight text

const highlightColorMapping: Record<GraphHighlightColor, { fill: string; stroke: string; text: string }> = {
  neutral: { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' },
  primary: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' },
  secondary: { fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--secondary))', text: 'hsl(var(--secondary-foreground))' },
  accent: { fill: 'hsl(var(--accent))', stroke: 'hsl(var(--accent))', text: 'hsl(var(--accent-foreground))' },
  destructive: { fill: 'hsl(var(--destructive))', stroke: 'hsl(var(--destructive))', text: 'hsl(var(--destructive-foreground))' },
  visited: { fill: 'hsl(240 60% 70%)', stroke: 'hsl(240 60% 50%)', text: 'hsl(var(--primary-foreground))' }, // Softer blue/purple
  path: { fill: 'hsl(120 70% 45%)', stroke: 'hsl(120 70% 35%)', text: 'hsl(var(--primary-foreground))' }, // Green
  info: { fill: 'hsl(48 100% 70%)', stroke: 'hsl(48 100% 50%)', text: 'hsl(var(--popover-foreground))' }, // Yellowish
  // Ensure all GraphHighlightColor types are mapped
  muted: { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' },
};


interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export const GraphDisplay: React.FC<GraphDisplayProps> = ({ step }) => {
  const positionedNodes = useMemo(() => {
    if (!step || !step.nodes) return [];
    const nodesWithPositions: PositionedNode[] = [];
    const numNodes = step.nodes.length;
    if (numNodes === 0) return [];

    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2 - PADDING - NODE_RADIUS;

    step.nodes.forEach((node, index) => {
      if (numNodes === 1) {
        nodesWithPositions.push({ ...node, x: centerX, y: centerY });
      } else {
        const angle = (index / numNodes) * 2 * Math.PI - (Math.PI /2); // Start from top
        nodesWithPositions.push({
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      }
    });
    return nodesWithPositions;
  }, [step]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positionedNodes.forEach(node => map.set(node.id, node));
    return map;
  }, [positionedNodes]);

  if (!step) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/50">
        <p className="text-muted-foreground">Graph will be displayed here. Configure and start an algorithm.</p>
      </div>
    );
  }

  const getNodeHighlight = (nodeId: string) => {
    return step.highlights.find(h => h.type === 'node' && h.id === nodeId);
  };

  const getEdgeHighlight = (edgeId: string) => {
    return step.highlights.find(h => h.type === 'edge' && h.id === edgeId);
  };


  return (
    <div className="p-4 border rounded-md bg-card min-h-[300px] space-y-4">
      <h3 className="text-xl font-semibold text-center">Graph Visualization</h3>
       <ScrollArea className="w-full h-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-background shadow-sm overflow-visible">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7" // Adjusted for line thickness and node radius
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 Z" fill="hsl(var(--foreground))" />
            </marker>
             <marker
              id="arrowhead-path"
              markerWidth="8"
              markerHeight="6"
              refX="7" 
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.path.stroke} />
            </marker>
             <marker
              id="arrowhead-primary"
              markerWidth="8"
              markerHeight="6"
              refX="7" 
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.primary.stroke} />
            </marker>
            <marker
              id="arrowhead-secondary"
              markerWidth="8"
              markerHeight="6"
              refX="7" 
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.secondary.stroke} />
            </marker>
             <marker
              id="arrowhead-info"
              markerWidth="8"
              markerHeight="6"
              refX="7" 
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.info.stroke} />
            </marker>
          </defs>

          {/* Edges */}
          {step.edges.map(edge => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const highlight = getEdgeHighlight(edge.id);
            const colors = highlight ? highlightColorMapping[highlight.color] : highlightColorMapping.neutral;
            
            // Adjust edge endpoints to stop at the circle's edge
            const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
            const x1 = sourceNode.x + NODE_RADIUS * Math.cos(angle);
            const y1 = sourceNode.y + NODE_RADIUS * Math.sin(angle);
            const x2 = targetNode.x - NODE_RADIUS * Math.cos(angle);
            const y2 = targetNode.y - NODE_RADIUS * Math.sin(angle);
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            let markerEndUrl = '';
            if (edge.directed) {
                if (highlight?.color === 'path') markerEndUrl = 'url(#arrowhead-path)';
                else if (highlight?.color === 'primary') markerEndUrl = 'url(#arrowhead-primary)';
                else if (highlight?.color === 'secondary') markerEndUrl = 'url(#arrowhead-secondary)';
                else if (highlight?.color === 'info') markerEndUrl = 'url(#arrowhead-info)';
                else markerEndUrl = 'url(#arrowhead)';
            }

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colors.stroke}
                  strokeWidth={highlight?.color === 'path' || highlight?.color === 'primary' ? 3 : 1.5}
                  markerEnd={markerEndUrl}
                />
                {edge.weight !== undefined && (
                  <text
                    x={midX}
                    y={midY + EDGE_TEXT_OFFSET_Y}
                    textAnchor="middle"
                    fontSize="10px"
                    fill={colors.text}
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {positionedNodes.map(node => {
            const highlight = getNodeHighlight(node.id);
            const colors = highlight ? highlightColorMapping[highlight.color] : highlightColorMapping.neutral;
            const distanceLabel = highlight?.label;

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                />
                <text
                  textAnchor="middle"
                  y={TEXT_OFFSET_Y - (distanceLabel ? 5 : 0) } // Adjust if distance is shown
                  fontSize="10px"
                  fontWeight="bold"
                  fill={colors.text}
                >
                  {node.label || node.id}
                </text>
                {distanceLabel && (
                  <text
                    textAnchor="middle"
                    y={TEXT_OFFSET_Y + 8} // Position distance label below ID
                    fontSize="9px"
                    fill={colors.text}
                  >
                    ({distanceLabel})
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </ScrollArea>
      
      {step.distances && Object.keys(step.distances).length > 0 && (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Distances from {step.nodes.find(n => step.distances![n.id] === 0)?.label || 'Start'}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[100px] text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.entries(step.distances).map(([nodeId, dist]) => {
                            const node = step.nodes.find(n => n.id === nodeId);
                            return (
                                <div key={nodeId} className="text-xs p-1 bg-muted/50 rounded">
                                   <span className="font-medium">{node?.label || nodeId}:</span> {dist === Infinity ? '∞' : dist}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
       {step.targetFoundPath && step.targetFoundPath.length > 0 && (
         <Card className="bg-accent/10 border-accent">
            <CardHeader className="pb-2"><CardTitle className="text-base">Path Found!</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm">Path: {step.targetFoundPath.map(nodeId => step.nodes.find(n => n.id === nodeId)?.label || nodeId).join(' → ')}</p>
                <p className="text-xs">Total Distance: {step.distances && step.targetFoundPath.length > 0 ? (step.distances[step.targetFoundPath[step.targetFoundPath.length -1]] === Infinity ? '∞' : step.distances[step.targetFoundPath[step.targetFoundPath.length -1]]) : 'N/A'}</p>
            </CardContent>
        </Card>
      )}
      {step.message && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Status: {step.message}
          </p>
      )}
    </div>
  );
};

