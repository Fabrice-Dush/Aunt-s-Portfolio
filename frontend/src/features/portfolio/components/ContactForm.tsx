import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
export function ContactForm() {
  const started = useRef(Date.now());
  const submitting = useRef(false);
  const operation = useRef<{ fingerprint: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const input = {
      ...values,
      senderName: String(values.senderName ?? "").trim(),
      content: String(values.content ?? "").trim(),
      subject: String(values.subject ?? "").trim() || null,
    };
    const fingerprint = JSON.stringify(input);
    submitting.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (operation.current?.fingerprint !== fingerprint)
        operation.current = { fingerprint, key: crypto.randomUUID() };
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Portfolio-Request": "1",
          "Idempotency-Key": operation.current.key,
        },
        body: JSON.stringify({
          ...input,
          startedAt: started.current,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.data?.received !== true) {
        throw new Error(
          result.error?.message ??
            "Your message could not be saved. Please try again.",
        );
      }
      setMessage(
        "Your message has been received. Thank you for getting in touch.",
      );
      form.reset();
      operation.current = null;
      started.current = Date.now();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Please try again.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="section contact-form-section"
      aria-labelledby="message-title"
    >
      <div className="two-column">
        <div>
          <h2 id="message-title">Start a conversation.</h2>
          <p>
            Your name, email and message are stored privately for Seraphine and
            authorized technical support until removed. Do not include sensitive
            documents or passwords.
          </p>
        </div>
        <form
          className="public-contact-form"
          method="post"
          action="/api/v1/contact"
          onSubmit={submit}
        >
          <noscript>Enable JavaScript to send a message. You can still read and navigate the portfolio.</noscript>
          <fieldset aria-label="Message details" disabled={!enhanced || busy}>
          <label>
            Your name
            <input
              name="senderName"
              autoComplete="name"
              required
              maxLength={150}
            />
          </label>
          <label>
            Email
            <input
              name="senderEmail"
              type="email"
              autoComplete="email"
              required
              maxLength={191}
            />
          </label>
          <label>
            Subject
            <input name="subject" maxLength={200} />
          </label>
          <label>
            Message
            <textarea
              name="content"
              required
              minLength={1}
              maxLength={10000}
              rows={6}
            />
          </label>
          <label className="contact-honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button className="button-primary" disabled={!enhanced || busy}>
            {busy ? "Sending…" : "Send message ↗"}
          </button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
        </form>
      </div>
    </section>
  );
}
