import { defineConfig } from '@trigger.dev/sdk/v3';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
export default defineConfig({
  project: 'proj_yaqprrdkkzbtvwyiynwu',
  runtime: 'node',
  logLevel: 'log',
  // Set the maxDuration to 300 seconds for all tasks. See https://trigger.dev/docs/runs/max-duration
  // maxDuration: 300,
  build: {
    extensions: [
      prismaExtension({
        schema: 'prisma/schema.prisma',
        // Enable this if you want to run migrations during deploy
        // migrate: true,
      }),
    ],
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
});
