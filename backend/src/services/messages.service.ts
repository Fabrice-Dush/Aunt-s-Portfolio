import { z } from "zod";
import { getDatabase } from "../config/database.js";
import { Prisma, type PrismaClient } from "../generated/prisma/client.js";
import { audit, checkVersion, lockRow, nextVersion } from "./cms.service.js";
import { contactSchema } from "../validators/content.js";
import { AppError } from "../utils/AppError.js";

export const submissionSchema = contactSchema.extend({
  website: z.string().max(200).default(""),
  startedAt: z.number().int().positive(),
});
export async function submitMessage(
  input: unknown,
  operation: unknown,
  db: Pick<PrismaClient, "contactMessage"> = getDatabase(),
) {
  const id = z.uuid().parse(operation).toLowerCase();
  const { website, startedAt, ...data } = submissionSchema.parse(input);
  const elapsed = Date.now() - startedAt;
  if (website || elapsed < 3000 || elapsed > 86400000)
    throw new AppError(
      400,
      "SUBMISSION_REJECTED",
      "Please review the form and try again.",
    );
  const message = { ...data, subject: data.subject ?? null };
  try {
    // The existing primary key serializes retries without a schema change or private audit payload.
    // No automatic retention policy is enabled without owner approval.
    await db.contactMessage.create({ data: { id, ...message, expiresAt: null } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await db.contactMessage.findUnique({
      where: { id },
      select: { senderName: true, senderEmail: true, subject: true, content: true },
    });
    if (!existing) throw error;
    if (Object.keys(message).some(key => Reflect.get(existing, key) !== Reflect.get(message, key))) {
      throw new AppError(409, "OPERATION_USED", "This message request has already been used. Review the form before sending again.");
    }
    // A lost success response can be retried while the stored message exists; never create a second row.
  }
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
