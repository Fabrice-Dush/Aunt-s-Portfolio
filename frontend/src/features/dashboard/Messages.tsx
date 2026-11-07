import { useEffect, useRef, useState } from "react";
import { api } from "../auth/api";
import { Badge, Confirm, DataState, Pager, date, useData } from "./components";
type Message = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export default function Messages() {
  const [page, setPage] = useState(1);
  const data = useData<Message[]>("/cms-messages?page=" + page);
  const [opened, setOpened] = useState<Message | null>(null);
  const openedHeading = useRef<HTMLHeadingElement>(null);
  const messagesHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (opened) openedHeading.current?.focus(); }, [opened?.id]);
  const [remove, setRemove] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function change(row: Message, status: string) {
    setBusy(true);
    setError("");
    try {
      const result = await api<Message | null>(
        "/cms-messages/" + row.id,
        status === "DELETE" ? "DELETE" : "PATCH",
        {
          expectedUpdatedAt: row.updatedAt,
          ...(status === "DELETE" ? {} : { status }),
        },
      );
      setRemove(null);
      setOpened(current => current?.id === row.id ? result.data : current);
      data.reload();
      setMessage(
        status === "DELETE" ? "Message removed." : "Message status updated.",
      );
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <p role="alert" className="dash-feedback error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="dash-feedback">
          {message}
        </p>
      )}
      <section className="dash-panel">
        <h2 ref={messagesHeading} tabIndex={-1}>Your private messages</h2>
        <p>
          Messages received through your portfolio. Access is limited to you and
          authorized technical support.
        </p>
        {!data.result ? (
          <DataState error={data.error} reload={data.reload} />
        ) : !data.result.data.length ? (
          <p className="dash-empty">No messages yet.</p>
        ) : (
          <ul className="dash-record-list">
            {data.result.data.map((row) => (
              <li key={row.id}>
                <div className="dash-row-title">
                  <h3>{row.subject ?? "Message from " + row.senderName}</h3>
                  <Badge value={row.status} />
                </div>
                <p>
                  {row.senderName} · {date(row.createdAt)}
                </p>
                <div className="dash-actions">
                  <button
                    disabled={busy}
                    onClick={() => {
                      setOpened(row);
                      if (row.status === "NEW") void change(row, "READ");
                    }}
                  >
                    View message
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void change(row, row.status === "NEW" ? "READ" : "NEW")
                    }
                  >
                    {row.status === "NEW" ? "Mark as read" : "Mark as unread"}
                  </button>
                  <button
                    disabled={busy || row.status === "ARCHIVED"}
                    onClick={() => void change(row, "ARCHIVED")}
                  >
                    Archive
                  </button>
                  <button disabled={busy} onClick={() => setRemove(row)}>
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
      {opened && (
        <section className="dash-panel cms-preview">
          <h2 ref={openedHeading} tabIndex={-1}>{opened.subject ?? "Message"}</h2>
          <p>
            From {opened.senderName} · {opened.senderEmail}
          </p>
          <p>{opened.content}</p>
          <button onClick={() => { setOpened(null); messagesHeading.current?.focus(); }}>Close message</button>
        </section>
      )}
      {remove && (
        <Confirm
          title="Remove this message?"
          busy={busy}
          onCancel={() => setRemove(null)}
          onConfirm={() => void change(remove, "DELETE")}
        >
          <p>
            This permanently removes the stored message from {remove.senderName}
            .
          </p>
          {error && <p role="alert">{error}</p>}
        </Confirm>
      )}
    </>
  );
}
