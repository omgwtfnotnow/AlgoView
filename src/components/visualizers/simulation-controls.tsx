
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SkipForward, RotateCcw, Shuffle } from 'lucide-react';
import type { AlgorithmType } from '@/types';

interface SimulationControlsProps {
  dataSize: number;
  onNextStep: () => void;
  onReset: () => void;
  onDataSizeChange: (size: number) => void;
  onGenerateNewArray: () => void;
  algorithmType: AlgorithmType;
  targetValue?: number;
  onTargetValueChange?: (value: number) => void;
  isFinished: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  dataSize,
  onNextStep,
  onReset,
  onDataSizeChange,
  onGenerateNewArray,
  algorithmType,
  targetValue,
  onTargetValueChange,
  isFinished,
}) => {
  const handleDataSizeSliderChange = (value: number[]) => {
    onDataSizeChange(value[0]);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dataSize" className="text-sm font-medium">Data Size: {dataSize}</Label>
          <Slider
            id="dataSize"
            min={5}
            max={50}
            step={1}
            value={[dataSize]}
            onValueChange={handleDataSizeSliderChange}
            className="mt-2"
            disabled={false} 
          />
        </div>
        {algorithmType === 'search' && onTargetValueChange && (
          <div>
            <Label htmlFor="targetValue" className="text-sm font-medium">Element to Search</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue === undefined ? '' : targetValue}
              onChange={(e) => onTargetValueChange(parseInt(e.target.value, 10))}
              placeholder="Enter number"
              className="mt-2"
              disabled={false} 
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={onNextStep} disabled={isFinished} variant="outline">
          <SkipForward className="mr-2 h-4 w-4" /> Next Step
        </Button>
         <Button onClick={onGenerateNewArray} variant="outline" disabled={false }>
          <Shuffle className="mr-2 h-4 w-4" /> New Array
        </Button>
        <Button onClick={onReset} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
};
