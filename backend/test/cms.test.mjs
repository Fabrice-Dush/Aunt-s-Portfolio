import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { PDFDocument, PDFName, PDFString, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream, degrees } from "pdf-lib";
import { randomUUID } from "node:crypto";
import { Prisma } from "../src/generated/prisma/client.ts";
import { processUpload } from "../src/services/media.service.ts";
import { checkVersion, nextVersion } from "../src/services/cms.service.ts";
import {
  editSchema,
  publishSchema,
  orderSchema,
} from "../src/validators/cms.ts";
import { publicSnapshot } from "../src/services/public-site.service.ts";
import { submitMessage } from "../src/services/messages.service.ts";
import { requestWebsiteRebuild } from "../src/controllers/public-site.controller.ts";

test("CMS writes require explicit versions and publication confirmation; ordering rejects duplicate IDs", () => {
  assert.equal(editSchema.safeParse({ data: {} }).success, false);
  assert.equal(
    publishSchema.safeParse({
      expectedUpdatedAt: new Date().toISOString(),
      confirmed: false,
    }).success,
    false,
  );
  assert.equal(
    editSchema.safeParse({
      expectedUpdatedAt: new Date().toISOString(),
      data: {},
      role: "SUPER_ADMIN",
    }).success,
    false,
  );
  const item = {
    id: "test",
    expectedUpdatedAt: new Date().toISOString(),
    sortOrder: 0,
  };
  assert.equal(orderSchema.safeParse({ items: [item, item] }).success, false);
  const old = new Date();
  assert.throws(
    () =>
      checkVersion(
        { updatedAt: old },
        new Date(old.getTime() - 1).toISOString(),
      ),
    { code: "EDIT_CONFLICT" },
  );
  assert.ok(
    nextVersion(new Date(Date.now() + 1000)).getTime() > Date.now() + 1000,
  );
});
test("upload checks content, extension, MIME, size and real decoding", async () => {
  for (const [data, name, mime] of [
    [Buffer.from("<svg/>"), "test.svg", "image/svg+xml"],
    [Buffer.from("MZ executable"), "test.jpg", "image/jpeg"],
    [Buffer.from([255, 216, 255, 0]), "test.jpg", "image/jpeg"],
    [Buffer.from("%PDF-invalid %%EOF"), "test.pdf", "application/pdf"],
  ]) {
    await assert.rejects(() => processUpload(data, name, mime), {
      code: "INVALID_FILE",
    });
  }
  const png = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#2b6996" },
  })
    .png()
    .toBuffer();
  await assert.rejects(() => processUpload(png, "test.jpg", "image/jpeg"), {
    code: "INVALID_FILE",
  });
  await assert.rejects(
    () => processUpload(Buffer.alloc(8_000_001), "test.png", "image/png"),
    { status: 413 },
  );
  const image = await processUpload(png, "test.png", "image/png");
  assert.equal(image.mimeType, "image/webp");
  assert.ok(image.small);
});
test("optimized image variants strip metadata and stay within dimension limits", async () => {
  const original = await sharp({
    create: { width: 2200, height: 2100, channels: 3, background: "#1b6896" },
  })
    .withExif({ IFD0: { Artist: "PRIVATE METADATA SENTINEL" } })
    .jpeg()
    .toBuffer();
  assert.ok((await sharp(original).metadata()).exif);
  const result = await processUpload(original, "test.jpeg", "image/jpeg");
  const main = await sharp(result.main).metadata();
  const small = await sharp(result.small).metadata();
  assert.ok(main.width <= 1600 && main.height <= 2000);
  assert.ok(small.width <= 640);
  assert.equal(main.exif, undefined);
  assert.equal(main.xmp, undefined);
});
test("PDF parser rejects active actions, including nested dictionaries, while accepting a plain document", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = Buffer.from(await pdf.save());
  assert.equal(
    (await processUpload(bytes, "test.pdf", "application/pdf")).mimeType,
    "application/pdf",
  );
  pdf
    .getPages()[0]
    .node.set(
      PDFName.of("Annots"),
      pdf.context.obj([
        {
          A: { S: PDFName.of("JavaScript"), JS: PDFString.of("app.alert(1)") },
        },
      ]),
    );
  const active = Buffer.from(await pdf.save());
  await assert.rejects(
    () => processUpload(active, "test.pdf", "application/pdf"),
    { code: "INVALID_FILE" },
  );
});
test("public snapshot propagates database failure instead of returning a stale content fallback", async () => {
  await assert.rejects(
    () =>
      publicSnapshot({
        $transaction: async () => {
          throw new Error("offline");
        },
      }),
    /offline/,
  );
});
test("PDF parser rejects active annotation subtypes stored through indirect references", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const subtype = pdf.context.register(PDFName.of("RichMedia"));
  pdf.getPages()[0].node.set(PDFName.of("Annots"), pdf.context.obj([{ Subtype: subtype }]));
  const bytes = Buffer.from(await pdf.save());
  await assert.rejects(
    () => processUpload(bytes, "test.pdf", "application/pdf"),
    { code: "INVALID_FILE" },
  );
});

