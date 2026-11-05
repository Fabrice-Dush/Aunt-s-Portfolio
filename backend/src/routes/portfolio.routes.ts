import { Router } from 'express';
import { getProfile, getProject, listContent } from '../controllers/portfolio.controller.js';

export const portfolioRouter = Router();
portfolioRouter.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
portfolioRouter.get('/profile', getProfile);
portfolioRouter.get('/experience', listContent('experience'));
portfolioRouter.get('/education', listContent('education'));
portfolioRouter.get('/skills', listContent('skills'));
portfolioRouter.get('/projects', listContent('projects'));
portfolioRouter.get('/projects/:slug', getProject);
portfolioRouter.get('/achievements', listContent('achievements'));
portfolioRouter.get('/certifications', listContent('certifications'));
