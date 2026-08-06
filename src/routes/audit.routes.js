import express from 'express';
import { getAuditActivity } from '../controllers/audit.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/audit/activity', authMiddleware, authorizeRoles('ROOT', 'ADMIN', 'USER'), getAuditActivity);

export default router;
