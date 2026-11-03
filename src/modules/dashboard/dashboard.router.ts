import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { conditionStatistics, doctorStatistics, overview, patientTrends } from './dashboard.controller';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);
dashboardRouter.get('/overview', overview);
dashboardRouter.get('/patient-trends', patientTrends);
dashboardRouter.get('/doctor-statistics', doctorStatistics);
dashboardRouter.get('/condition-statistics', conditionStatistics);
