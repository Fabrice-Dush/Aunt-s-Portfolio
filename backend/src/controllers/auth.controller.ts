import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { accountsService } from '../services/accounts.service.js';
import { changePasswordInput, createAdminInput, emptyInput, idInput, loginInput, pageInput, reauthInput, recoveryInput, statusInput } from '../validators/auth.js';
import { clearCookies, cookieNames, readCookie, setCookies } from '../middlewares/auth.js';

export const login: RequestHandler = async (req, res) => {
  const input = loginInput.parse(req.body);
  const result = await authService().login(input.email, input.password);
  setCookies(res, result.tokens); res.json({ data: result.user });
};
export const refresh: RequestHandler = async (req, res) => {
  emptyInput.parse(req.body ?? {});
  try { setCookies(res, await authService().refresh(readCookie(req, cookieNames.refresh))); res.status(204).end(); }
  catch (error) { clearCookies(res); throw error; }
};
export const logout: RequestHandler = async (req, res) => {
  emptyInput.parse(req.body ?? {});
  await authService().logout(readCookie(req, cookieNames.refresh)); clearCookies(res); res.status(204).end();
};
export const me: RequestHandler = (req, res) => { emptyInput.parse(req.query); res.json({ data: res.locals.auth.user, sessionId: res.locals.auth.identity.sessionId }); };
export const changePassword: RequestHandler = async (req, res) => {
  const input = changePasswordInput.parse(req.body);
  await authService().changePassword(res.locals.auth.identity, input.currentPassword, input.newPassword);
  clearCookies(res); res.status(204).end();
};
export const sessions: RequestHandler = async (req, res) => { emptyInput.parse(req.query); res.json({ data: await authService().sessions(res.locals.auth.identity) }); };
export const revokeSession: RequestHandler = async (req, res) => {
  await authService().revoke(res.locals.auth.identity, idInput.parse(req.params.id));
  if (req.params.id === res.locals.auth.identity.sessionId) clearCookies(res);
  res.status(204).end();
};
export const listAdmins: RequestHandler = async (req, res) => {
  const { page } = pageInput.parse(req.query); const rows = await accountsService().list(page);
  res.json({ data: rows.slice(0, 20), pagination: { page, hasMore: rows.length > 20 } });
};
export const createAdmin: RequestHandler = async (req, res) => { res.status(201).json({ data: await accountsService().create(res.locals.auth.identity, createAdminInput.parse(req.body)) }); };
export const updateAdmin: RequestHandler = async (req, res) => {
  const input = statusInput.parse(req.body);
  res.json({ data: await accountsService().manage(res.locals.auth.identity, idInput.parse(req.params.id), 'status', input.currentPassword, input.isActive) });
};
export const recoverAdmin: RequestHandler = async (req, res) => {
  const input = recoveryInput.parse(req.body);
  res.json({ data: await accountsService().manage(res.locals.auth.identity, idInput.parse(req.params.id), 'recover', input.currentPassword, input.temporaryPassword) });
};
export const revokeAdminSessions: RequestHandler = async (req, res) => {
  const input = reauthInput.parse(req.body);
  await accountsService().manage(res.locals.auth.identity, idInput.parse(req.params.id), 'revoke', input.currentPassword);
  res.status(204).end();
};
