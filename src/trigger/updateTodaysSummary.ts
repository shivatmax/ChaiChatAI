import { logger, schedules } from '@trigger.dev/sdk/v3';
import { PrismaClient } from '@prisma/client';

export const updateTodaysSummaryTask = schedules.task({
  id: 'update-todays-summary',
  cron: '30 19 * * *',
  maxDuration: 60,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (payload, { ctx }) => {
    const prisma = new PrismaClient();

    try {
      const result = await prisma.user.updateMany({
        where: {
          TodaysSummary: true,
        },
        data: {
          TodaysSummary: false,
        },
      });

      logger.log('Updated TodaysSummary for users', {
        updatedCount: result.count,
        timestamp: payload.timestamp,
      });
    } catch (error) {
      logger.error('Error updating TodaysSummary', { error });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
});
