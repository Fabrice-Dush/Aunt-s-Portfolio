import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate, csrf, noStore } from "../middlewares/auth.js";
import {
  deleteMessage,
  getMessages,
  sendMessage,
  updateMessage,
} from "../controllers/messages.controller.js";
export const messagesRouter = Router();
messagesRouter.use(["/contact", "/cms-messages"], noStore, csrf);
messagesRouter.post(
  "/contact",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many messages. Please try again later.",
      },
    },
  }),
  sendMessage,
);
messagesRouter.use("/cms-messages", authenticate());
messagesRouter.get("/cms-messages", getMessages);
messagesRouter.patch("/cms-messages/:id", updateMessage);
messagesRouter.delete("/cms-messages/:id", deleteMessage);
