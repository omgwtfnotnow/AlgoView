// src/ai/flows/algorithm-recommendation.ts
'use server';

/**
 * @fileOverview A algorithm recommendation AI agent.
 *
 * - algorithmRecommendation - A function that handles the algorithm recommendation process.
 * - AlgorithmRecommendationInput - The input type for the algorithmRecommendation function.
 * - AlgorithmRecommendationOutput - The return type for the algorithmRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlgorithmRecommendationInputSchema = z.object({
  datasetCharacteristics: z
    .string()
    .describe('The characteristics of the dataset, including size, distribution, and any known properties.'),
  taskType: z.enum(['search', 'sort']).describe('The type of task to be performed: search or sort.'),
});
export type AlgorithmRecommendationInput = z.infer<
  typeof AlgorithmRecommendationInputSchema
>;

const AlgorithmRecommendationOutputSchema = z.object({
  recommendedAlgorithm: z.string().describe('The recommended algorithm for the given dataset characteristics and task type.'),
  justification: z.string().describe('The justification for recommending the algorithm.'),
});
export type AlgorithmRecommendationOutput = z.infer<
  typeof AlgorithmRecommendationOutputSchema
>;

export async function algorithmRecommendation(
  input: AlgorithmRecommendationInput
): Promise<AlgorithmRecommendationOutput> {
  return algorithmRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'algorithmRecommendationPrompt',
  input: {schema: AlgorithmRecommendationInputSchema},
  output: {schema: AlgorithmRecommendationOutputSchema},
  prompt: `You are an expert in algorithm analysis and selection.

Based on the dataset characteristics and the task type, recommend the most suitable algorithm and provide a justification for your recommendation.

Dataset Characteristics: {{{datasetCharacteristics}}}
Task Type: {{{taskType}}}

Consider factors such as time complexity, space complexity, and suitability for different data distributions.

Ensure that the output is well-structured and easy to understand.

Your recommendation:
`,
});

const algorithmRecommendationFlow = ai.defineFlow(
  {
    name: 'algorithmRecommendationFlow',
    inputSchema: AlgorithmRecommendationInputSchema,
    outputSchema: AlgorithmRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
