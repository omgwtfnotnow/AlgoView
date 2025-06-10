"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrayDisplay } from './array-display';
import { SimulationControls } from './simulation-controls';
import { generateRandomArray } from '@/lib/algorithms/utils';
import { linearSearchGenerator } from '@/lib/algorithms/search/linear-search';
import { binarySearchGenerator } from '@/lib/algorithms/search/binary-search';
import type { SearchStep, AlgorithmGenerator, SearchAlgorithmKey, Algorithm } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const searchAlgorithms: Record<SearchAlgorithmKey, Algorithm & { generator: (arr: number[], target: number) => AlgorithmGenerator }> = {
  'linear-search': {
    key: 'linear-search',
    name: 'Linear Search',
    description: 'Checks each element sequentially until the target is found or the list ends.',
    complexity: { timeAverage: 'O(n)', timeWorst: 'O(n)', spaceWorst: 'O(1)' },
    type: 'search',
    generator: linearSearchGenerator,
  },
  'binary-search': {
    key: 'binary-search',
    name: 'Binary Search',
    description: 'Efficiently finds an item in a sorted array by repeatedly dividing the search interval in half.',
    complexity: { timeAverage: 'O(log n)', timeWorst: 'O(log n)', spaceWorst: 'O(1)' },
    type: 'search',
    generator: binarySearchGenerator,
  },
};

export const SearchVisualizer: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SearchAlgorithmKey>('linear-search');
  const [array, setArray] = useState<number[]>(generateRandomArray(10));
  const [target, setTarget] = useState<number | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<SearchStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms delay
  const [dataSize, setDataSize] = useState(10);
  const [maxArrayValue, setMaxArrayValue] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const algorithmInstanceRef = useRef<AlgorithmGenerator | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const currentAlgorithmDetails = searchAlgorithms[selectedAlgorithm];

  const initializeAlgorithm = useCallback(() => {
    if (target === undefined) {
      setCurrentStep({
        array: [...array],
        message: "Please enter a target value to search for.",
        isFinalStep: true,
        highlights: array.map((_, i) => ({ index: i, color: 'neutral' })),
      });
      setIsFinished(true);
      return;
    }

    let arrayToSearch = [...array];
    if (selectedAlgorithm === 'binary-search') {
      arrayToSearch.sort((a, b) => a - b); // Binary search requires sorted array
      setArray(arrayToSearch); // Update state to reflect sorted array for display
       toast({ title: "Array Sorted", description: "Binary Search requires a sorted array. The array has been sorted for you." });
    }
    
    algorithmInstanceRef.current = searchAlgorithms[selectedAlgorithm].generator(arrayToSearch, target);
    const firstStep = algorithmInstanceRef.current.next().value as SearchStep;
    setCurrentStep(firstStep);
    setIsFinished(firstStep?.isFinalStep || false);
  }, [array, target, selectedAlgorithm, toast]);

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
    // Do not auto-initialize, let user press play/reset or set target
    setCurrentStep({
        array: newArray,
        message: "New array generated. Set a target and start the algorithm.",
        isFinalStep: false, 
        highlights: newArray.map((_, i) => ({ index: i, color: 'neutral' })),
      });
    setIsFinished(false);
    algorithmInstanceRef.current = null; // Clear old generator
  }, [dataSize, maxArrayValue]);
  

  useEffect(() => {
    generateNewArray(); // Generate initial array
  }, []); // Empty dependency to run only once on mount


  const nextStep = useCallback(() => {
    if (algorithmInstanceRef.current) {
      const next = algorithmInstanceRef.current.next();
      if (!next.done) {
        const stepData = next.value as SearchStep;
        setCurrentStep(stepData);
        setIsFinished(stepData.isFinalStep);
        return true; // Step taken
      } else {
        // Handle the final returned value if any, or mark as finished
        const finalStepData = next.value as SearchStep | undefined; // Generator might return final state
        if(finalStepData) setCurrentStep(finalStepData);
        setIsPlaying(false);
        setIsFinished(true);
        return false; // No more steps
      }
    }
    return false; // No generator
  }, []);

  useEffect(() => {
    if (isPlaying && !isFinished) {
      timeoutRef.current = setTimeout(() => {
        if(nextStep()){
          // If nextStep returned true, it means there are more steps, so continue playing
        } else {
          // If nextStep returned false, it means algorithm finished
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
    if (isFinished) { // If finished, replay
      resetVisualization();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    if (!algorithmInstanceRef.current && target !== undefined) { // If not started yet
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
        message: "Adjusted data size. Set a target and start the algorithm.",
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
          <Label htmlFor="search-algorithm-select" className="text-base">Select Search Algorithm</Label>
          <Select
            value={selectedAlgorithm}
            onValueChange={(value) => {
              setSelectedAlgorithm(value as SearchAlgorithmKey);
              setIsPlaying(false);
              setCurrentStep(null); // Clear step display
              setIsFinished(false);
              algorithmInstanceRef.current = null; // Reset generator
            }}
            disabled={isPlaying}
          >
            <SelectTrigger id="search-algorithm-select" className="mt-1">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(searchAlgorithms).map((algo) => (
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
            if (!algorithmInstanceRef.current && target !== undefined) initializeAlgorithm();
            nextStep();
        }}
        onReset={resetVisualization}
        onSpeedChange={setSpeed}
        onDataSizeChange={handleDataSizeChange}
        onGenerateNewArray={generateNewArray}
        algorithmType="search"
        targetValue={target}
        onTargetValueChange={(val) => {
            setTarget(isNaN(val) ? undefined : val);
            setIsPlaying(false);
            setCurrentStep(null); 
            setIsFinished(false);
            algorithmInstanceRef.current = null;
        }}
        isFinished={isFinished}
      />
      
      <ArrayDisplay step={currentStep} maxArrayValue={maxArrayValue} />

      {currentStep && (
        <Card className={cn(
            "transition-all",
            currentStep.isFinalStep && currentStep.targetFoundAtIndex !== undefined ? "border-accent bg-accent/10" : 
            currentStep.isFinalStep && currentStep.targetFoundAtIndex === undefined ? "border-destructive bg-destructive/10" :
            "bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {currentStep.isFinalStep && currentStep.targetFoundAtIndex !== undefined && <CheckCircle2 className="h-5 w-5 text-accent" />}
                {currentStep.isFinalStep && currentStep.targetFoundAtIndex === undefined && <AlertCircle className="h-5 w-5 text-destructive" />}
            </CardHeader>
            <CardContent className="px-4 pb-3">
                <p className="text-sm text-muted-foreground min-h-[20px]">{currentStep.message || "Algorithm initialized."}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};
