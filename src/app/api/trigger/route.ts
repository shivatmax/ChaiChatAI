import { createAppRoute } from '@trigger.dev/nextjs';
import { client } from '../../../trigger';

export const { POST } = createAppRoute(client);