test("PDF processing preserves readable pages while removing XMP, Info and orphan metadata objects", async () => {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const first = pdf.addPage([321, 456]);
  first.drawText("PUBLIC DOCUMENT CONTENT", { x: 20, y: 200 });
  first.setRotation(degrees(90));
  pdf.addPage([200, 300]).drawText("SECOND PUBLIC PAGE", { x: 15, y: 100 });
  const metadata = value => pdf.context.register(pdf.context.flateStream(value, {
    Type: PDFName.of("Metadata"), Subtype: PDFName.of("XML"),
  }));
  pdf.catalog.set(PDFName.of("Metadata"), metadata("<xmp>PRIVATE_CATALOG_XMP_SENTINEL</xmp>"));
  first.node.set(PDFName.of("Metadata"), metadata("<xmp>PRIVATE_PAGE_XMP_SENTINEL</xmp>"));
  const author = pdf.context.register(PDFString.of("PRIVATE_INDIRECT_AUTHOR_SENTINEL"));
  const info = pdf.context.obj({ Author: author, PrivateField: PDFString.of("PRIVATE_INFO_SENTINEL") });
  pdf.context.trailerInfo.Info = pdf.context.register(info);
  pdf.context.register(pdf.context.flateStream("PRIVATE_ORPHAN_SENTINEL"));
  const source = await PDFDocument.load(await pdf.save(), { updateMetadata: false });
  const contents = (document, page) => {
    const value = page.node.Contents();
    return (value instanceof PDFArray ? value.asArray() : [value]).filter(Boolean)
      .map(item => document.context.lookup(item))
      .map(stream => Buffer.from(decodePDFRawStream(stream).decode()).toString("hex"));
  };
  const originalContents = source.getPages().map(page => contents(source, page));
  const processed = await processUpload(Buffer.from(await pdf.save()), "test.pdf", "application/pdf");
  const clean = await PDFDocument.load(processed.main, { updateMetadata: false });
  assert.equal(clean.getPageCount(), 2);
  assert.deepEqual(clean.getPages().map(page => [page.getWidth(), page.getHeight(), page.getRotation().angle]), [[321, 456, 90], [200, 300, 0]]);
  assert.deepEqual(clean.getPages().map(page => contents(clean, page)), originalContents);
  assert.ok(clean.getPages().every(page => page.node.Resources()?.lookup(PDFName.of("Font"), PDFDict)?.keys().length > 0));
  assert.equal(clean.context.trailerInfo.Info, undefined);
  const decoded = [];
  const inspect = object => {
    if (object instanceof PDFRawStream) {
      decoded.push(Buffer.from(decodePDFRawStream(object).decode()).toString("utf8"));
      inspect(object.dict);
    } else if (object instanceof PDFDict) {
      for (const [key, value] of object.entries()) {
        assert.notEqual(key.decodeText(), "Metadata");
        inspect(value);
      }
    } else if (object instanceof PDFArray) object.asArray().forEach(inspect);
    else if (object instanceof PDFString) decoded.push(object.decodeText());
  };
  clean.context.enumerateIndirectObjects().forEach(([, object]) => inspect(object));
  assert.doesNotMatch(processed.main.toString("utf8") + decoded.join("\n"), /PRIVATE_\w+_SENTINEL/);
});

test("contact UUID retries create one message, compare normalized data, and preserve errors without logging bodies", async () => {
  const rows = new Map();
  const duplicate = () => new Prisma.PrismaClientKnownRequestError("test duplicate", { code: "P2002", clientVersion: "test" });
  let creates = 0;
  const db = { contactMessage: {
    async create({ data }) {
      creates++;
      if (rows.has(data.id)) throw duplicate();
      rows.set(data.id, data);
      return data;
    },
    async findUnique({ where }) { return rows.get(where.id) ?? null; },
  } };
  const body = { senderName: "  TEST ONLY correspondent  ", senderEmail: "test@example.invalid", content: "  PRIVATE_MESSAGE_SENTINEL  ", website: "", startedAt: Date.now() - 5000 };
  const operation = randomUUID();
  await Promise.all([submitMessage(body, operation, db), submitMessage({ ...body, subject: null }, operation, db)]);
  await submitMessage(body, operation.toUpperCase(), db);
  assert.equal(rows.size, 1);
  assert.equal(rows.get(operation).senderName, "TEST ONLY correspondent");
  assert.equal(rows.get(operation).content, "PRIVATE_MESSAGE_SENTINEL");
  assert.equal(rows.get(operation).expiresAt, null);
  await assert.rejects(() => submitMessage({ ...body, content: "Changed" }, operation, db), { status: 409, code: "OPERATION_USED" });
  const beforeInvalid = creates;
  for (const id of [undefined, "invented", [operation]]) await assert.rejects(() => submitMessage(body, id, db));
  for (const invalid of [{ ...body, website: "spam" }, { ...body, startedAt: Date.now() }, { ...body, startedAt: Date.now() - 86400001 }, { ...body, senderEmail: "invalid" }, { ...body, unsupported: true }]) {
    await assert.rejects(() => submitMessage(invalid, randomUUID(), db));
  }
  assert.equal(creates, beforeInvalid);
  const offline = new Error("test storage unavailable");
  await assert.rejects(() => submitMessage(body, randomUUID(), { contactMessage: { create: async () => { throw offline; } } }), error => error === offline);
  const missingReceipt = duplicate();
  await assert.rejects(() => submitMessage(body, randomUUID(), { contactMessage: {
    create: async () => { throw missingReceipt; }, findUnique: async () => null,
  } }), error => error === missingReceipt);
});

test("website rebuild waits for its audit receipt and does not start if auditing fails", async () => {
  const events = [];
  await requestWebsiteRebuild("test-actor", async actor => { events.push("audit:" + actor); }, () => { events.push("build"); });
  assert.deepEqual(events, ["audit:test-actor", "build"]);
  events.length = 0;
  await assert.rejects(() => requestWebsiteRebuild("test-actor", async () => { throw new Error("test audit unavailable"); }, () => { events.push("build"); }), /test audit unavailable/);
  assert.deepEqual(events, []);
});
