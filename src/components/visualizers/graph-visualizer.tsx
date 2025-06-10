
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RotateCcw, SkipForward, Shuffle, Network } from 'lucide-react';
import { GraphDisplay } from './graph-display';
import { generateRandomGraph } from '@/lib/algorithms/graph/utils';
import { dijkstraGenerator } from '@/lib/algorithms/graph/dijkstra';
import { bellmanFordGenerator } from '@/lib/algorithms/graph/bellman-ford';
import { aStarGenerator } from '@/lib/algorithms/graph/a-star';
import { floydWarshallGenerator } from '@/lib/algorithms/graph/floyd-warshall';
import { kruskalGenerator } from '@/lib/algorithms/graph/kruskal';
import { primGenerator } from '@/lib/algorithms/graph/prim';
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
    description: 'An informed search algorithm that finds the shortest path from a start to a target node using a heuristic to guide its search. Uses Euclidean distance if node x/y coordinates are present.',
    complexity: { timeWorst: 'O(E) or O(b^d)', spaceWorst: 'O(V+E) or O(b^d)' },
    type: 'graph',
    generator: aStarGenerator,
  },
  'floyd-warshall': {
    key: 'floyd-warshall',
    name: 'Floyd-Warshall Algorithm',
    description: 'Finds all-pairs shortest paths. Can handle negative edge weights and detect negative cycles.',
    complexity: { timeWorst: 'O(V^3)', spaceWorst: 'O(V^2)' },
    type: 'graph',
    generator: floydWarshallGenerator,
  },
  'kruskal': {
    key: 'kruskal',
    name: "Kruskal's Algorithm (MST)",
    description: 'Finds a Minimum Spanning Tree (MST) for a connected, undirected graph. Adds edges in increasing order of weight if they don_t form a cycle.',
    complexity: { timeWorst: 'O(E log E) or O(E log V)', spaceWorst: 'O(V + E)' },
    type: 'graph',
    generator: kruskalGenerator,
  },
  'prim': {
    key: 'prim',
    name: "Prim's Algorithm (MST)",
    description: 'Finds a Minimum Spanning Tree (MST) for a weighted undirected graph. Grows the MST from a starting vertex by adding the cheapest possible connection to an unvisited vertex.',
    complexity: { timeWorst: 'O(E log V) or O(V^2)', spaceWorst: 'O(V + E)' },
    type: 'graph',
    generator: primGenerator,
  },
};


