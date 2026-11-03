import { Router } from 'express';
import { getApiMetadata } from '../controllers/api.controller.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.get('/', getApiMetadata);
apiRouter.use('/health', healthRouter);
