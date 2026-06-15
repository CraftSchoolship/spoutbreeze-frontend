"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  applyEmailActionCode,
  confirmReset,
  verifyResetCode,
} from "@/lib/auth";

const friendlyError = (err: unknown): string => {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/expired-action-code":
        return "This link has expired. Request a new one.";
      case "auth/invalid-action-code":
        return "This link is invalid or has already been used. Request a new one.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-[calc(100vh-72px)] w-full bg-slate-50 relative overflow-hidden">
    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />
    <div className="glass-effect p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-white/50 relative z-10">
      {children}
    </div>
  </div>
);

function ResetPassword({ oobCode }: { oobCode: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "ready" | "done" | "error">("verifying");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyResetCode(oobCode)
      .then((mail) => {
        setEmail(mail);
        setStatus("ready");
      })
      .catch((err) => {
        setError(friendlyError(err));
        setStatus("error");
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await confirmReset(oobCode, password);
      setStatus("done");
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch (err) {
      setError(friendlyError(err));
      setSubmitting(false);
    }
  };

  if (status === "verifying") {
    return <p className="text-slate-500 text-center">Verifying your link…</p>;
  }

  if (status === "error") {
    return (
      <>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Link problem</h1>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link
          href="/auth/forgot-password"
          className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
        >
          Request a new link
        </Link>
      </>
    );
  }

  if (status === "done") {
    return (
      <>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Password updated</h1>
        <p className="text-slate-500 mb-6">
          You can now sign in with your new password. Redirecting…
        </p>
        <Link
          href="/auth/signin"
          className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
        >
          Go to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Choose a new password</h1>
      {email && <p className="text-slate-500 mb-6">for {email}</p>}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Re-enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

function VerifyEmail({ oobCode }: { oobCode: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyEmailActionCode(oobCode)
      .then(() => {
        setStatus("done");
        // Onboarding is the next step after sign-up. If this tab still has the
        // session (same browser as sign-up), it lands there directly; if not,
        // the middleware bounces to sign-in and then on to onboarding.
        setTimeout(() => router.push("/onboarding"), 2000);
      })
      .catch((err) => {
        setError(friendlyError(err));
        setStatus("error");
      });
  }, [oobCode, router]);

  if (status === "working") {
    return <p className="text-slate-500 text-center">Confirming…</p>;
  }
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {status === "done" ? "Email verified" : "Verification failed"}
      </h1>
      <p className="text-slate-500 mb-6">
        {status === "done"
          ? "Your email address has been confirmed. Taking you to onboarding…"
          : error}
      </p>
      <Link
        href={status === "done" ? "/onboarding" : "/auth/signin"}
        className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
      >
        {status === "done" ? "Continue" : "Go to sign in"}
      </Link>
    </>
  );
}

function ActionContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  if (!oobCode) {
    return (
      <>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid link</h1>
        <p className="text-slate-500 mb-6">This link is missing required information.</p>
        <Link
          href="/auth/signin"
          className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
        >
          Go to sign in
        </Link>
      </>
    );
  }

  switch (mode) {
    case "resetPassword":
      return <ResetPassword oobCode={oobCode} />;
    case "verifyEmail":
    case "recoverEmail":
      return <VerifyEmail oobCode={oobCode} />;
    default:
      return (
        <>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Unsupported action</h1>
          <p className="text-slate-500 mb-6">This action link isn&apos;t supported.</p>
          <Link
            href="/auth/signin"
            className="block w-full text-center rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition"
          >
            Go to sign in
          </Link>
        </>
      );
  }
}

export default function AuthActionPage() {
  return (
    <Shell>
      <Suspense fallback={<p className="text-slate-500 text-center">Loading…</p>}>
        <ActionContent />
      </Suspense>
    </Shell>
  );
}
