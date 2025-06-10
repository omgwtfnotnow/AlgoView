
"use client";
import React, { useMemo } from 'react';
import type { GraphStep, GraphNode, GraphEdge, GraphHighlightColor, GraphAlgorithmKey } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GraphDisplayProps {
  step: GraphStep | null;
  algorithmKey?: GraphAlgorithmKey; 
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 450;
const PADDING = 40;
const NODE_RADIUS = 22; 
const TEXT_OFFSET_Y = -2; 
const EDGE_TEXT_OFFSET_Y = -6; 

const highlightColorMapping: Record<GraphHighlightColor, { fill: string; stroke: string; text: string }> = {
  neutral: { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' },
  primary: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' }, 
  secondary: { fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--secondary))', text: 'hsl(var(--secondary-foreground))' }, 
  accent: { fill: 'hsl(var(--accent))', stroke: 'hsl(var(--accent))', text: 'hsl(var(--accent-foreground))' },
  destructive: { fill: 'hsl(var(--destructive))', stroke: 'hsl(var(--destructive))', text: 'hsl(var(--destructive-foreground))' },
  visited: { fill: 'hsl(240 60% 70%)', stroke: 'hsl(240 60% 50%)', text: 'hsl(var(--primary-foreground))' },
  path: { fill: 'hsl(120 70% 45%)', stroke: 'hsl(120 70% 35%)', text: 'hsl(var(--primary-foreground))' },
  info: { fill: 'hsl(48 100% 70%)', stroke: 'hsl(48 100% 50%)', text: 'hsl(var(--popover-foreground))' },
  muted: { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' },
};


interface PositionedNode extends GraphNode {
  xPos: number; 
  yPos: number; 
}

export const GraphDisplay: React.FC<GraphDisplayProps> = ({ step, algorithmKey }) => {
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
        nodesWithPositions.push({ ...node, xPos: centerX, yPos: centerY });
      } else {
        const angle = (index / numNodes) * 2 * Math.PI - (Math.PI /2); 
        nodesWithPositions.push({
          ...node,
          xPos: centerX + radius * Math.cos(angle),
          yPos: centerY + radius * Math.sin(angle),
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

  const nodeIds = step.nodes.map(n => n.id).sort(); // For consistent matrix display order

  return (
    <div className="p-4 border rounded-md bg-card min-h-[300px] space-y-4">
      <h3 className="text-xl font-semibold text-center">Graph Visualization</h3>
       <ScrollArea className="w-full h-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-background shadow-sm overflow-visible">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill="hsl(var(--foreground))" /></marker>
            <marker id="arrowhead-path" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.path.stroke} /></marker>
            <marker id="arrowhead-primary" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.primary.stroke} /></marker>
            <marker id="arrowhead-secondary" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.secondary.stroke} /></marker>
            <marker id="arrowhead-info" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.info.stroke} /></marker>
            <marker id="arrowhead-destructive" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 Z" fill={highlightColorMapping.destructive.stroke} /></marker>
          </defs>

          {step.edges.map(edge => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const highlight = getEdgeHighlight(edge.id);
            const colors = highlight ? highlightColorMapping[highlight.color] : highlightColorMapping.neutral;
            
            const angle = Math.atan2(targetNode.yPos - sourceNode.yPos, targetNode.xPos - sourceNode.xPos);
            const x1 = sourceNode.xPos + NODE_RADIUS * Math.cos(angle);
            const y1 = sourceNode.yPos + NODE_RADIUS * Math.sin(angle);
            const x2 = targetNode.xPos - NODE_RADIUS * Math.cos(angle);
            const y2 = targetNode.yPos - NODE_RADIUS * Math.sin(angle);
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            let markerEndUrl = '';
            if (edge.directed) {
                if (highlight?.color === 'path') markerEndUrl = 'url(#arrowhead-path)';
                else if (highlight?.color === 'primary') markerEndUrl = 'url(#arrowhead-primary)';
                else if (highlight?.color === 'secondary') markerEndUrl = 'url(#arrowhead-secondary)';
                else if (highlight?.color === 'info') markerEndUrl = 'url(#arrowhead-info)';
                else if (highlight?.color === 'destructive') markerEndUrl = 'url(#arrowhead-destructive)';
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
                  strokeWidth={highlight?.color === 'path' || highlight?.color === 'primary' || highlight?.color === 'info' ? 3 : 1.5}
                  markerEnd={markerEndUrl}
                  className="transition-all duration-300"
                />
                {edge.weight !== undefined && (
                  <text
                    x={midX}
                    y={midY + EDGE_TEXT_OFFSET_Y}
                    textAnchor="middle"
                    fontSize="10px"
                    fill={colors.text}
                    className="font-medium"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {positionedNodes.map(node => {
            const highlight = getNodeHighlight(node.id);
            const colors = highlight ? highlightColorMapping[highlight.color] : highlightColorMapping.neutral;
            const displayLabel = highlight?.label || node.label || node.id;
            const labelLines = displayLabel.split('\\n');

            return (
              <g key={node.id} transform={`translate(${node.xPos}, ${node.yPos})`} className="transition-all duration-300">
                <circle
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                />
                {labelLines.map((line, index) => (
                   <text
                    key={index}
                    textAnchor="middle"
                    y={TEXT_OFFSET_Y - ( (labelLines.length -1) * 8 / 2) + (index * 9) }
                    fontSize="8px" 
                    fontWeight="bold"
                    fill={colors.text}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </ScrollArea>
      
      {algorithmKey !== 'floyd-warshall' && step.distances && Object.keys(step.distances).length > 0 && (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {step.fScores ? 'Node Scores (g | h | f)' : `Distances from ${step.nodes.find(n => step.distances![n.id] === 0)?.label || 'Start'}`}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[100px] text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.entries(step.distances).map(([nodeId, dist]) => {
                            const node = step.nodes.find(n => n.id === nodeId);
                            let displayValue = dist === Infinity ? '∞' : dist.toFixed(1);
                            if (step.fScores) {
                              const fVal = step.fScores[nodeId] === Infinity ? '∞' : step.fScores[nodeId]?.toFixed(1);
                              const hVal = (step.fScores[nodeId] !== Infinity && dist !== Infinity) ? (step.fScores[nodeId]! - dist!).toFixed(1) : (fVal === '∞' && dist === Infinity ? '∞' : '?');
                              displayValue = `${dist === Infinity ? '∞' : (dist as number).toFixed(1)} | ${hVal} | ${fVal}`;
                            }
                            return (
                                <div key={nodeId} className="text-xs p-1 bg-muted/50 rounded">
                                   <span className="font-medium">{node?.label || nodeId}:</span> {displayValue}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

      {algorithmKey === 'floyd-warshall' && step.distanceMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Distance Matrix</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[250px] text-xs">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky top-0 bg-card z-10">From/To</TableHead>
                                    {nodeIds.map(id => <TableHead key={id} className="sticky top-0 bg-card z-10 text-center">{step.nodes.find(n=>n.id===id)?.label || id}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nodeIds.map(rowId => (
                                    <TableRow key={rowId}>
                                        <TableHead className="sticky left-0 bg-card z-10">{step.nodes.find(n=>n.id===rowId)?.label || rowId}</TableHead>
                                        {nodeIds.map(colId => (
                                            <TableCell key={colId} className="text-center">
                                                {step.distanceMatrix![rowId][colId] === Infinity ? '∞' : (step.distanceMatrix![rowId][colId] as number).toFixed(0)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            {step.nextHopMatrix && (
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Next Hop Matrix</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="max-h-[250px] text-xs">
                           <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky top-0 bg-card z-10">From/To</TableHead>
                                        {nodeIds.map(id => <TableHead key={id} className="sticky top-0 bg-card z-10 text-center">{step.nodes.find(n=>n.id===id)?.label || id}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {nodeIds.map(rowId => (
                                        <TableRow key={rowId}>
                                            <TableHead className="sticky left-0 bg-card z-10">{step.nodes.find(n=>n.id===rowId)?.label || rowId}</TableHead>
                                            {nodeIds.map(colId => (
                                                <TableCell key={colId} className="text-center">
                                                    {step.nextHopMatrix![rowId][colId] ? (step.nodes.find(n=>n.id===step.nextHopMatrix![rowId][colId])?.label || step.nextHopMatrix![rowId][colId]) : '—'}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
      )}


       {algorithmKey !== 'floyd-warshall' && step.targetFoundPath && step.targetFoundPath.length > 0 && (
         <Card className="bg-accent/10 border-accent">
            <CardHeader className="pb-2"><CardTitle className="text-base">Path Found!</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm">Path: {step.targetFoundPath.map(nodeId => step.nodes.find(n => n.id === nodeId)?.label || nodeId).join(' → ')}</p>
                <p className="text-xs">Total Cost (gScore): {step.distances && step.targetFoundPath.length > 0 ? (step.distances[step.targetFoundPath[step.targetFoundPath.length -1]] === Infinity ? '∞' : (step.distances[step.targetFoundPath[step.targetFoundPath.length -1]] as number)?.toFixed(2)) : 'N/A'}</p>
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
