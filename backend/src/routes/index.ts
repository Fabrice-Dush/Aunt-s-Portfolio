import { Router } from 'express';
import { getApiMetadata } from '../controllers/api.controller.js';
import { healthRouter } from './health.routes.js';
import { portfolioRouter } from './portfolio.routes.js';
import { authRouter, accountsRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';

export const apiRouter = Router();

apiRouter.get('/', getApiMetadata);
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/administrators', accountsRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use(portfolioRouter);
