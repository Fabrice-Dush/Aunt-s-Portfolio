import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../auth/api";
import { Badge, Confirm, DataState, Pager, useData } from "./components";
import { Synchronization, useUnsavedChanges } from "./Cms";
type Media = {
  id: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  altText: string | null;
  approved: boolean;
  projectId: string | null;
  updatedAt: string;
};
export default function MediaLibrary() {
  const [page, setPage] = useState(1);
  const data = useData<Media[]>("/cms-media?page=" + page);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Media | null>(null);
  const [editDirty, setEditDirty] = useState(false);
  const [uploadDirty, setUploadDirty] = useState(false);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const libraryHeading = useRef<HTMLHeadingElement>(null);
  useUnsavedChanges(editDirty || uploadDirty);
  useEffect(() => { if (edit) editorHeading.current?.focus(); }, [edit?.id]);
  function chooseEdit(row: Media) {
    if (row.id === edit?.id) { editorHeading.current?.focus(); return; }
    if (editDirty && !window.confirm("Discard your unsaved media changes?")) return;
    setEdit(row);
    setEditDirty(false);
    setError("");
  }
  function closeEdit() {
    if (editDirty && !window.confirm("Discard your unsaved media changes?")) return;
    setEdit(null);
    setEditDirty(false);
    libraryHeading.current?.focus();
  }
  const [action, setAction] = useState<{
    row: Media;
    type: "approve" | "revoke" | "delete";
  } | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      const rows: { id: string; title: string }[] = [];
      for (let p = 1; p <= 500; p++) {
        const result = await api<{ id: string; title: string }[]>(
          "/cms/projects?page=" + p,
        );
        rows.push(...result.data);
        if (!result.pagination?.hasMore) break;
      }
      if (active) setProjects(rows);
    })().catch((failure) => {
      if (active) setError(failure.message);
    });
    return () => {
      active = false;
    };
  }, []);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a file to upload.");
      return;
    }
    if (file.size > 8_000_000) {
      setError("Choose a file smaller than 8 MB.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const query = new URLSearchParams({
        fileName: file.name,
        ...(values.get("altText")
          ? { altText: String(values.get("altText")) }
          : {}),
      });
      const send = () =>
        fetch("/api/v1/cms-media?" + query, {
          method: "POST",
          credentials: "same-origin",
          headers: { "X-Portfolio-Request": "1", "Content-Type": file.type },
          body: file,
        });
      let response = await send();
      if (response.status === 401) {
        const denied = await response
          .clone()
          .json()
          .catch(() => ({}));
        if (denied.error?.code === "UNAUTHENTICATED") {
          await api("/auth/me");
          response = await send();
        }
      }
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          failure.error?.code ?? "UPLOAD_FAILED",
          failure.error?.message ?? "Upload failed. Please try again.",
        );
      }
      form.reset();
      setUploadDirty(false);
      setMessage(
        "File uploaded privately. Review it before approving public use.",
      );
      data.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function change() {
    if (!action) return;
    setBusy(true);
    setError("");
    try {
      await api(
        "/cms-media/" +
          action.row.id +
          (action.type === "delete" ? "" : "/" + action.type),
        action.type === "delete" ? "DELETE" : "POST",
        {
          expectedUpdatedAt: action.row.updatedAt,
          ...(action.type === "approve" ? { confirmed: true } : {}),
        },
      );
      setAction(null);
      if (action.type === "delete" && edit?.id === action.row.id) {
        setEdit(null);
        setEditDirty(false);
        libraryHeading.current?.focus();
      }
      setMessage(
        "Media updated. Public files require approval and a published attachment.",
      );
      data.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/cms-media/" + edit.id, "PATCH", {
        expectedUpdatedAt: edit.updatedAt,
        altText: values.get("altText") || null,
        projectId: values.get("projectId") || null,
      });
      setEdit(null);
      setEditDirty(false);
      libraryHeading.current?.focus();
      setMessage(
        "Media details saved. Public approval has been withdrawn; review and approve it again.",
      );
      data.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <p className="dash-feedback error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="dash-feedback" role="status">
          {message}
        </p>
      )}
      <section className="dash-panel">
        <h2>Upload an image or document</h2>
        <p>
          JPEG, PNG, WebP or PDF · Up to 8 MB per file. Describe informative
          images. Files stay private until approved and attached to published
          content.
        </p>
        <form className="cms-form" onSubmit={upload} onChange={() => setUploadDirty(true)}>
          <fieldset disabled={busy}>
            <label>
              Choose a file
              <input
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
              />
            </label>
            <label>
              Image description
              <input name="altText" minLength={3} maxLength={255} />
            </label>
          </fieldset>
          <button className="dash-primary" disabled={busy}>
            {busy ? "Working…" : "Upload file"}
          </button>
        </form>
      </section>
      <section className="dash-panel">
        <h2 ref={libraryHeading} tabIndex={-1}>Your media library</h2>
        {!data.result ? (
          <DataState error={data.error} reload={data.reload} />
        ) : !data.result.data.length ? (
          <p className="dash-empty">
            Your approved portfolio images and documents can begin here.
          </p>
        ) : (
          <ul className="cms-media-grid">
            {data.result.data.map((row) => (
              <li key={row.id}>
                {row.mimeType.startsWith("image/") && (
                  <img
                    src={"/api/v1/cms-media/" + row.id + "/file?size=small"}
                    alt={row.altText ?? ""}
                    loading="lazy"
                  />
                )}
                <h3>{row.fileName}</h3>
                <Badge value={row.approved ? "APPROVED" : "PRIVATE"} />
                <p>
                  {Math.ceil(row.bytes / 1024)} KB ·{" "}
                  {row.mimeType === "application/pdf"
                    ? "PDF document"
                    : "Optimized image"}
                </p>
                <p>{row.altText}</p>
                <div className="dash-actions">
                  <a
                    href={"/api/v1/cms-media/" + row.id + "/file"}
                    target="_blank"
                    rel="noopener"
                  >
                    View file ↗
                  </a>
                  <button disabled={busy} onClick={() => chooseEdit(row)}>
                    Edit / attach
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      setAction({
                        row,
                        type: row.approved ? "revoke" : "approve",
                      })
                    }
                  >
                    {row.approved ? "Withdraw approval" : "Approve public use"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setAction({ row, type: "delete" })}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pager
          page={page}
          hasMore={data.result?.pagination?.hasMore ?? false}
          onPage={setPage}
        />
      </section>
      {edit && (
        <section className="dash-panel" key={edit.id}>
          <h2 ref={editorHeading} tabIndex={-1}>Edit {edit.fileName}</h2>
          <form className="cms-form" onSubmit={save} onChange={() => setEditDirty(true)}>
            <fieldset disabled={busy}>
              <label>
                Image description
                <input
                  name="altText"
                  defaultValue={edit.altText ?? ""}
                  minLength={3}
                  maxLength={255}
                />
              </label>
              <label>
                Attach to project
                <select name="projectId" defaultValue={edit.projectId ?? ""}>
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
            <p>
              Portraits and certificates are attached in their own content
              forms. Upload a replacement, attach the new file, then detach and
              remove the old one.
            </p>
            <div className="dash-actions">
              <button
                type="button"
                disabled={busy}
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button className="dash-primary" disabled={busy}>
                Save media details
              </button>
            </div>
          </form>
        </section>
      )}
      {action && (
        <Confirm
          title={
            action.type === "approve"
              ? "Authorize public use?"
              : action.type === "delete"
                ? "Remove this file?"
                : "Withdraw public approval?"
          }
          busy={busy}
          onCancel={() => setAction(null)}
          onConfirm={() => void change()}
        >
          <p>{action.row.fileName}</p>
          <p>
            {action.type === "approve"
              ? "Confirm that you own or have permission to publish this file, including any portrait likeness and personal information. It becomes public only when attached to published content."
              : action.type === "delete"
                ? "All content must be detached first. Removed files cannot be restored."
                : "Public access stops immediately. Update the public website after this change."}
          </p>
          {error && <p role="alert">{error}</p>}
        </Confirm>
      )}
      <Synchronization
        key={data.result?.data.map((row) => row.updatedAt).join(",")}
      />
    </>
  );
}
