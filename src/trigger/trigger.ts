// trigger.ts (for TypeScript) or trigger.js (for JavaScript)

import { TriggerClient } from '@trigger.dev/sdk';

export const client = new TriggerClient({
  id: 'my-app',
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});
