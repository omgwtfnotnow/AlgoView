import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ListFilter, Search } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold font-headline text-primary">Welcome to AlgoView</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Explore and understand searching and sorting algorithms like never before.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl font-headline">Search Visualizer</CardTitle>
            </div>
            <CardDescription>
              Watch step-by-step how algorithms like Linear Search and Binary Search find elements in a dataset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search" passHref>
              <Button className="w-full" variant="default">
                Explore Search Algorithms <Search className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ListFilter className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl font-headline">Sort Visualizer</CardTitle>
            </div>
            <CardDescription>
              Visualize the process of Bubble Sort, Merge Sort, Quick Sort, and more as they organize data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sort" passHref>
              <Button className="w-full" variant="default">
                Explore Sort Algorithms <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl font-headline">Smart Suggestions</CardTitle>
            </div>
            <CardDescription>
              Get AI-powered recommendations for the best algorithm based on your dataset characteristics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recommendations" passHref>
              <Button className="w-full" variant="default">
                Get Recommendations <Lightbulb className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="text-center mt-16 text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AlgoView. Understand algorithms, visually.</p>
      </footer>
    </div>
  );
}
