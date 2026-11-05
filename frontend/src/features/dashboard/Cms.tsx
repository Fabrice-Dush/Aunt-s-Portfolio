import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../auth/api";
import { Badge, Confirm, DataState, Pager, useData } from "./components";
import { fields, sectionLabels } from "./cmsFields";
import type { Field } from "./cmsFields";
import { collectionOrder } from "./order";
export type Row = {
  id: string;
  updatedAt: string;
  status: string;
  [key: string]: unknown;
};
type Option = {
  id: string;
  fileName?: string;
  title?: string;
  mimeType?: string;
  approved?: boolean;
};
export const rowTitle = (row: Row) =>
  String(
    row.fullName ??
      row.jobTitle ??
      row.qualification ??
      row.name ??
      row.title ??
      row.subject ??
      "Message",
  );
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const navigate = (event: Event) => {
      if (!window.confirm("Leave this page and discard your unsaved changes?"))
        event.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    window.addEventListener("portfolio-before-navigate", navigate);
    return () => {
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("portfolio-before-navigate", navigate);
    };
  }, [dirty]);
}
export function Cms({ section }: { section: string }) {
  const [page, setPage] = useState(1);
  const data = useData<Row[]>("/cms/" + section + "?page=" + page);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [preview, setPreview] = useState<Row | null>(null);
  const [confirmation, setConfirmation] = useState<{
    action: string;
    row: Row;
  } | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function act() {
    if (!confirmation) return;
    setBusy(true);
    setError("");
    const { action, row } = confirmation;
    try {
      await api(
        "/cms/" +
          section +
          "/" +
          row.id +
          (action === "remove" ? "" : "/" + action),
        action === "remove" ? "DELETE" : "POST",
        {
          expectedUpdatedAt: row.updatedAt,
          ...(action === "publish"
            ? { confirmed: true, contactConsent: consent }
            : {}),
        },
      );
      setConfirmation(null);
      setMessage(
        action === "publish"
          ? "Publication saved. Update the public website below to show your changes."
          : "Saved. Update the public website below to refresh its pages.",
      );
      data.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function showPreview(row: Row) {
    setError("");
    try {
      setPreview(
        (await api<Row>("/cms/" + section + "/" + row.id + "/preview")).data,
      );
    } catch (failure) {
      setError((failure as Error).message);
    }
  }
  async function move(row: Row, direction: -1 | 1) {
    const rows = data.result?.data ?? [];
    const index = rows.findIndex((r) => r.id === row.id);
    const other = rows[index + direction];
    if (!other) return;
    setBusy(true);
    setError("");
    try {
      const items = await collectionOrder(row, other, (orderPage) =>
        api<Row[]>("/cms/" + section + "?page=" + orderPage),
      );
      await api("/cms/" + section + "/reorder", "POST", {
        items,
      });
      data.reload();
      setMessage("Display order saved. Update the public website below.");
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {message && (
        <p className="dash-feedback" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="dash-feedback error" role="alert">
          {error}
        </p>
      )}
      {editing ? (
        <Editor
          section={section}
          row={editing === "new" ? null : editing}
          onCancel={() => { setEditing(null); data.reload(); }}
          onSaved={() => {
            setEditing(null);
            setMessage("Draft saved privately. Review it before publishing.");
            data.reload();
          }}
        />
      ) : (
        <section className="dash-panel">
          <div className="dash-row-title">
            <div>
              <p className="dash-eyebrow">YOUR PORTFOLIO</p>
              <h2>
                {section === "profile"
                  ? "Your introduction"
                  : "Manage your " + sectionLabels[section] + " records"}
              </h2>
            </div>
            {(section !== "profile" || data.result?.data.length === 0) && (
              <button
                className="dash-primary"
                onClick={() => {
                  setError("");
                  setEditing("new");
                }}
              >
                Add {sectionLabels[section]}
              </button>
            )}
          </div>
          <p>
            Save changes as a draft, preview, then publish when you are ready.
            Saving an edit withdraws the current public version until you
            publish it again.
          </p>
          {!data.result ? (
            <DataState error={data.error} reload={data.reload} />
          ) : !data.result.data.length ? (
            <div className="dash-empty">
              <h3>A little room for what comes next.</h3>
              <p>Add only confirmed information. Drafts stay private.</p>
            </div>
          ) : (
            <ul className="dash-record-list">
              {data.result.data.map((row, index) => (
                <li key={row.id}>
                  <div className="dash-row-title">
                    <h3>{rowTitle(row)}</h3>
                    <Badge value={row.status} />
                  </div>
                  <p>
                    {String(
                      row.organization ??
                        row.institution ??
                        row.category ??
                        row.issuer ??
                        "",
                    )}
                  </p>
                  {row.isVerified === false && (
                    <p className="dash-verification">
                      Details awaiting verification
                    </p>
                  )}
                  <div className="dash-actions">
                    <button
                      onClick={() => {
                        setError("");
                        setEditing(row);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => void showPreview(row)}>
                      Preview
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setConsent(false);
                        setConfirmation({
                          action:
                            row.status === "PUBLISHED"
                              ? "unpublish"
                              : "publish",
                          row,
                        });
                      }}
                    >
                      {" "}
                      {row.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    {section !== "profile" && (
                      <>
                        <button
                          disabled={busy || index === 0}
                          aria-label={"Move " + rowTitle(row) + " up"}
                          onClick={() => void move(row, -1)}
                        >
                          ↑
                        </button>
                        <button
                          disabled={
                            busy || index === data.result!.data.length - 1
                          }
                          aria-label={"Move " + rowTitle(row) + " down"}
                          onClick={() => void move(row, 1)}
                        >
                          ↓
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            setConfirmation({ action: "remove", row })
                          }
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {section !== "profile" && (
            <Pager
              page={page}
              hasMore={data.result?.pagination?.hasMore ?? false}
              onPage={setPage}
            />
          )}
        </section>
      )}
      {preview && (
        <Confirm
          title={"Preview: " + rowTitle(preview)}
          busy={false}
          onCancel={() => setPreview(null)}
          onConfirm={() => setPreview(null)}
        >
          <p className="dash-muted">
            Private draft preview · Only signed-in administrators can see this.
          </p>
          <div className="cms-preview">
            {fields[section]!.filter(
              (f) =>
                !["checkbox", "media", "project"].includes(f.type ?? "") &&
                preview[f.name] != null &&
                preview[f.name] !== "",
            ).map((f) => (
              <div key={f.name}>
                <h3>{f.label}</h3>
                <p>{String(preview[f.name])}</p>
              </div>
            ))}
          </div>
          <PreviewMedia row={preview} section={section} />
        </Confirm>
      )}
      {confirmation && (
        <Confirm
          title={
            confirmation.action === "publish"
              ? "Publish this content?"
              : confirmation.action === "unpublish"
                ? "Unpublish this content?"
                : "Remove this record?"
          }
          busy={busy}
          onCancel={() => {
            setConfirmation(null);
            setError("");
          }}
          onConfirm={() => void act()}
        >
          <p>{rowTitle(confirmation.row)}</p>
          <p>
            {confirmation.action === "publish"
              ? "Confirm that the content is accurate, authorized for public use, and attached media is approved. Choose Update public website afterwards to show your changes."
              : "This withdraws the content immediately. The public website may be temporarily unavailable until you update it."}
          </p>
          {confirmation.action === "publish" && section === "profile" && (
            <label className="cms-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I explicitly authorize public display of the saved email and
              phone.
            </label>
          )}
          {error && <p role="alert">{error}</p>}
        </Confirm>
      )}
      <Synchronization
        key={data.result?.data.map((row) => row.updatedAt).join(",")}
      />
    </>
  );
}
function PreviewMedia({ row, section }: { row: Row; section: string }) {
  const [media, setMedia] = useState<Option[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!["projects", "profile", "certifications"].includes(section)) return;
    void (async () => {
      const rows: Option[] = [];
      for (let page = 1; page <= 500; page++) {
        const result = await api<(Option & { projectId: string | null })[]>(
          "/cms-media?page=" + page,
        );
        rows.push(
          ...result.data.filter((item) =>
            section === "projects"
              ? item.projectId === row.id
              : item.id === (row.portraitId ?? row.mediaId),
          ),
        );
        if (!result.pagination?.hasMore) break;
      }
      if (active) setMedia(rows);
    })().catch((failure) => {
      if (active) setError(failure.message);
    });
    return () => {
      active = false;
    };
  }, [row, section]);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {media.map((item) => (
        <div key={item.id}>
          {item.mimeType?.startsWith("image/") && (
            <img
              className="cms-preview-image"
              src={"/api/v1/cms-media/" + item.id + "/file?size=small"}
              alt={item.fileName ?? "Attached image"}
            />
          )}
          <p>
            <a
              href={"/api/v1/cms-media/" + item.id + "/file"}
              target="_blank"
              rel="noopener"
            >
              View {item.fileName} ↗
            </a>
          </p>
        </div>
      ))}
    </>
  );
}
export function Editor({
  section,
  row,
  onCancel,
  onSaved,
}: {
  section: string;
  row: Row | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [operation] = useState(() => crypto.randomUUID());
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      fields[section]!.map((f) => [
        f.name,
        row?.[f.name] ??
          (f.type === "checkbox"
            ? false
            : f.name === "sortOrder"
              ? 0
              : section === "profile" && f.name === "fullName"
                ? "Nyirarukundo Seraphine"
                : section === "profile" && f.name === "professionalTitle"
                  ? "Water Treatment Plant Engineer"
                  : ""),
      ]),
    ),
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [optionError, setOptionError] = useState("");
  useUnsavedChanges(dirty);
  useEffect(() => {
    let active = true;
    const load = async (type: string) => {
      const rows: Option[] = [];
      for (let page = 1; page <= 500; page++) {
        const result = await api<Option[]>(
          (type === "media" ? "/cms-media" : "/cms/projects") + "?page=" + page,
        );
        rows.push(...result.data);
        if (!result.pagination?.hasMore) break;
      }
      if (active) setOptions((v) => ({ ...v, [type]: rows }));
    };
    for (const type of new Set(
      fields[section]!.map((f) => f.type).filter(
        (t) => t === "media" || t === "project",
      ),
    ))
      void load(type!).catch((failure) => {
        if (active) setOptionError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [section]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const input = Object.fromEntries(
      fields[section]!.map((f) => {
        const value = values[f.name];
        return [
          f.name,
          f.type === "checkbox"
            ? Boolean(value)
            : f.type === "number"
              ? value === ""
                ? null
                : Number(value)
              : value === "" && !f.required
                ? null
                : value,
        ];
      }),
    );
    try {
      await api(
        "/cms/" + section + (row ? "/" + row.id : ""),
        row ? "PATCH" : "POST",
        row ? { expectedUpdatedAt: row.updatedAt, data: input } : input,
        true,
        { "Idempotency-Key": operation },
      );
      setDirty(false);
      onSaved();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function renderField(f: Field) {
    const id = "cms-" + f.name;
    const value = values[f.name];
    const change = (v: unknown) => {
      setValues((s) => ({ ...s, [f.name]: v }));
      setDirty(true);
    };
    return (
      <label
        key={f.name}
        htmlFor={id}
        className={f.type === "checkbox" ? "cms-check" : ""}
      >
        {f.type !== "checkbox" && f.label}
        {f.type === "checkbox" ? (
          <>
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => change(e.target.checked)}
            />
            {f.label}
          </>
        ) : f.type === "textarea" ? (
          <textarea
            id={id}
            rows={5}
            maxLength={f.max}
            value={String(value ?? "")}
            onChange={(e) => change(e.target.value)}
          />
        ) : f.type === "media" || f.type === "project" ? (
          <select
            id={id}
            value={String(value ?? "")}
            onChange={(e) => change(e.target.value)}
          >
            <option value="">None</option>
            {options[f.type]
              ?.filter(
                (o) =>
                  f.name !== "portraitId" || o.mimeType?.startsWith("image/"),
              )
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fileName ?? o.title}
                  {f.type === "media" && !o.approved
                    ? " · awaiting approval"
                    : ""}
                </option>
              ))}
          </select>
        ) : (
          <input
            id={id}
            type={f.type ?? "text"}
            required={f.required}
            maxLength={f.max}
            min={
              f.name === "sortOrder"
                ? 0
                : f.type === "number"
                  ? 1900
                  : undefined
            }
            max={
              f.name === "sortOrder"
                ? 10000
                : f.type === "number"
                  ? 2100
                  : undefined
            }
            step={f.type === "number" ? 1 : undefined}
            pattern={f.name === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined}
            readOnly={
              (!!row && f.name === "slug") ||
              (section === "profile" &&
                ["fullName", "professionalTitle"].includes(f.name))
            }
            value={String(value ?? "")}
            onChange={(e) => change(e.target.value)}
          />
        )}
      </label>
    );
  }
  return (
    <section className="dash-panel">
      <h2>
        {row ? "Edit " : "Add "}
        {sectionLabels[section]}
      </h2>
      <p>
        Leave unknown years empty. Text is displayed as plain text. Saving keeps
        this record private until you publish it.
      </p>
      {section === "projects" && (
        <p>
          Project addresses stay fixed after creation. Attach project images
          through the Media Library.
        </p>
      )}
      <form className="cms-form" onSubmit={save}>
        <fieldset disabled={busy}>{fields[section]!.map(renderField)}</fieldset>
        {optionError && (
          <p role="alert">Related files could not be loaded: {optionError}</p>
        )}
        {error && (
          <p role="alert" className="dash-feedback error">
            {error}
          </p>
        )}
        <div className="dash-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!dirty || window.confirm("Discard your unsaved changes?"))
                onCancel();
            }}
          >
            Cancel
          </button>
          <button className="dash-primary" disabled={busy}>
            {busy ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </section>
  );
}
type Sync = {
  current: boolean;
  build: { state: string; finishedAt?: string };
  website: string;
  productionAutomation: string;
};
export function Synchronization() {
  const data = useData<Sync>("/cms-sync");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data.result?.data.build.state !== "Building") return;
    const timer = setTimeout(data.reload, 2500);
    return () => clearTimeout(timer);
  }, [data.result]);
  async function rebuild() {
    setBusy(true);
    setError("");
    try {
      await api("/cms-sync", "POST", {});
      data.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="dash-panel cms-sync">
      <h2>Public website</h2>
      <p>
        Publishing saves your approved changes. Update the public website to make
        its saved pages and search information current.
      </p>
      {data.result ? (
        <>
          <p>
            <strong>
              {data.result.data.current
                ? "Your public website is up to date."
                : "Your public website needs an update."}
            </strong>
          </p>
          <p>
            {data.result.data.build.state === "Building"
              ? "Updating the website…"
              : data.result.data.build.state.startsWith("Build failed")
                ? "The website update failed. Please try again or ask your maintainer for help."
                : data.result.data.build.finishedAt
                  ? "Last update attempt: " + new Date(data.result.data.build.finishedAt).toLocaleString()
                  : ""}
          </p>
        </>
      ) : (
        <DataState error={data.error} reload={data.reload} />
      )}
      <div className="dash-actions">
        <button
          onClick={() => void rebuild()}
          disabled={busy || data.result?.data.build.state === "Building"}
        >
          Update public website
        </button>
        <button onClick={data.reload}>Check status</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
