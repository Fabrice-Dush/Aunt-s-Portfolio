import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../auth/api";
import { DataState, useData } from "./components";
import { Synchronization, useUnsavedChanges } from "./Cms";
type Settings = {
  siteTitle: string;
  description: string | null;
  allowIndexing: boolean;
  updatedAt: string;
};
export default function Settings() {
  const data = useData<Settings | null>("/cms-settings");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useUnsavedChanges(dirty);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/cms-settings", "PATCH", {
        expectedUpdatedAt: data.result?.data?.updatedAt ?? null,
        data: {
          siteTitle: values.get("siteTitle"),
          description: values.get("description") || null,
        },
      });
      setDirty(false);
      setMessage(
        "Settings saved. Update the public website to apply page metadata.",
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
      {!data.result ? (
        <DataState error={data.error} reload={data.reload} />
      ) : (
        <section className="dash-panel">
          <h2>Portfolio settings</h2>
          <p>
            Page title and description appear in search and social previews
            after the public website is updated. Search indexing remains
            controlled by the approved launch configuration.
          </p>
          <form
            className="cms-form"
            onSubmit={save}
            onChange={() => setDirty(true)}
          >
            <fieldset disabled={busy}>
              <label>
                Page title
                <input
                  name="siteTitle"
                  required
                  maxLength={200}
                  defaultValue={data.result.data?.siteTitle ?? ""}
                />
              </label>
              <label>
                Page description
                <textarea
                  name="description"
                  rows={4}
                  maxLength={500}
                  defaultValue={data.result.data?.description ?? ""}
                />
              </label>
            </fieldset>
            <button className="dash-primary" disabled={busy}>
              {busy ? "Saving…" : "Save settings"}
            </button>
          </form>
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <Synchronization key={data.result?.data?.updatedAt} />
    </>
  );
}
