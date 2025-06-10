"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrayDisplay } from './array-display';
import { SimulationControls } from './simulation-controls';
import { generateRandomArray } from '@/lib/algorithms/utils';
import { bubbleSortGenerator } from '@/lib/algorithms/sort/bubble-sort';
import { mergeSortGenerator } from '@/lib/algorithms/sort/merge-sort';
import { quickSortGenerator } from '@/lib/algorithms/sort/quick-sort';
import type { SortStep, AlgorithmGenerator, SortAlgorithmKey, Algorithm } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const sortAlgorithms: Record<SortAlgorithmKey, Algorithm & { generator: (arr: number[]) => AlgorithmGenerator }> = {
  'bubble-sort': {
    key: 'bubble-sort',
    name: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    complexity: { timeAverage: 'O(n^2)', timeWorst: 'O(n^2)', spaceWorst: 'O(1)' },
    type: 'sort',
    generator: bubbleSortGenerator,
  },
  'merge-sort': {
    key: 'merge-sort',
    name: 'Merge Sort',
    description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them recursively, and then merges them.',
    complexity: { timeAverage: 'O(n log n)', timeWorst: 'O(n log n)', spaceWorst: 'O(n)' },
    type: 'sort',
    generator: mergeSortGenerator,
  },
  'quick-sort': {
    key: 'quick-sort',
    name: 'Quick Sort',
    description: 'A divide-and-conquer algorithm that picks an element as a pivot and partitions the array around the pivot.',
    complexity: { timeAverage: 'O(n log n)', timeWorst: 'O(n^2)', spaceWorst: 'O(log n)' },
    type: 'sort',
    generator: quickSortGenerator,
  },
};

export const SortVisualizer: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortAlgorithmKey>('bubble-sort');
  const [array, setArray] = useState<number[]>(generateRandomArray(10));
  const [currentStep, setCurrentStep] = useState<SortStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms delay
  const [dataSize, setDataSize] = useState(10);
  const [maxArrayValue, setMaxArrayValue] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const algorithmInstanceRef = useRef<AlgorithmGenerator | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentAlgorithmDetails = sortAlgorithms[selectedAlgorithm];

  const initializeAlgorithm = useCallback(() => {
    algorithmInstanceRef.current = sortAlgorithms[selectedAlgorithm].generator([...array]);
    const firstStep = algorithmInstanceRef.current.next().value as SortStep;
    setCurrentStep(firstStep);
    setIsFinished(firstStep?.isFinalStep || false);
  }, [array, selectedAlgorithm]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    initializeAlgorithm();
  }, [initializeAlgorithm]);

  const generateNewArray = useCallback(() => {
    const newArray = generateRandomArray(dataSize, maxArrayValue);
    setArray(newArray);
    setIsPlaying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentStep({
        array: newArray,
        message: "New array generated. Press Play or Next Step to start.",
        isFinalStep: false, 
        highlights: newArray.map((_, i) => ({ index: i, color: 'neutral' })),
    });
    setIsFinished(false);
    algorithmInstanceRef.current = null; 
  }, [dataSize, maxArrayValue]);

  useEffect(() => {
    generateNewArray(); // Generate initial array
  }, []); // Empty dependency to run only once on mount


  const nextStep = useCallback(() => {
    if (algorithmInstanceRef.current) {
      const next = algorithmInstanceRef.current.next();
      if (!next.done) {
        const stepData = next.value as SortStep;
        setCurrentStep(stepData);
        setIsFinished(stepData.isFinalStep);
        return true;
      } else {
        const finalStepData = next.value as SortStep | undefined;
        if(finalStepData) setCurrentStep(finalStepData);
        setIsPlaying(false);
        setIsFinished(true);
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    if (isPlaying && !isFinished) {
      timeoutRef.current = setTimeout(() => {
        if(!nextStep()){
          setIsPlaying(false);
        }
      }, speed);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, speed, nextStep, isFinished]);


  const handlePlayPause = () => {
    if (isFinished) {
      resetVisualization();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    if (!algorithmInstanceRef.current) { 
        initializeAlgorithm();
    }
  };
  
  const handleDataSizeChange = (size: number) => {
    setDataSize(size);
    const newArray = generateRandomArray(size, maxArrayValue);
    setArray(newArray);
    setIsPlaying(false);
    setCurrentStep({
        array: newArray,
        message: "Adjusted data size. Press Play or Next Step.",
        isFinalStep: false, 
        highlights: newArray.map((_, i) => ({ index: i, color: 'neutral' })),
      });
    setIsFinished(false);
    algorithmInstanceRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <Label htmlFor="sort-algorithm-select" className="text-base">Select Sort Algorithm</Label>
          <Select
            value={selectedAlgorithm}
            onValueChange={(value) => {
              setSelectedAlgorithm(value as SortAlgorithmKey);
              setIsPlaying(false);
              setCurrentStep(null);
              setIsFinished(false);
              algorithmInstanceRef.current = null;
            }}
            disabled={isPlaying}
          >
            <SelectTrigger id="sort-algorithm-select" className="mt-1">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(sortAlgorithms).map((algo) => (
                <SelectItem key={algo.key} value={algo.key}>
                  {algo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         <Card className="bg-secondary/20">
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-lg font-headline">{currentAlgorithmDetails.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs px-4 pb-3 text-muted-foreground">
                <p>{currentAlgorithmDetails.description}</p>
                <p className="mt-1"><strong>Time:</strong> Avg: {currentAlgorithmDetails.complexity.timeAverage}, Worst: {currentAlgorithmDetails.complexity.timeWorst}. <strong>Space:</strong> {currentAlgorithmDetails.complexity.spaceWorst}</p>
            </CardContent>
        </Card>
      </div>

      <SimulationControls
        isPlaying={isPlaying}
        speed={speed}
        dataSize={dataSize}
        onPlayPause={handlePlayPause}
        onNextStep={() => {
            if (!algorithmInstanceRef.current) initializeAlgorithm();
            nextStep();
        }}
        onReset={resetVisualization}
        onSpeedChange={setSpeed}
        onDataSizeChange={handleDataSizeChange}
        onGenerateNewArray={generateNewArray}
        algorithmType="sort"
        isFinished={isFinished}
      />
      
      <ArrayDisplay step={currentStep} maxArrayValue={maxArrayValue} />

      {currentStep && (
        <Card className={cn(
            "transition-all",
            currentStep.isFinalStep ? "border-accent bg-accent/10" : "bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {currentStep.isFinalStep && <CheckCircle2 className="h-5 w-5 text-accent" />}
                {!currentStep.isFinalStep && currentStep.message.toLowerCase().includes("error") && <AlertCircle className="h-5 w-5 text-destructive" />}
            </CardHeader>
            <CardContent className="px-4 pb-3">
                <p className="text-sm text-muted-foreground min-h-[20px]">{currentStep.message || "Algorithm initialized."}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};
