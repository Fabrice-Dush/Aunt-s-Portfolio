import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { app } from "../../src/app.ts";
import {
  getDatabase,
  databaseOptions,
  disconnectDatabase,
} from "../../src/config/database.ts";
import { hashPassword } from "../../src/services/password.service.ts";
import {
  publicSnapshot,
  publicDirectory,
} from "../../src/services/public-site.service.ts";
import { mediaRoot } from "../../src/services/media.service.ts";

const target = databaseOptions(process.env.DATABASE_URL);
assert.equal(target.database, "seraphine_portfolio_test");
assert.equal(target.user, "seraphine_test");
assert.ok(["localhost", "127.0.0.1"].includes(target.host));
assert.equal(process.env.NODE_ENV, "test");
const db = getDatabase();
test("Phase 7 real CMS, media, messages, publication and public build acceptance", async (t) => {
  const models = [
    "profile",
    "experience",
    "education",
    "skill",
    "project",
    "achievement",
    "certificate",
    "mediaAsset",
    "contactMessage",
    "siteSettings",
    "authSession",
    "auditLog",
    "user",
  ];
  for (const model of models)
    assert.equal(
      await db[model].count(),
      0,
      "Refusing nonempty test database: " + model,
    );
  const ids = Object.fromEntries(models.map((m) => [m, new Set()]));
  const files = new Set();
  const capture = async () => {
    for (const model of models)
      for (const row of await db[model].findMany({ select: { id: true } }))
        ids[model].add(row.id);
    for (const row of await db.mediaAsset.findMany({
      select: { storageKey: true },
    }))
      for (const suffix of ["", ".small", ".original"])
        files.add(row.storageKey + suffix);
  };
  t.after(async () => {
    await capture();
    for (const model of [
      "achievement",
      "certificate",
      "profile",
      "mediaAsset",
      "experience",
      "education",
      "skill",
      "project",
      "contactMessage",
      "siteSettings",
      "auditLog",
      "authSession",
      "user",
    ])
      await db[model].deleteMany({ where: { id: { in: [...ids[model]] } } });
    for (const file of files)
      await unlink(mediaRoot + "/" + file).catch(() => {});
    await disconnectDatabase();
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((r) => server.close(r)));
  const origin = "http://localhost:5173";
  const base = "http://127.0.0.1:" + server.address().port;
  let requests = 0;
  const request = async (
    path,
    {
      method = "GET",
      body,
      token,
      raw,
      mime,
      foreign = false,
      operation = randomUUID(),
    } = {},
  ) => {
    requests++;
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: foreign ? "https://foreign.invalid" : origin,
        "X-Portfolio-Request": "1",
        "Idempotency-Key": operation,
        ...(token ? { Cookie: "sp_access=" + token } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(raw ? { "Content-Type": mime } : {}),
      },
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : raw
          ? { body: raw }
          : {}),
    });
    const text = await response.text();
    await capture();
    return {
      status: response.status,
      headers: response.headers,
      text,
      body:
        response.headers.get("content-type")?.includes("json") && text
          ? JSON.parse(text)
          : null,
    };
  };
  const password = randomBytes(24).toString("base64url");
  let token;
  let profile;
  let project;
  let media;
  await t.test(
    "real login prerequisite; guest, forged session, CSRF and technical role boundaries",
    async () => {
      const user = await db.user.create({
        data: {
          email: "cms-test@example.invalid",
          displayName: "TEST ONLY CMS",
          passwordHash: await hashPassword(password),
          role: "ADMIN",
        },
      });
      ids.user.add(user.id);
      const login = await fetch(base + "/api/v1/auth/login", {
        method: "POST",
        headers: {
          Origin: origin,
          "X-Portfolio-Request": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, password }),
      });
      assert.equal(login.status, 200);
      token = login.headers
        .getSetCookie()
        .find((c) => c.startsWith("sp_access="))
        .split(";")[0]
        .slice(10);
      await login.text();
      for (const path of [
        "/cms/profile",
        "/cms-media",
        "/cms-messages",
        "/cms-settings",
        "/cms-sync",
      ])
        assert.equal((await request("/api/v1" + path)).status, 401);
      assert.equal(
        (
          await request("/api/v1/cms/skills", {
            method: "POST",
            token: "forged",
            body: { name: "TEST ONLY" },
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await request("/api/v1/cms/skills", {
            method: "POST",
            token,
            body: { name: "TEST ONLY" },
            foreign: true,
          })
        ).status,
        403,
      );
      assert.equal(
        (await request("/api/v1/dashboard/security", { token })).status,
        403,
      );
      assert.equal(
        (
          await request("/api/v1/cms/skills", {
            method: "POST",
            token,
            body: { name: "TEST ONLY", status: "PUBLISHED" },
          })
        ).status,
        400,
      );
      assert.equal(
        (await request('/api/v1/cms/skills', { method: 'POST', token })).status,
        400,
        'Missing content must be a validation error, not a server error',
      );
    },
  );
  await t.test(
    "profile draft, independent contact consent, publication, preservation and safe preview",
    async () => {
      const result = await request("/api/v1/cms/profile", {
        method: "POST",
        token,
        body: {
          fullName: "Nyirarukundo Seraphine",
          professionalTitle: "Water Treatment Plant Engineer",
          motto: "Water is life",
          summary: "TEST ONLY public profile",
          email: "private-test@example.invalid",
        },
      });
      assert.equal(result.status, 201);
      profile = result.body.data;
      assert.equal((await request("/api/v1/profile")).status, 404);
      assert.equal(
        (
          await request("/api/v1/cms/profile/owner/preview", { token })
        ).headers.get("cache-control"),
        "no-store",
      );
      const pub = await request("/api/v1/cms/profile/owner/publish", {
        method: "POST",
        token,
        body: { expectedUpdatedAt: profile.updatedAt, confirmed: true },
      });
      assert.equal(pub.status, 200);
      profile = pub.body.data;
      assert.equal((await request("/api/v1/profile")).body.data.contact, null);
      const consent = await request("/api/v1/cms/profile/owner/publish", {
        method: "POST",
        token,
        body: {
          expectedUpdatedAt: profile.updatedAt,
          confirmed: true,
          contactConsent: true,
        },
      });
      profile = consent.body.data;
      assert.equal(
        (await request("/api/v1/profile")).body.data.contact.email,
        "private-test@example.invalid",
      );
      const edit = await request("/api/v1/cms/profile/owner", {
        method: "PATCH",
        token,
        body: {
          expectedUpdatedAt: profile.updatedAt,
          data: { summary: "TEST ONLY edited profile" },
        },
      });
      assert.equal(edit.status, 200);
      profile = edit.body.data;
      assert.equal(profile.showPublicContact, false);
      assert.equal(profile.email, "private-test@example.invalid");
      const repub = await request("/api/v1/cms/profile/owner/publish", {
        method: "POST",
        token,
        body: { expectedUpdatedAt: profile.updatedAt, confirmed: true },
      });
      profile = repub.body.data;
    },
  );
  const fixtures = {
    experience: {
      jobTitle: "TEST ONLY role",
      organization: "TEST ONLY org",
      startYear: 2020,
      isCurrent: true,
    },
    education: {
      qualification: "TEST ONLY award",
      institution: "TEST ONLY institution",
    },
    skills: {
      name: "TEST ONLY skill",
      description: "<script>STORED_XSS_SENTINEL</script>",
    },
    projects: { title: "TEST ONLY project", slug: "test-only-project" },
    achievements: { title: "TEST ONLY achievement" },
    certifications: { title: "TEST ONLY training" },
  };
  for (const [section, fixture] of Object.entries(fixtures))
    await t.test(
      section +
        " authenticated CRUD, draft, preview, verification, publish, unpublish and ordering",
      async () => {
        let row = (
          await request("/api/v1/cms/" + section, {
            method: "POST",
            token,
            body: fixture,
          })
        ).body.data;
        assert.ok(row?.id);
        const id = row.id;
        assert.ok(
          !(await publicSnapshot()).data[section].some((r) => r.id === id),
        );
        assert.equal(
          (await request("/api/v1/cms/" + section + "/" + id + "/preview"))
            .status,
          401,
        );
        assert.equal(
          (
            await request("/api/v1/cms/" + section + "/" + id + "/preview", {
              token,
            })
          ).body.data.id,
          id,
        );
        assert.equal(
          (
            await request("/api/v1/cms/" + section + "/" + id + "/publish", {
              method: "POST",
              token,
              body: { expectedUpdatedAt: row.updatedAt, confirmed: true },
            })
          ).status,
          409,
        );
        const edit = await request("/api/v1/cms/" + section + "/" + id, {
          method: "PATCH",
          token,
          body: {
            expectedUpdatedAt: row.updatedAt,
            data: { isVerified: true, sortOrder: 1 },
          },
        });
        assert.equal(edit.status, 200);
        row = edit.body.data;
        const pub = await request(
          "/api/v1/cms/" + section + "/" + id + "/publish",
          {
            method: "POST",
            token,
            body: { expectedUpdatedAt: row.updatedAt, confirmed: true },
          },
        );
        assert.equal(pub.status, 200);
        row = pub.body.data;
        assert.ok(
          (await publicSnapshot()).data[section].some((r) => r.id === id),
        );
        assert.equal(
          (
            await request("/api/v1/cms/" + section + "/reorder", {
              method: "POST",
              token,
              body: {
                items: [{ id, expectedUpdatedAt: row.updatedAt, sortOrder: 3 }],
              },
            })
          ).status,
          200,
        );
        row = await db[
          {
            skills: "skill",
            projects: "project",
            achievements: "achievement",
            certifications: "certificate",
          }[section] ?? section
        ].findUnique({ where: { id } });
        if (section === "projects") {
          project = { ...row, updatedAt: row.updatedAt.toISOString() };
          return;
        }
        const unpub = await request(
          "/api/v1/cms/" + section + "/" + id + "/unpublish",
          {
            method: "POST",
            token,
            body: { expectedUpdatedAt: row.updatedAt.toISOString() },
          },
        );
        assert.equal(unpub.status, 200);
        row = unpub.body.data;
        assert.ok(
          !(await publicSnapshot()).data[section].some((r) => r.id === id),
        );
        assert.equal(
          (
            await request("/api/v1/cms/" + section + "/" + id, {
              method: "DELETE",
              token,
              body: { expectedUpdatedAt: row.updatedAt },
            })
          ).status,
          200,
        );
      },
    );
  await t.test(
    "conflicting editors, duplicate slugs, invalid periods and atomic reorder rollback",
    async () => {
      assert.equal(
        (
          await request("/api/v1/cms/projects/" + project.id, {
            method: "PATCH",
            token,
            body: {
              expectedUpdatedAt: new Date(0).toISOString(),
              data: { title: "LOST UPDATE SENTINEL" },
            },
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await request("/api/v1/cms/projects", {
            method: "POST",
            token,
            body: { title: "TEST ONLY duplicate", slug: project.slug },
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await request("/api/v1/cms/experience", {
            method: "POST",
            token,
            body: {
              jobTitle: "TEST ONLY",
              organization: "TEST ONLY",
              startYear: 2025,
              endYear: 2020,
            },
          })
        ).status,
        400,
      );
      const before = await db.project.findUnique({ where: { id: project.id } });
      assert.equal(
        (
          await request("/api/v1/cms/projects/reorder", {
            method: "POST",
            token,
            body: {
              items: [
                {
                  id: project.id,
                  expectedUpdatedAt: before.updatedAt.toISOString(),
                  sortOrder: 99,
                },
                {
                  id: "missing-record",
                  expectedUpdatedAt: before.updatedAt.toISOString(),
                  sortOrder: 0,
                },
              ],
            },
          })
        ).status,
        404,
      );
      assert.equal(
        (await db.project.findUnique({ where: { id: project.id } })).sortOrder,
        before.sortOrder,
      );
      assert.equal(
        (
          await request("/api/v1/cms/projects/" + project.id, {
            method: "PATCH",
            token,
            body: {
              expectedUpdatedAt: before.updatedAt.toISOString(),
              data: { slug: "changed-address" },
            },
          })
        ).status,
        409,
      );
    },
  );
  await t.test(
    "concurrent retries of the same create request produce one record and one audit receipt",
    async () => {
      const operation = randomUUID();
      const body = { name: "TEST ONLY idempotent skill" };
      const results = await Promise.all([
        request("/api/v1/cms/skills", {
          method: "POST",
          token,
          body,
          operation,
        }),
        request("/api/v1/cms/skills", {
          method: "POST",
          token,
          body,
          operation,
        }),
      ]);
      assert.ok(results.every((r) => r.status === 201));
      assert.equal(results[0].body.data.id, results[1].body.data.id);
      assert.equal(await db.skill.count({ where: { name: body.name } }), 1);
      assert.equal(
        (
          await request("/api/v1/cms/skills", {
            method: "POST",
            token,
            body: { name: "TEST ONLY different" },
            operation,
          })
        ).status,
        409,
      );
      const row = results[0].body.data;
      assert.equal(
        (
          await request("/api/v1/cms/skills/" + row.id, {
            method: "DELETE",
            token,
            body: { expectedUpdatedAt: row.updatedAt },
          })
        ).status,
        200,
      );
    },
  );
  await t.test(
    "real image upload, private original, guarded file serving, approval, attachment and shared-use deletion",
    async () => {
      const image = await sharp({
        create: { width: 16, height: 16, channels: 3, background: "#165d95" },
      })
        .png()
        .toBuffer();
      const upload = await request(
        "/api/v1/cms-media?fileName=test-only.png&altText=Test%20only%20image",
        { method: "POST", token, raw: image, mime: "image/png" },
      );
      assert.equal(upload.status, 201);
      media = upload.body.data;
      assert.doesNotMatch(JSON.stringify(media), /storageKey|private-media/);
      const privateFile = await request("/api/v1/media/" + media.id);
      assert.equal(privateFile.status, 404);
      assert.equal(privateFile.headers.get("cache-control"), "no-store");
      assert.equal(
        (await request("/api/v1/cms-media/" + media.id + "/file")).status,
        401,
      );
      assert.equal(
        (await request("/api/v1/cms-media/" + media.id + "/file", { token }))
          .status,
        200,
      );
      media = (
        await request("/api/v1/cms-media/" + media.id, {
          method: "PATCH",
          token,
          body: {
            expectedUpdatedAt: media.updatedAt,
            altText: media.altText,
            projectId: project.id,
          },
        })
      ).body.data;
      assert.equal((await request("/api/v1/media/" + media.id)).status, 404);
      media = (
        await request("/api/v1/cms-media/" + media.id + "/approve", {
          method: "POST",
          token,
          body: { expectedUpdatedAt: media.updatedAt, confirmed: true },
        })
      ).body.data;
      const file = await request("/api/v1/media/" + media.id);
      assert.equal(file.status, 200);
      assert.equal(file.headers.get("cache-control"), "no-store");
      assert.equal(
        (
          await request("/api/v1/cms-media/" + media.id, {
            method: "DELETE",
            token,
            body: { expectedUpdatedAt: media.updatedAt },
          })
        ).status,
        409,
      );
      const assets = await readdir(mediaRoot);
      assert.equal(assets.filter((f) => f.endsWith(".original")).length, 1);
    },
  );
  await t.test(
    "contact submission stores privately, then authenticated read, status, conflict and deletion work",
    async () => {
      const body = {
        senderName: "TEST ONLY correspondent",
        senderEmail: "message-test@example.invalid",
        subject: "TEST ONLY subject",
        content: "PRIVATE_MESSAGE_SENTINEL",
        website: "",
        startedAt: Date.now() - 5000,
      };
      assert.equal(
        (
          await request("/api/v1/contact", {
            method: "POST",
            body,
            foreign: true,
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await request("/api/v1/contact", {
            method: "POST",
            body: { ...body, website: "spam" },
          })
        ).status,
        400,
      );
      assert.equal(
        (await request("/api/v1/contact", { method: "POST", body })).status,
        201,
      );
      let row = (await request("/api/v1/cms-messages", { token })).body.data[0];
      assert.equal(row.content, body.content);
      assert.doesNotMatch(
        JSON.stringify(await publicSnapshot()),
        /PRIVATE_MESSAGE_SENTINEL/,
      );
      assert.equal(
        (await db.contactMessage.findUnique({ where: { id: row.id } }))
          .expiresAt,
        null,
      );
      const next = await request("/api/v1/cms-messages/" + row.id, {
        method: "PATCH",
        token,
        body: { expectedUpdatedAt: row.updatedAt, status: "READ" },
      });
      assert.equal(next.status, 200);
      assert.equal(
        (
          await request("/api/v1/cms-messages/" + row.id, {
            method: "PATCH",
            token,
            body: { expectedUpdatedAt: row.updatedAt, status: "ARCHIVED" },
          })
        ).status,
        409,
      );
      row = next.body.data;
      for (const status of ['NEW', 'ARCHIVED']) {
        const changed = await request('/api/v1/cms-messages/' + row.id, {
          method: 'PATCH', token,
          body: { expectedUpdatedAt: row.updatedAt, status },
        });
        assert.equal(changed.status, 200);
        row = changed.body.data;
        assert.equal(row.status, status);
      }
      assert.equal(
        (
          await request("/api/v1/cms-messages/" + row.id, {
            method: "DELETE",
            token,
            body: { expectedUpdatedAt: row.updatedAt },
          })
        ).status,
        200,
      );
    },
  );
  await t.test(
    "actual isolated Vite build uses DB content, hydrates matching snapshot, blocks stale HTML and revokes media on unpublish",
    async () => {
      await mkdir(publicDirectory, { recursive: true });
      const root = fileURLToPath(new URL("../../../", import.meta.url));
      const result = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ["frontend/scripts/build.mjs"], {
          cwd: root,
          env: { ...process.env, PORTFOLIO_BUILD_TEST: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });
        let log = "";
        child.stdout.on("data", (d) => {
          log += d;
        });
        child.stderr.on("data", (d) => {
          log += d;
        });
        child.on("error", reject);
        child.on("exit", (code) => resolve({ code, log }));
      });
      assert.equal(result.code, 0, result.log);
      const html = await readFile(publicDirectory + "/index.html", "utf8");
      const unavailable = new URL(process.env.DATABASE_URL); unavailable.port = '1';
      const failed = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['frontend/scripts/build.mjs'], { cwd: root, env: { ...process.env, PORTFOLIO_BUILD_TEST: '1', DATABASE_URL: unavailable.href, MIGRATION_DATABASE_URL: unavailable.href }, stdio: ['ignore','pipe','pipe'], windowsHide: true });
        let log=''; child.stdout.on('data', data=>{log+=data;}); child.stderr.on('data', data=>{log+=data;}); child.once('error',reject); child.once('exit',code=>resolve({code,log}));
      });
      assert.equal(failed.code,1); assert.match(failed.log,/Public content export failed/); assert.doesNotMatch(failed.log,/PrismaClientKnownRequestError|connect ECONN|mysql:\/\//);
      assert.ok((await readFile(publicDirectory + '/index.html','utf8')) === html, 'Failed export must preserve the previous artifact');
      assert.match(html, /<h3>TEST ONLY project<\/h3>/);
      assert.doesNotMatch(
        html,
        /PRIVATE_MESSAGE_SENTINEL|private-test@example.invalid|LOST UPDATE SENTINEL|storageKey|TEST ONLY training/,
      );
      const embedded = JSON.parse(
        html.match(
          /<script id="public-content" type="application\/json">(.*?)<\/script>/s,
        )[1],
      );
      assert.deepEqual(embedded, await publicSnapshot());
      assert.equal((await request("/")).status, 200);
      await writeFile(publicDirectory + "/index.html", html + "tampered");
      try {
        assert.equal((await request("/")).status, 503);
        assert.equal((await request('/api/v1/cms-sync', { token })).body.data.current, false,
          'Synchronization must not report altered HTML as current');
      } finally { await writeFile(publicDirectory + "/index.html", html); }
      const receiptPath = publicDirectory + '/.publication.json';
      const receipt = await readFile(receiptPath);
      await unlink(publicDirectory + '/index.html');
      try {
        assert.equal((await request('/api/v1/cms-sync', { token })).body.data.current, false,
          'Synchronization must not report missing HTML as current');
      } finally { await writeFile(publicDirectory + '/index.html', html); }
      await unlink(receiptPath);
      try {
        assert.equal((await request('/api/v1/cms-sync', { token })).body.data.current, false);
      } finally { await writeFile(receiptPath, receipt); }
      const edited = await request("/api/v1/cms/projects/" + project.id, {
        method: "PATCH",
        token,
        body: {
          expectedUpdatedAt: project.updatedAt,
          data: { summary: "TEST ONLY edited project" },
        },
      });
      assert.equal(edited.status, 200);
      project = edited.body.data;
      assert.equal((await request("/")).status, 503);
      assert.equal((await request("/api/v1/media/" + media.id)).status, 404);
      assert.equal(
        (await request("/api/v1/projects/" + project.slug)).status,
        404,
      );
      const repub = await request(
        "/api/v1/cms/projects/" + project.id + "/publish",
        {
          method: "POST",
          token,
          body: { expectedUpdatedAt: project.updatedAt, confirmed: true },
        },
      );
      assert.equal(repub.status, 200);
      project = repub.body.data;
      assert.equal(
        (await request("/api/v1/projects/" + project.slug)).body.data.summary,
        "TEST ONLY edited project",
      );
      const unpub = await request(
        "/api/v1/cms/projects/" + project.id + "/unpublish",
        {
          method: "POST",
          token,
          body: { expectedUpdatedAt: project.updatedAt },
        },
      );
      assert.equal(unpub.status, 200);
      project = unpub.body.data;
      assert.equal((await request("/api/v1/media/" + media.id)).status, 404);
      assert.equal((await request("/")).status, 503);
    },
  );
  await t.test(
    "settings, media detach/remove, project deletion and safe transactional audit records",
    async () => {
      const setting = await request("/api/v1/cms-settings", {
        method: "PATCH",
        token,
        body: {
          expectedUpdatedAt: null,
          data: {
            siteTitle: "TEST ONLY title",
            description: "TEST ONLY description",
          },
        },
      });
      assert.equal(setting.status, 200);
      assert.equal(
        (
          await request("/api/v1/cms-settings", {
            method: "PATCH",
            token,
            body: {
              expectedUpdatedAt: setting.body.data.updatedAt,
              data: { siteTitle: "TEST ONLY", allowIndexing: true },
            },
          })
        ).status,
        400,
      );
      media = (
        await request("/api/v1/cms-media/" + media.id, {
          method: "PATCH",
          token,
          body: {
            expectedUpdatedAt: media.updatedAt,
            altText: media.altText,
            projectId: null,
          },
        })
      ).body.data;
      assert.equal(
        (
          await request("/api/v1/cms-media/" + media.id, {
            method: "DELETE",
            token,
            body: { expectedUpdatedAt: media.updatedAt },
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request("/api/v1/cms/projects/" + project.id, {
            method: "DELETE",
            token,
            body: { expectedUpdatedAt: project.updatedAt },
          })
        ).status,
        200,
      );
      const events = await db.auditLog.findMany();
      for (const action of [
        "CONTENT_CREATE",
        "CONTENT_UPDATE",
        "CONTENT_PUBLISH",
        "CONTENT_UNPUBLISH",
        "CONTENT_REMOVE",
        "CONTENT_REORDER",
        "MEDIA_UPLOAD",
        "MEDIA_APPROVE",
        "MEDIA_DELETE",
        "MESSAGE_STATUS",
        "MESSAGE_DELETE",
        "PUBLIC_CONTACT_CONSENT",
        "SETTINGS_UPDATE",
      ])
        assert.ok(
          events.some((e) => e.action === action),
          action,
        );
      assert.doesNotMatch(
        JSON.stringify(events),
        new RegExp(
          password + "|PRIVATE_MESSAGE_SENTINEL|private-test@example.invalid",
        ),
      );
      assert.equal(await db.mediaAsset.count(), 0);
      assert.ok(
        requests < 120,
        "Do not bypass the real global limiter in tests: " + requests,
      );
    },
  );
});
