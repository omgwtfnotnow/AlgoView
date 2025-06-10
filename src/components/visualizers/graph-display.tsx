
import React from 'react';
import type { GraphStep } from '@/types';

interface GraphDisplayProps {
  step: GraphStep | null;
}

export const GraphDisplay: React.FC<GraphDisplayProps> = ({ step }) => {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/50">
        <p className="text-muted-foreground">Graph will be displayed here. Initialize an algorithm.</p>
      </div>
    );
  }

  // Placeholder for actual SVG graph rendering
  // For now, just show some information from the step
  return (
    <div className="flex flex-col items-center justify-center h-[300px] p-4 border rounded-md bg-card">
      <h3 className="text-lg font-semibold mb-2">Graph State</h3>
      <p className="text-sm text-muted-foreground mb-1">Nodes: {step.nodes.length}, Edges: {step.edges.length}</p>
      {step.currentNodeId && <p className="text-sm">Current Node: {step.currentNodeId}</p>}
      <div className="mt-4 p-2 bg-secondary/50 rounded-md text-xs w-full max-h-48 overflow-auto">
        <pre>{JSON.stringify(step.highlights, null, 2)}</pre>
      </div>
       <p className="mt-4 text-center text-xs text-muted-foreground">
        Actual graph visualization (SVG rendering of nodes, edges, and highlights) will be implemented here.
      </p>
    </div>
  );
};
