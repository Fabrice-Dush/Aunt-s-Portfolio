import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import { processUpload } from "../src/services/media.service.ts";
import { checkVersion, nextVersion } from "../src/services/cms.service.ts";
import {
  editSchema,
  publishSchema,
  orderSchema,
} from "../src/validators/cms.ts";
import { publicSnapshot } from "../src/services/public-site.service.ts";

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
