import type { RequestHandler } from 'express';
import { dashboardContent, dashboardSummary, securityEvents, systemStatus } from '../services/dashboard.service.js';
import { emptyInput, idInput, pageInput } from '../validators/auth.js';

export const summary: RequestHandler = async (req, res) => { emptyInput.parse(req.query); res.json({ data: await dashboardSummary(res.locals.auth.user.role === 'SUPER_ADMIN') }); };
export const content: RequestHandler = async (req, res) => {
  const { page } = pageInput.parse(req.query); const rows = await dashboardContent(idInput.parse(req.params.section), page);
  res.json({ data: rows.slice(0, 20), pagination: { page, hasMore: rows.length > 20 } });
};
export const security: RequestHandler = async (req, res) => {
  const { page } = pageInput.parse(req.query); const rows = await securityEvents(page);
  res.json({ data: rows.slice(0, 20), pagination: { page, hasMore: rows.length > 20 } });
};
export const status: RequestHandler = async (req, res) => { emptyInput.parse(req.query); res.json({ data: await systemStatus() }); };
