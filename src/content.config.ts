import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import projects from './data/projects.json';

const projectIds = new Set(projects.map(project => project.slug));
export const collections = {
  cases: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
    schema: z.object({
      project: z.string().refine(value => projectIds.has(value), 'Unknown project'),
      locale: z.enum(['zh', 'en']),
    }),
  }),
};
