
import React from 'react';
import type { GraphStep } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GraphDisplayProps {
  step: GraphStep | null;
}

export const GraphDisplay: React.FC<GraphDisplayProps> = ({ step }) => {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/50">
        <p className="text-muted-foreground">Graph will be displayed here. Configure and start an algorithm.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-card min-h-[300px] space-y-4">
      <h3 className="text-xl font-semibold text-center">Graph State (Data View)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nodes ({step.nodes.length}) & Highlights</CardTitle>
            <CardDescription className="text-xs">Current node: {step.currentNodeId || 'N/A'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] text-xs">
              <ul>
                {step.highlights.filter(h => h.type === 'node').map(highlight => {
                  const node = step.nodes.find(n => n.id === highlight.id);
                  return (
                    <li key={highlight.id} className="flex justify-between items-center p-1 hover:bg-muted/50 rounded">
                      <span>Node: {node?.label || highlight.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs bg-${highlight.color}-100 text-${highlight.color}-700 border border-${highlight.color}-300`}>
                        {highlight.color} {highlight.label ? `(${highlight.label})` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Edges ({step.edges.length}) & Highlights</CardTitle>
             <CardDescription className="text-xs">Edge highlights show current activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] text-xs">
              <ul>
                {step.highlights.filter(h => h.type === 'edge').map(highlight => {
                  const edge = step.edges.find(e => e.id === highlight.id);
                  return (
                    <li key={highlight.id} className="flex justify-between items-center p-1 hover:bg-muted/50 rounded">
                      <span>Edge: {edge?.source} &rarr; {edge?.target} (W: {edge?.weight})</span>
                       <span className={`px-2 py-0.5 rounded-full text-xs bg-${highlight.color}-100 text-${highlight.color}-700 border border-${highlight.color}-300`}>
                        {highlight.color}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {step.distances && (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Distances</CardTitle></CardHeader>
            <CardContent>
                <ScrollArea className="h-[100px] text-xs">
                    <pre>{JSON.stringify(step.distances, null, 2)}</pre>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
       {step.targetFoundPath && step.targetFoundPath.length > 0 && (
         <Card className="bg-accent/10 border-accent">
            <CardHeader className="pb-2"><CardTitle className="text-base">Path Found!</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm">Path: {step.targetFoundPath.join(' &rarr; ')}</p>
                <p className="text-xs">Total Distance: {step.distances && step.targetFoundPath.length > 0 ? step.distances[step.targetFoundPath[step.targetFoundPath.length -1 ]] : 'N/A'}</p>
            </CardContent>
        </Card>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Full visual SVG rendering of the graph will be implemented in a future update.
      </p>
    </div>
  );
};
