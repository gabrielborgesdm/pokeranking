import { defineConfig } from 'orval';

export default defineConfig({
  pokerankingApi: {
    input: {
      target: './openapi.json',
      validation: false,
    },
    output: {
      mode: 'tags-split',
      target: './generated/endpoints',
      schemas: './generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/client.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          useSuspenseQuery: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write "./generated/**/*.ts"',
    },
  },
});
