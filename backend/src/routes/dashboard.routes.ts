import { Router } from 'express';
import { authenticate, noStore, superAdmin } from '../middlewares/auth.js';
import * as controller from '../controllers/dashboard.controller.js';

export const dashboardRouter = Router();
dashboardRouter.use(noStore, authenticate());
dashboardRouter.get('/summary', controller.summary);
dashboardRouter.get('/content/:section', controller.content);
dashboardRouter.get('/security', superAdmin, controller.security);
dashboardRouter.get('/status', superAdmin, controller.status);
