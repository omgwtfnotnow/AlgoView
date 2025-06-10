import { SortVisualizer } from '@/components/visualizers/sort-visualizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListFilter } from 'lucide-react';

export default function SortPage() {
  return (
    <div className="container mx-auto py-2">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ListFilter className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Sort Algorithm Visualizer</CardTitle>
          </div>
          <CardDescription>
            Choose a sorting algorithm, customize data size and visualization speed, and observe the sorting process live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SortVisualizer />
        </CardContent>
      </Card>
    </div>
  );
}
