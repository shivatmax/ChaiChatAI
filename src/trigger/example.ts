import { cronTrigger } from '@trigger.dev/sdk';
import prisma from '../app/lib/prisma';
import { client } from '@/trigger/trigger';

client.defineJob({
  id: 'update-todays-summary',
  name: 'Update Todays Summary',
  version: '0.0.1',
  trigger: cronTrigger({
    cron: '30 14 * * 1',
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (payload, io, ctx) => {
    try {
      const result = await prisma.user.updateMany({
        where: {
          TodaysSummary: true,
        },
        data: {
          TodaysSummary: false,
        },
      });

      await io.logger.info('Updated TodaysSummary for users', {
        updatedCount: result.count,
        payload,
      });

      return {
        updatedCount: result.count,
      };
    } catch (error) {
      await io.logger.error('Error updating TodaysSummary', { error });
      throw error;
    }
  },
});