export const GraphVisualizer: React.FC = () => {
  const [selectedAlgorithmKey, setSelectedAlgorithmKey] = useState<GraphAlgorithmKey>('dijkstra');
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>(''); // Not used by all algos
  const [currentStep, setCurrentStep] = useState<GraphStep | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [numNodes, setNumNodes] = useState(5);
  const [numEdges, setNumEdges] = useState(7);
  const [allowNegativeWeights, setAllowNegativeWeights] = useState(false);

  const algorithmInstanceRef = useRef<AlgorithmGenerator | null>(null);
  const { toast } = useToast();
  const isMountedRef = useRef(false);

  const currentAlgorithmDetails = graphAlgorithms[selectedAlgorithmKey];
  const isFloydWarshallSelected = selectedAlgorithmKey === 'floyd-warshall';
  const isKruskalSelected = selectedAlgorithmKey === 'kruskal';
  const isPrimSelected = selectedAlgorithmKey === 'prim';
  const isMstAlgorithm = isKruskalSelected || isPrimSelected;


  const handleGenerateNewGraph = useCallback((nodesCount = numNodes, edgesCount = numEdges, useNegativeWeights = allowNegativeWeights) => {
    const isDijkstra = selectedAlgorithmKey === 'dijkstra';
    if (isDijkstra && useNegativeWeights) {
        toast({title: "Warning", description: "Dijkstra's algorithm may not work correctly with negative edge weights. Disabling negative weights for Dijkstra.", variant: "default"});
        setAllowNegativeWeights(false); 
        useNegativeWeights = false; 
    }
    const newGraph = generateRandomGraph(nodesCount, edgesCount, 10, false, useNegativeWeights, useNegativeWeights ? -5 : 1);
    setGraph(newGraph);
    setCurrentStep(null);
    setIsFinished(false);
    algorithmInstanceRef.current = null;

    if (newGraph.nodes.length > 0) {
      setStartNodeId(newGraph.nodes[0].id);
      if (newGraph.nodes.length > 1) {
        const potentialTarget = newGraph.nodes.find(n => n.id !== newGraph.nodes[0].id) || newGraph.nodes[newGraph.nodes.length -1];
        setTargetNodeId(potentialTarget ? potentialTarget.id : '');
      } else {
        setTargetNodeId('');
      }
       setCurrentStep({
        nodes: newGraph.nodes,
        edges: newGraph.edges,
        message: "New graph generated. Verify inputs and press Next Step, or configure parameters.",
        isFinalStep: false,
        highlights: newGraph.nodes.map(n => ({ id: n.id, type: 'node', color: 'neutral', label: (currentAlgorithmDetails.key === 'a-star' ? `g:∞ h:? f:∞` : (isMstAlgorithm ? n.label || n.id : (isFloydWarshallSelected ? n.label || n.id : '∞'))) }))
                      .concat(newGraph.edges.map(e=> ({id: e.id, type: 'edge', color: 'neutral'}))),
        ...(isFloydWarshallSelected && { 
            distanceMatrix: Object.fromEntries(newGraph.nodes.map(n1 => [n1.id, Object.fromEntries(newGraph.nodes.map(n2 => [n2.id, n1.id === n2.id ? 0 : Infinity]))])),
            nextHopMatrix: Object.fromEntries(newGraph.nodes.map(n1 => [n1.id, Object.fromEntries(newGraph.nodes.map(n2 => [n2.id, null]))])),
        }),
        ...(isMstAlgorithm && { mstWeight: 0 })
      });
    } else {
      setStartNodeId('');
      setTargetNodeId('');
       setCurrentStep({
        nodes: [], edges: [], message: "Generated an empty graph. Adjust node count.",
        isFinalStep: true, highlights: []
      });
    }
  }, [numNodes, numEdges, allowNegativeWeights, selectedAlgorithmKey, toast, currentAlgorithmDetails.key, isFloydWarshallSelected, isMstAlgorithm]);
  
  useEffect(() => {
    handleGenerateNewGraph(numNodes, numEdges, allowNegativeWeights);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isMountedRef.current) {
      let useNegative = allowNegativeWeights;
      if (selectedAlgorithmKey === 'dijkstra') useNegative = false;
      else if (['bellman-ford', 'a-star', 'floyd-warshall', 'kruskal', 'prim'].includes(selectedAlgorithmKey)) {
         // For these, allowNegativeWeights state dictates it, but Kruskal/Prim usually use non-negative examples.
      }
      handleGenerateNewGraph(numNodes, numEdges, useNegative);
    } else {
      isMountedRef.current = true;
    }
  }, [numNodes, numEdges, allowNegativeWeights, selectedAlgorithmKey, handleGenerateNewGraph]);


  const initializeAlgorithm = useCallback(() => {
    if (!graph.nodes.length) {
        toast({ title: "Empty Graph", description: "Please generate a graph first.", variant: "destructive" });
        return false;
    }

    const needsStartNode = ['dijkstra', 'bellman-ford', 'a-star', 'prim'].includes(selectedAlgorithmKey);
    const needsTargetNode = selectedAlgorithmKey === 'a-star';

    if (needsStartNode) {
        if (!startNodeId || startNodeId.trim() === '') {
            toast({ title: "Missing Start Node", description: "Please specify a start node ID for this algorithm.", variant: "destructive" });
            return false;
        }
        if (!graph.nodes.find(n => n.id === startNodeId)) {
            toast({ title: "Invalid Start Node", description: `Start node "${startNodeId}" does not exist.`, variant: "destructive" });
            return false;
        }
    }

    if (needsTargetNode) {
        if (!targetNodeId || targetNodeId.trim() === '') {
            toast({ title: "Missing Target Node", description: "A* Search requires a target node ID.", variant: "destructive" });
            return false;
        }
        if (!graph.nodes.find(n => n.id === targetNodeId)) {
            toast({ title: "Invalid Target Node", description: `Target node "${targetNodeId}" does not exist.`, variant: "destructive" });
            return false;
        }
    }


    const generatorFn = graphAlgorithms[selectedAlgorithmKey].generator;
    const actualTargetNodeId = (targetNodeId && targetNodeId.trim() !== '') ? targetNodeId : undefined;
    
    if (isFloydWarshallSelected || isKruskalSelected) {
        algorithmInstanceRef.current = generatorFn(graph.nodes, graph.edges);
    } else if (isPrimSelected) {
        algorithmInstanceRef.current = generatorFn(graph.nodes, graph.edges, startNodeId);
    } else { // Dijkstra, Bellman-Ford, A*
        if (selectedAlgorithmKey === 'a-star' && !actualTargetNodeId) {
            toast({ title: "Target Node Required for A*", description: "Please specify a target node for A* search.", variant: "destructive" });
            return false;
        }
        algorithmInstanceRef.current = generatorFn(graph.nodes, graph.edges, startNodeId, actualTargetNodeId);
    }
    
    const firstStepResult = algorithmInstanceRef.current?.next();
    if (firstStepResult && !firstStepResult.done) {
        const step = firstStepResult.value as GraphStep;
        setCurrentStep(step);
        setIsFinished(step?.isFinalStep || false);
        if (step?.isFinalStep && step.message.toLowerCase().includes("error")) {
            toast({ title: "Algorithm Initialization Error", description: step.message, variant: "destructive" });
        }
    } else if (firstStepResult?.done && firstStepResult.value) { // Generator might complete in one step for trivial cases
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
  }, [graph, startNodeId, targetNodeId, selectedAlgorithmKey, toast, isFloydWarshallSelected, isKruskalSelected, isPrimSelected]);


  const resetVisualization = useCallback(() => {
    if(graph.nodes.length > 0){
        const reinitialized = initializeAlgorithm();
        if (!reinitialized ) {
           handleGenerateNewGraph(); // Fallback to regenerating graph if init fails badly
        }
    } else {
        handleGenerateNewGraph(); 
    }
  }, [initializeAlgorithm, handleGenerateNewGraph, graph.nodes.length]);

  const nextStep = useCallback(() => {
    if (!algorithmInstanceRef.current) {
      const initialized = initializeAlgorithm();
      if (!initialized) return false; 
      // If the first step from initializeAlgorithm was already final, nextStep shouldn't proceed.
      // The check for currentStep?.isFinalStep handles this.
      if (currentStep?.isFinalStep) return false; 
    }

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

  const maxNodesForCurrentAlgo = isFloydWarshallSelected ? 8 : 20;

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
              // Automatically adjust allowNegativeWeights based on algorithm
              if (newKey === 'dijkstra') {
                setAllowNegativeWeights(false);
              } else if (['bellman-ford', 'a-star', 'floyd-warshall', 'kruskal', 'prim'].includes(newKey)) {
                // For these, default to allowing negative weights if the checkbox was previously checked,
                // or set a sensible default (e.g. false for MSTs, true for Bellman/Floyd)
                // For now, let's just ensure it *can* be checked if it was already.
                // Actual graph generation will use the current `allowNegativeWeights` state.
              }
               if (numNodes > (newKey === 'floyd-warshall' ? 8 : 20)) {
                 setNumNodes(newKey === 'floyd-warshall' ? 8 : 20);
               }
            }}
          >
            <SelectTrigger id="graph-algorithm-select" className="mt-1">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(graphAlgorithms).map((algo) => (
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
                <Slider 
                  id="numNodesSlider" 
                  min={2} 
                  max={maxNodesForCurrentAlgo} 
                  value={[numNodes]} 
                  onValueChange={(val) => setNumNodes(val[0])} 
                  className="mt-1"
                />
                 {isFloydWarshallSelected && <p className="text-xs text-muted-foreground mt-1">Max 8 nodes for Floyd-Warshall due to V<sup>3</sup> complexity and matrix display.</p>}
            </div>
            <div>
                <Label htmlFor="numEdgesSlider">Number of Edges ({numEdges})</Label>
                <Slider 
                    id="numEdgesSlider" 
                    min={1} 
                    max={Math.min(50, numNodes * (numNodes -1) / (currentAlgorithmDetails.type === 'graph' ? 1 : 2) )} // Max edges for simple graph
                    value={[numEdges]} 
                    onValueChange={(val) => setNumEdges(val[0])} 
                    className="mt-1"
                />
            </div>
        </div>
         {(!isFloydWarshallSelected && !isKruskalSelected) && ( // Hide for Floyd-Warshall and Kruskal
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                    <Label htmlFor="startNode">Start Node ID {isPrimSelected && <span className="text-destructive">*</span>}</Label>
                    <Input 
                      id="startNode" 
                      type="text" 
                      value={startNodeId} 
                      onChange={(e) => setStartNodeId(e.target.value)} 
                      placeholder="e.g., n0" 
                      className="mt-1"
                      required={isPrimSelected}
                    />
                </div>
                {selectedAlgorithmKey !== 'prim' && ( // Hide Target Node for Prim's as well
                    <div>
                        <Label htmlFor="targetNode">
                        Target Node ID {selectedAlgorithmKey === 'a-star' && <span className="text-destructive">*</span>}
                        <span className="text-xs text-muted-foreground ml-1">
                            ({selectedAlgorithmKey === 'a-star' ? 'Required for A*' : 'Optional, not used by MSTs'})
                        </span>
                        </Label>
                        <Input 
                        id="targetNode" 
                        type="text" 
                        value={targetNodeId} 
                        onChange={(e) => setTargetNodeId(e.target.value)} 
                        placeholder="e.g., n4" 
                        className="mt-1"
                        required={selectedAlgorithmKey === 'a-star'} 
                        disabled={isMstAlgorithm}
                        />
                    </div>
                )}
            </div>
         )}
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
            <Label htmlFor="negativeWeights" className="text-sm font-medium">Allow Negative Edge Weights</Label>
        </div>
        <Button onClick={() => handleGenerateNewGraph(numNodes, numEdges, allowNegativeWeights)} variant="outline">
          <Shuffle className="mr-2 h-4 w-4" /> Regenerate Graph Manually
        </Button>
      </Card>
      
       <div className="flex flex-wrap gap-2 justify-center p-4 border rounded-lg bg-card shadow-sm">
        <Button onClick={nextStep} disabled={isFinished} variant="outline">
          <SkipForward className="mr-2 h-4 w-4" /> Next Step
        </Button>
        <Button onClick={resetVisualization} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Algorithm
        </Button>
      </div>

      <GraphDisplay step={currentStep} algorithmKey={selectedAlgorithmKey} />

      {currentStep && (
        <Card className={cn(
            "transition-all shadow-md",
            currentStep.negativeCycleDetected ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep && currentStep.targetFoundPath && currentStep.targetFoundPath.length > 0 && !isMstAlgorithm ? "border-accent bg-accent/10" :
            currentStep.isFinalStep && isMstAlgorithm && (currentStep.mstWeight !== undefined) ? "border-primary bg-primary/10" :
            currentStep.isFinalStep && (currentStep.message.toLowerCase().includes("not reachable") || currentStep.message.toLowerCase().includes("failed to find a path")) ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep && currentStep.message.toLowerCase().includes("error") ? "border-destructive bg-destructive/10" :
            currentStep.isFinalStep ? "border-primary bg-primary/10" :
            "bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-medium">
                    Status {currentStep.mstWeight !== undefined ? `(MST Weight: ${currentStep.mstWeight.toFixed(2)})` : ''}
                </CardTitle>
                 {currentStep.negativeCycleDetected && <AlertCircle className="h-5 w-5 text-destructive" />}
                 {!currentStep.negativeCycleDetected && currentStep.isFinalStep && (currentStep.message.toLowerCase().includes("not reachable") || currentStep.message.toLowerCase().includes("failed to find a path") || currentStep.message.toLowerCase().includes("error")) && <AlertCircle className="h-5 w-5 text-destructive" />}
                {!currentStep.negativeCycleDetected && currentStep.isFinalStep && currentStep.targetFoundPath && currentStep.targetFoundPath.length > 0 && !isMstAlgorithm && !(currentStep.message.toLowerCase().includes("error")) && <CheckCircle2 className="h-5 w-5 text-accent" />}
                {!currentStep.negativeCycleDetected && currentStep.isFinalStep && isMstAlgorithm && (currentStep.mstWeight !== undefined) && <Network className="h-5 w-5 text-primary" />}
                {!currentStep.negativeCycleDetected && currentStep.isFinalStep && (!currentStep.targetFoundPath || currentStep.targetFoundPath.length === 0) && !isMstAlgorithm && !(currentStep.message.toLowerCase().includes("negative-weight cycle detected") || currentStep.message.toLowerCase().includes("not reachable") || currentStep.message.toLowerCase().includes("failed to find a path") || currentStep.message.toLowerCase().includes("error")) && <CheckCircle2 className="h-5 w-5 text-primary" />}

            </CardHeader>
            <CardContent className="px-4 pb-3">
                <p className="text-sm text-muted-foreground min-h-[20px] whitespace-pre-wrap">{currentStep.message || "Algorithm initialized. Press Next Step."}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};
