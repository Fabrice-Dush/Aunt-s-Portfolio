import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { authenticate, csrf, loginLimit, noStore, sensitiveLimit, superAdmin } from '../middlewares/auth.js';

export const authRouter = Router();
authRouter.use(noStore, csrf);
authRouter.post('/login', loginLimit, controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.use(authenticate(true));
authRouter.get('/me', controller.me);
authRouter.post('/change-password', sensitiveLimit, controller.changePassword);
authRouter.get('/sessions', controller.sessions);
authRouter.delete('/sessions/:id', controller.revokeSession);

export const accountsRouter = Router();
accountsRouter.use(noStore, csrf, authenticate(), superAdmin);
accountsRouter.get('/', controller.listAdmins);
accountsRouter.post('/', sensitiveLimit, controller.createAdmin);
accountsRouter.patch('/:id', sensitiveLimit, controller.updateAdmin);
accountsRouter.post('/:id/recovery', sensitiveLimit, controller.recoverAdmin);
accountsRouter.post('/:id/revoke-sessions', sensitiveLimit, controller.revokeAdminSessions);
