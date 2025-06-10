import React from 'react';
import { ArrayBar } from './array-bar';
import type { VisualizerStep } from '@/types';

interface ArrayDisplayProps {
  step: VisualizerStep | null;
  maxArrayValue: number;
}

const colorMap: Record<VisualizerStep['highlights'][0]['color'], string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  destructive: 'bg-destructive',
  muted: 'bg-muted',
  neutral: 'bg-gray-400 dark:bg-gray-600', // A neutral default
  info: 'bg-blue-400 dark:bg-blue-600' // Example for info highlight
};

export const ArrayDisplay: React.FC<ArrayDisplayProps> = ({ step, maxArrayValue }) => {
  if (!step) {
    return (
      <div className="flex items-end justify-center h-[250px] border rounded-md bg-muted/50">
        <p className="text-muted-foreground">No data to display. Start an algorithm.</p>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-1 p-4 border rounded-md bg-card min-h-[250px] overflow-x-auto">
      {step.array.map((value, index) => {
        const highlight = step.highlights.find(h => h.index === index);
        const colorClass = highlight ? colorMap[highlight.color] : colorMap.neutral;
        const label = highlight?.label;
        
        return (
          <ArrayBar
            key={index}
            value={value}
            maxValue={maxArrayValue}
            colorClass={colorClass}
            label={label}
          />
        );
      })}
    </div>
  );
};
