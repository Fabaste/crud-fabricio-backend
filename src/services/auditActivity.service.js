import Audit from '../models/audit.model.js';
import { logger } from '../logs/logger.js';

const getRecentAuditActivity = async (hours = 1) => {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const activities = await Audit.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .lean();

    return activities.map((item) => ({
      id: item._id,
      action: item.action,
      createdAt: item.createdAt,
      author: item.author,
      affectedUser: item.affectedUser,
      changes: item.changes,
      message: buildMessage(item),
    }));
  } catch (error) {
    logger.error('No se pudo obtener la actividad reciente de auditoría', {
      error: error.message,
    });
    throw error;
  }
};

const buildMessage = (item) => {
  const userName = item.affectedUser?.nombre || item.affectedUser?.email || 'usuario';

  switch (item.action) {
    case 'CREATE':
      return `Se creó el usuario ${userName}`;
    case 'UPDATE':
      return `Se actualizó el usuario ${userName}`;
    case 'DELETE':
      return `Se eliminó el usuario ${userName}`;
    default:
      return `Se registró una actividad para ${userName}`;
  }
};

export { getRecentAuditActivity };
