import { z } from "zod";
import { getDatabase } from "../config/database.js";
import { privateServices } from "./private.service.js";
import { audit, checkVersion, lockRow, nextVersion } from "./cms.service.js";
import { contactSchema } from "../validators/content.js";
import { AppError } from "../utils/AppError.js";

export const submissionSchema = contactSchema.extend({
  website: z.string().max(200).default(""),
  startedAt: z.number().int().positive(),
});
export async function submitMessage(input: unknown) {
  const { website, startedAt, ...data } = submissionSchema.parse(input);
  const elapsed = Date.now() - startedAt;
  if (website || elapsed < 3000 || elapsed > 86400000)
    throw new AppError(
      400,
      "SUBMISSION_REJECTED",
      "Please review the form and try again.",
    );
  // No automatic retention policy is enabled without owner approval.
  await privateServices(getDatabase()).createMessage(data, null);
}
export const messageSelect = {
  id: true,
  senderName: true,
  senderEmail: true,
  subject: true,
  content: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;
export async function listMessages(page: number) {
  return getDatabase().contactMessage.findMany({
    skip: (page - 1) * 20,
    take: 21,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: messageSelect,
  });
}
export async function changeMessage(
  id: string,
  expected: string,
  actorId: string,
  status: "NEW" | "READ" | "ARCHIVED" | "DELETE",
) {
  return getDatabase().$transaction(async (tx) => {
    await lockRow(tx, "contactMessage", id);
    const row = await tx.contactMessage.findUnique({ where: { id } });
    if (!row) throw new AppError(404, "NOT_FOUND", "Message not found");
    checkVersion(row, expected);
    if (status === "DELETE") await tx.contactMessage.delete({ where: { id } });
    else
      await tx.contactMessage.update({
        where: { id },
        data: { status, updatedAt: nextVersion(row.updatedAt) },
      });
    await audit(
      tx,
      actorId,
      status === "DELETE" ? "MESSAGE_DELETE" : "MESSAGE_STATUS",
      "message",
      id,
    );
    return status === "DELETE"
      ? null
      : tx.contactMessage.findUnique({ where: { id }, select: messageSelect });
  });
}
