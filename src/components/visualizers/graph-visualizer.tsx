
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RotateCcw, SkipForward, Shuffle } from 'lucide-react';
import { GraphDisplay } from './graph-display';
import { generateRandomGraph } from '@/lib/algorithms/graph/utils';
import { dijkstraGenerator } from '@/lib/algorithms/graph/dijkstra';
import { bellmanFordGenerator } from '@/lib/algorithms/graph/bellman-ford';
import type { GraphStep, AlgorithmGenerator, GraphAlgorithmKey, VisualizerAlgorithm, GraphNode, GraphEdge } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const graphAlgorithms: Record<GraphAlgorithmKey, VisualizerAlgorithm & { generator: (...args: any[]) => AlgorithmGenerator }> = {
  'dijkstra': {
    key: 'dijkstra',
    name: "Dijkstra's Algorithm",
    description: 'Finds the shortest paths from a single source node to all other nodes in a graph with non-negative edge weights.',
    complexity: { timeAverage: 'O(E log V) or O(V^2)', timeWorst: 'O(E log V) or O(V^2)', spaceWorst: 'O(V + E)' },
    type: 'graph',
    generator: dijkstraGenerator,
  },
  'bellman-ford': {
    key: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    description: 'Finds the shortest paths from a single source node, allowing for negative edge weights. Can detect negative cycles.',
    complexity: { timeWorst: 'O(VE)', spaceWorst: 'O(V)' },
    type: 'graph',
    generator: bellmanFordGenerator,
  },
  'a-star': {
    key: 'a-star',
    name: 'A* Search Algorithm',
    description: 'An informed search algorithm that finds the shortest path using a heuristic to guide its search.',
    complexity: { timeWorst: 'O(E) or O(b^d)', spaceWorst: 'O(V+E) or O(b^d)' },
    type: 'graph',
    generator: function*(nodes: GraphNode[], edges: GraphEdge[]) { 
      yield { nodes, edges, message: 'A* Search not yet implemented.', isFinalStep: true, highlights: [] };
    } as any, // Cast to satisfy type, will be replaced
  },
};


