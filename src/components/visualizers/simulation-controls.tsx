import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Pause, SkipForward, RotateCcw, Shuffle } from 'lucide-react';
import type { AlgorithmType } from '@/types';

interface SimulationControlsProps {
  isPlaying: boolean;
  speed: number; // Represents delay in ms
  dataSize: number;
  onPlayPause: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onDataSizeChange: (size: number) => void;
  onGenerateNewArray: () => void;
  algorithmType: AlgorithmType;
  targetValue?: number;
  onTargetValueChange?: (value: number) => void;
  isFinished: boolean;
}

const speedMarks = [
  { value: 1000, label: 'Slow' },
  { value: 500, label: 'Medium' },
  { value: 200, label: 'Fast' },
  { value: 50, label: 'V. Fast' },
];


export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  speed,
  dataSize,
  onPlayPause,
  onNextStep,
  onReset,
  onSpeedChange,
  onDataSizeChange,
  onGenerateNewArray,
  algorithmType,
  targetValue,
  onTargetValueChange,
  isFinished,
}) => {
  const handleSpeedSliderChange = (value: number[]) => {
    onSpeedChange(value[0]);
  };
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
            disabled={isPlaying}
          />
        </div>
        <div>
          <Label htmlFor="speed" className="text-sm font-medium">
            Speed: {speedMarks.find(s => s.value === speed)?.label || `${speed}ms`}
          </Label>
           <Slider
            id="speed"
            min={50}
            max={1000}
            step={speed <= 200 ? 50 : (speed <= 500 ? 100 : 250)} // Dynamic steps
            value={[speed]}
            onValueChange={handleSpeedSliderChange}
            className="mt-2"
            inverted={true} // Higher value means slower, so visually invert
          />
        </div>
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
            disabled={isPlaying}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={onPlayPause} variant="outline" className="min-w-[100px]">
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? 'Pause' : (isFinished ? 'Replay' : 'Play')}
        </Button>
        <Button onClick={onNextStep} disabled={isPlaying || isFinished} variant="outline">
          <SkipForward className="mr-2 h-4 w-4" /> Next Step
        </Button>
         <Button onClick={onGenerateNewArray} variant="outline" disabled={isPlaying}>
          <Shuffle className="mr-2 h-4 w-4" /> New Array
        </Button>
        <Button onClick={onReset} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
};
