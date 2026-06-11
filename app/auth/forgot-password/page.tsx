"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { sendResetPasswordEmail } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendResetPasswordEmail(email);
      // Always report success — don't reveal whether the email is registered.
      setSent(true);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        // Treat other errors as success to avoid account enumeration.
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] w-full bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />

      <div className="glass-effect p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-white/50 relative z-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Reset your password</h1>

        {sent ? (
          <>
            <p className="text-slate-500 mb-6">
              If an account exists for <span className="font-medium text-slate-700">{email}</span>,
              we&apos;ve sent a link to reset your password. Check your inbox.
            </p>
            <Link
              href="/auth/signin"
              className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="text-slate-500 mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remember your password?{" "}
              <Link href="/auth/signin" className="text-sky-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
