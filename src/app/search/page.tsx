import { SearchVisualizer } from '@/components/visualizers/search-visualizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="container mx-auto py-2">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Search Algorithm Visualizer</CardTitle>
          </div>
          <CardDescription>
            Select a searching algorithm, adjust data size and speed, and watch the process unfold.
            For Binary Search, the array will be automatically sorted before searching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchVisualizer />
        </CardContent>
      </Card>
    </div>
  );
}
