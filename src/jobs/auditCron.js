import cron from 'node-cron';
import { getRecentAuditActivity } from '../services/auditActivity.service.js';
import { logger } from '../logs/logger.js';

let latestAuditSnapshot = [];

const startAuditCron = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      latestAuditSnapshot = await getRecentAuditActivity(1);
      logger.info('Actividad de auditoría recopilada por cron', {
        count: latestAuditSnapshot.length,
      });
    } catch (error) {
      logger.error('Error al ejecutar el cron de auditoría', {
        error: error.message,
      });
    }
  });
};

const getLatestAuditSnapshot = () => latestAuditSnapshot;

export { startAuditCron, getLatestAuditSnapshot };
