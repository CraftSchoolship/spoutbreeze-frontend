"use client";

import React, { useState } from "react";
import axiosInstance from "@/lib/axios";

type Status = "idle" | "sending" | "sent" | "error";

const TalkToFounders: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    if (status === "sent") {
      setName("");
      setEmail("");
      setMessage("");
      setStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please write a few more words so we can help you best.");
      return;
    }
    setError("");
    setStatus("sending");
    try {
      await axiosInstance.post("/api/contact", { name, email, message });
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("We couldn't send your message right now. Please try again in a moment.");
    }
  };

  return (
    <>
      {/* Real mailto anchor so crawlers see an outbound link and no-JS visitors can
          still reach us; JS upgrades it to the contact modal. */}
      <a
        href="mailto:contact@craftschoolship.com"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
      >
        Talk to the founders
      </a>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm transition-all z-10"
            >
              &#10005;
            </button>
            <div className="p-6 sm:p-8">
              {status === "sent" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
                  >
                    &#10003;
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Message sent</h2>
                  <p className="text-sm text-slate-500">
                    Thanks {name || "for reaching out"} — the founders will get back to you at{" "}
                    <strong className="text-teal-600">{email}</strong> shortly.
                  </p>
                  <button
                    onClick={close}
                    className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-1 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
                    >
                      💬
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Talk to the founders</h2>
                    <p className="text-sm text-slate-500 text-center">
                      Questions about pricing, scale, or a migration? Write to us — we read everything.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="contact-name" className="text-xs font-semibold text-slate-600 mb-1 block">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Jane Smith"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="text-xs font-semibold text-slate-600 mb-1 block">
                        Work Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="text-xs font-semibold text-slate-600 mb-1 block">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        placeholder="Tell us about your webinars — audience size, current tooling, what you'd like to improve…"
                        value={message}
                        required
                        rows={4}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                      />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {status === "error" && (
                      <p className="text-xs text-slate-500">
                        Or email us directly at{" "}
                        <a
                          href="mailto:contact@craftschoolship.com"
                          className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
                        >
                          contact@craftschoolship.com
                        </a>
                        .
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1 transition-all disabled:opacity-70"
                      style={{
                        background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
                        boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                      }}
                    >
                      {status === "sending" ? "Sending…" : "Send message"}
                    </button>
                  </form>
                  <p className="text-xs text-slate-400 text-center mt-3">
                    Goes straight to the founders&apos; inbox — no ticket queue.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TalkToFounders;
