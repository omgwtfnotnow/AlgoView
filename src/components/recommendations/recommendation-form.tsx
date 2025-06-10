"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bot } from "lucide-react";
import React, { useState } from "react";
import { algorithmRecommendation, AlgorithmRecommendationInput, AlgorithmRecommendationOutput } from "@/ai/flows/algorithm-recommendation";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  datasetCharacteristics: z.string().min(10, {
    message: "Please describe your dataset characteristics in at least 10 characters.",
  }),
  taskType: z.enum(["search", "sort"], {
    required_error: "Please select a task type.",
  }),
});

export function RecommendationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AlgorithmRecommendationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datasetCharacteristics: "",
      taskType: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await algorithmRecommendation(values as AlgorithmRecommendationInput);
      setRecommendation(result);
      toast({
        title: "Recommendation Ready!",
        description: "AI has suggested an algorithm for you.",
      });
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="datasetCharacteristics"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Dataset Characteristics</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Large, nearly sorted array of integers; Small, random list of strings; Data with many duplicates."
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the size, distribution, type of data, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taskType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="sort">Sort</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Is the primary goal to search for an item or sort the dataset?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Recommendation...
              </>
            ) : (
              "Get Recommendation"
            )}
          </Button>
        </form>
      </Form>

      {recommendation && (
        <Card className="mt-8 bg-secondary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">AI Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-primary">{recommendation.recommendedAlgorithm}</h3>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{recommendation.justification}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
