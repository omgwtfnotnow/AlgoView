
import { GraphVisualizer } from '@/components/visualizers/graph-visualizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waypoints } from 'lucide-react';

export default function GraphPage() {
  return (
    <div className="container mx-auto py-2">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Waypoints className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Graph Algorithm Visualizer</CardTitle>
          </div>
          <CardDescription>
            Explore graph traversal and shortest path algorithms. Select an algorithm, configure the graph (soon!), and see how it works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraphVisualizer />
        </CardContent>
      </Card>
    </div>
  );
}
