import React from 'react';
import { cn } from '@/lib/utils';

interface ArrayBarProps {
  value: number;
  maxValue: number;
  colorClass: string;
  label?: string;
  barWidth?: number;
}

export const ArrayBar: React.FC<ArrayBarProps> = ({ value, maxValue, colorClass, label, barWidth = 30 }) => {
  const minHeight = 20; // Minimum height for visibility of value 0 or 1
  const maxHeight = 200; // Max visual height of a bar
  // Scale height: ensure 0 value has some visible height if needed, or handle as special case.
  // For simplicity, let's make height proportional, with a minimum.
  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : (value > 0 ? 100 : 0);
  const barHeight = Math.max(minHeight, (heightPercentage / 100) * maxHeight);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-end relative transition-all duration-300 ease-in-out rounded-t-md shadow-sm',
        colorClass
      )}
      style={{
        height: `${barHeight}px`,
        width: `${barWidth}px`,
      }}
      aria-label={`Value ${value}${label ? `, ${label}` : ''}`}
      role="figure"
    >
      <span className="text-xs font-medium text-primary-foreground z-10 pb-1 truncate px-1">{value}</span>
      {label && (
        <span className="absolute -top-5 text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
};