export const GraphVisualizer: React.FC = () => {
  const [selectedAlgorithmKey, setSelectedAlgorithmKey] = useState<GraphAlgorithmKey>('dijkstra');
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<GraphStep | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [numNodes, setNumNodes] = useState(5);
  const [numEdges, setNumEdges] = useState(7);
  const [allowNegativeWeights, setAllowNegativeWeights] = useState(false);

  const algorithmInstanceRef = useRef<AlgorithmGenerator | null>(null);
  const { toast } = useToast();
  const isMountedRef = useRef(false);

  const currentAlgorithmDetails = graphAlgorithms[selectedAlgorithmKey];

  const handleGenerateNewGraph = useCallback((nodesCount = numNodes, edgesCount = numEdges, useNegativeWeights = allowNegativeWeights) => {
    if (selectedAlgorithmKey === 'dijkstra' && useNegativeWeights) {
        toast({title: "Warning", description: "Dijkstra's algorithm may not work correctly with negative edge weights. Disabling negative weights for Dijkstra.", variant: "default"});
        setAllowNegativeWeights(false); // Auto-disable for Dijkstra
        useNegativeWeights = false; // Use corrected value for this generation
    }
    const newGraph = generateRandomGraph(nodesCount, edgesCount, 10, false, useNegativeWeights, useNegativeWeights ? -5 : 1);
    setGraph(newGraph);
    setCurrentStep(null);
    setIsFinished(false);
    algorithmInstanceRef.current = null;

    if (newGraph.nodes.length > 0) {
      setStartNodeId(newGraph.nodes[0].id);
      if (newGraph.nodes.length > 1) {
        const potentialTarget = newGraph.nodes.find(n => n.id !== newGraph.nodes[0].id);
        setTargetNodeId(potentialTarget ? potentialTarget.id : '');
      } else {
        setTargetNodeId('');
      }
       setCurrentStep({
        nodes: newGraph.nodes,
        edges: newGraph.edges,
        message: "New graph generated. Verify start/target nodes and press Next Step to begin.",
        isFinalStep: false,
        highlights: newGraph.nodes.map(n => ({ id: n.id, type: 'node', color: 'neutral', label: (selectedAlgorithmKey === 'dijkstra' || selectedAlgorithmKey === 'bellman-ford') ? '∞' : '?' }))
                      .concat(newGraph.edges.map(e=> ({id: e.id, type: 'edge', color: 'neutral'}))),
      });
    } else {
      setStartNodeId('');
      setTargetNodeId('');
       setCurrentStep({
        nodes: [], edges: [], message: "Generated an empty graph. Adjust node count.",
        isFinalStep: true, highlights: []
      });
    }
  }, [numNodes, numEdges, allowNegativeWeights, selectedAlgorithmKey, toast]);
  
  useEffect(() => {
    handleGenerateNewGraph(5,7, selectedAlgorithmKey === 'bellman-ford');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isMountedRef.current) {
      handleGenerateNewGraph(numNodes, numEdges, allowNegativeWeights);
    } else {
      isMountedRef.current = true;
    }
  }, [numNodes, numEdges, allowNegativeWeights, handleGenerateNewGraph]);


  const initializeAlgorithm = useCallback(() => {
    if (!graph.nodes.length) {
        toast({ title: "Empty Graph", description: "Please generate a graph first.", variant: "destructive" });
        return false;
    }
    if (!startNodeId || startNodeId.trim() === '') {
        toast({ title: "Missing Start Node", description: "Please specify a start node ID.", variant: "destructive" });
         setCurrentStep({
            nodes: graph.nodes, edges: graph.edges, highlights: currentStep?.highlights || [],
            message: "Error: Start node ID is required.", isFinalStep: true
        });
        return false;
    }
    if (!graph.nodes.find(n => n.id === startNodeId)) {
        toast({ title: "Invalid Start Node", description: `Start node "${startNodeId}" does not exist in the graph.`, variant: "destructive" });
        setCurrentStep({
            nodes: graph.nodes, edges: graph.edges, highlights: currentStep?.highlights || [],
            message: `Error: Start node "${startNodeId}" does not exist.`, isFinalStep: true
        });
        return false;
    }
    if (targetNodeId && targetNodeId.trim() !== '' && !graph.nodes.find(n => n.id === targetNodeId)) {
         toast({ title: "Invalid Target Node", description: `Target node "${targetNodeId}" does not exist. Leave empty if not searching for a specific target.`, variant: "destructive" });
         setCurrentStep({
            nodes: graph.nodes, edges: graph.edges, highlights: currentStep?.highlights || [],
            message: `Error: Target node "${targetNodeId}" does not exist.`, isFinalStep: true
        });
        return false;
    }

    const generatorFn = graphAlgorithms[selectedAlgorithmKey].generator;
    algorithmInstanceRef.current = generatorFn(graph.nodes, graph.edges, startNodeId, targetNodeId && targetNodeId.trim() !== '' ? targetNodeId : undefined);
    
    const firstStepResult = algorithmInstanceRef.current?.next();
    if (firstStepResult && !firstStepResult.done) {
        const step = firstStepResult.value as GraphStep;
        setCurrentStep(step);
        setIsFinished(step?.isFinalStep || false);
        if (step?.isFinalStep && step.message.toLowerCase().includes("error")) {
            toast({ title: "Algorithm Initialization Error", description: step.message, variant: "destructive" });
        }
    } else if (firstStepResult?.done && firstStepResult.value) {
        const step = firstStepResult.value as GraphStep;
        setCurrentStep(step);
        setIsFinished(true);
         if (step.message.toLowerCase().includes("error")) {
            toast({ title: "Algorithm Initialization Error", description: step.message, variant: "destructive" });
        }
    } else if (!firstStepResult) { 
        toast({ title: "Algorithm Error", description: "Failed to start algorithm generator.", variant: "destructive" });
        setIsFinished(true);
        return false;
    }
    return true;
  }, [graph, startNodeId, targetNodeId, selectedAlgorithmKey, toast, currentStep?.highlights]);


  const resetVisualization = useCallback(() => {
    if(graph.nodes.length > 0){
        initializeAlgorithm();
    } else {
        handleGenerateNewGraph(); 
    }
  }, [initializeAlgorithm, handleGenerateNewGraph, graph.nodes.length]);

  const nextStep = useCallback(() => {
    if (!algorithmInstanceRef.current) {
      const initialized = initializeAlgorithm();
      if (!initialized) return false; 
      if (currentStep?.isFinalStep) return false; // If initialize leads to final step immediately
    }

    // If after initialization, we are already finished (e.g., error step from generator), don't proceed.
    if (isFinished || !algorithmInstanceRef.current) return false;

    const next = algorithmInstanceRef.current.next();
    if (!next.done) {
      const stepData = next.value as GraphStep;
      setCurrentStep(stepData);
      setIsFinished(stepData.isFinalStep);
      if (stepData.isFinalStep && stepData.message.toLowerCase().includes("error")) {
          toast({ title: "Algorithm Error", description: stepData.message, variant: "destructive" });
      }
      return true;
    } else { 
      const finalStepData = next.value as GraphStep | undefined; 
      if (finalStepData) {
           setCurrentStep(finalStepData);
           if (finalStepData.message.toLowerCase().includes("error")) {
              toast({ title: "Algorithm Error", description: finalStepData.message, variant: "destructive" });
          }
      }
      setIsFinished(true);
      return false;
    }
  }, [initializeAlgorithm, toast, currentStep?.isFinalStep, isFinished]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <Label htmlFor="graph-algorithm-select" className="text-base">Select Graph Algorithm</Label>
          <Select
            value={selectedAlgorithmKey}
            onValueChange={(value) => {
              const newKey = value as GraphAlgorithmKey;
              setSelectedAlgorithmKey(newKey);
              setCurrentStep(null);
              setIsFinished(false);
              algorithmInstanceRef.current = null;
              // Automatically enable negative weights for Bellman-Ford, disable for Dijkstra
              if (newKey === 'bellman-ford') {
                setAllowNegativeWeights(true);
              } else if (newKey === 'dijkstra') {
                setAllowNegativeWeights(false);
              }
              // Graph will regenerate due to allowNegativeWeights or selectedAlgorithmKey change via useEffect
            }}
          >
            <SelectTrigger id="graph-algorithm-select" className="mt-1">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(graphAlgorithms).map((algo) => (
                <SelectItem key={algo.key} value={algo.key} disabled={algo.key === 'a-star'}>
                  {algo.name} {algo.key === 'a-star' ? '(Not Implemented)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card className="bg-secondary/20">
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-lg font-headline">{currentAlgorithmDetails.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs px-4 pb-3 text-muted-foreground space-y-1">
                <p>{currentAlgorithmDetails.description}</p>
                <p><strong>Time Complexity:</strong> {currentAlgorithmDetails.complexity.timeWorst} (Worst Case) {currentAlgorithmDetails.complexity.timeAverage ? `, Avg: ${currentAlgorithmDetails.complexity.timeAverage}` : ''}</p>
                <p><strong>Space Complexity:</strong> {currentAlgorithmDetails.complexity.spaceWorst}</p>
            </CardContent>
        </Card>
      </div>

      <Card className="p-4 space-y-4 shadow">
        <CardTitle className="text-xl">Graph Configuration</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
                <Label htmlFor="numNodesSlider">Number of Nodes ({numNodes})</Label>
                <Slider id="numNodesSlider" min={2} max={20} value={[numNodes]} onValueChange={(val) => setNumNodes(val[0])} className="mt-1"/>
            </div>
            <div>
                <Label htmlFor="numEdgesSlider">Number of Edges ({numEdges})</Label>
                <Slider id="numEdgesSlider" min={1} max={Math.min(50, numNodes * (numNodes -1) / 2 )} value={[numEdges]} onValueChange={(val) => setNumEdges(val[0])} className="mt-1"/>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
                <Label htmlFor="startNode">Start Node ID</Label>
                <Input id="startNode" type="text" value={startNodeId} onChange={(e) => setStartNodeId(e.target.value)} placeholder="e.g., n0" className="mt-1"/>
            </div>
            <div>
                <Label htmlFor="targetNode">Target Node ID (Optional)</Label>
                <Input id="targetNode" type="text" value={targetNodeId} onChange={(e) => setTargetNodeId(e.target.value)} placeholder="e.g., n4" className="mt-1"/>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox 
                id="negativeWeights" 
                checked={allowNegativeWeights} 
                onCheckedChange={(checked) => {
                    if (selectedAlgorithmKey === 'dijkstra' && checked) {
                        toast({title: "Warning", description: "Dijkstra's does not support negative weights. Keeping them disabled.", variant: "default"});
                        return;
                    }
                    setAllowNegativeWeights(checked as boolean);
                }}
                disabled={selectedAlgorithmKey === 'dijkstra'}
            />
            <Label htmlFor="negativeWeights" className="text-sm font-medium">Allow Negative Edge Weights (for Bellman-Ford)</Label>
        </div>
        <Button onClick={() => handleGenerateNewGraph(numNodes, numEdges, allowNegativeWeights)} variant="outline">
          <Shuffle className="mr-2 h-4 w-4" /> Regenerate Graph Manually
        </Button>
      </Card>
      
       <div className="flex flex-wrap gap-2 justify-center p-4 border rounded-lg bg-card shadow-sm">
        <Button onClick={nextStep} disabled={isFinished || selectedAlgorithmKey === 'a-star'} variant="outline">
          <SkipForward className="mr-2 h-4 w-4" /> Next Step
        </Button>
        <Button onClick={resetVisualization} variant="destructive" disabled={selectedAlgorithmKey === 'a-star'}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Algorithm
        </Button>
      </div>

      <GraphDisplay step={currentStep} />

      {currentStep && (
        <Card className={cn(
            "transition-all shadow-md",
            currentStep.isFinalStep && currentStep.message.toLowerCase().includes("negative-weight cycle detected") ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep && currentStep.targetFoundPath && currentStep.targetFoundPath.length > 0 ? "border-accent bg-accent/10" :
            currentStep.isFinalStep && currentStep.message.toLowerCase().includes("not reachable") ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep && currentStep.message.toLowerCase().includes("error") ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep ? "border-primary bg-primary/10" :
            "bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                 {currentStep.isFinalStep && (currentStep.message.toLowerCase().includes("negative-weight cycle detected") || currentStep.message.toLowerCase().includes("not reachable") || currentStep.message.toLowerCase().includes("error")) && <AlertCircle className="h-5 w-5 text-destructive" />}
                {currentStep.isFinalStep && currentStep.targetFoundPath && currentStep.targetFoundPath.length > 0 && !currentStep.message.toLowerCase().includes("negative-weight cycle detected") && <CheckCircle2 className="h-5 w-5 text-accent" />}
                {currentStep.isFinalStep && (!currentStep.targetFoundPath || currentStep.targetFoundPath.length === 0) && !(currentStep.message.toLowerCase().includes("negative-weight cycle detected") || currentStep.message.toLowerCase().includes("not reachable") || currentStep.message.toLowerCase().includes("error")) && <CheckCircle2 className="h-5 w-5 text-primary" />}

            </CardHeader>
            <CardContent className="px-4 pb-3">
                <p className="text-sm text-muted-foreground min-h-[20px] whitespace-pre-wrap">{currentStep.message || "Algorithm initialized. Press Next Step."}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

    