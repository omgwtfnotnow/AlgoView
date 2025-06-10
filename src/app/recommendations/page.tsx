import { RecommendationForm } from "@/components/recommendations/recommendation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Algorithm Recommendation Tool</CardTitle>
          </div>
          <CardDescription>
            Describe your dataset and task, and our AI will suggest the most suitable searching or sorting algorithm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendationForm />
        </CardContent>
      </Card>
    </div>
  );
}
