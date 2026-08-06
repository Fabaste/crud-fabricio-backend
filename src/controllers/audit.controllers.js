import { getRecentAuditActivity } from '../services/auditActivity.service.js';
import { getLatestAuditSnapshot } from '../jobs/auditCron.js';
import { successResponse, errorResponse } from '../helpers/response.helpers.js';

const getAuditActivity = async (req, res) => {
  try {
    const activities = getLatestAuditSnapshot();

    const payload = activities.length
      ? activities
      : await getRecentAuditActivity(1);

    return successResponse(res, payload.map((item) => ({
      id: item.id,
      title: item.message,
      message: item.message,
      type: item.action === 'DELETE' ? 'warning' : 'info',
      createdAt: item.createdAt,
    })), 'Actividad reciente de auditoría', 200);
  } catch (error) {
    return errorResponse(res, error.message || 'No se pudo obtener la actividad', 500);
  }
};

export { getAuditActivity };
