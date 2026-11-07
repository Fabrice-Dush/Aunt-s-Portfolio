import type { RequestHandler } from "express";
import { z } from "zod";
import {
  changeMessage,
  listMessages,
  submitMessage,
} from "../services/messages.service.js";
import { actionSchema, pageSchema } from "../validators/cms.js";
import { emptyQuerySchema, idSchema } from "../validators/content.js";
export const sendMessage: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  await submitMessage(req.body, req.headers["idempotency-key"]);
  res.status(201).json({ data: { received: true } });
};
export const getMessages: RequestHandler = async (req, res) => {
  const { page } = pageSchema.parse(req.query);
  const rows = await listMessages(page);
  res.json({
    data: rows.slice(0, 20),
    pagination: { page, hasMore: rows.length > 20 },
  });
};
export const updateMessage: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  const body = actionSchema
    .extend({ status: z.enum(["NEW", "READ", "ARCHIVED"]) })
    .parse(req.body);
  res.json({
    data: await changeMessage(
      idSchema.parse(req.params.id),
      body.expectedUpdatedAt,
      res.locals.auth.user.id,
      body.status,
    ),
  });
};
export const deleteMessage: RequestHandler = async (req, res) => {
  emptyQuerySchema.parse(req.query);
  const { expectedUpdatedAt } = actionSchema.parse(req.body);
  res.json({
    data: await changeMessage(
      idSchema.parse(req.params.id),
      expectedUpdatedAt,
      res.locals.auth.user.id,
      "DELETE",
    ),
  });
};
