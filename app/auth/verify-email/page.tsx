"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUserEmail,
  reloadEmailVerified,
  sendVerificationEmail,
} from "@/lib/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goOnboarding = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    router.push("/onboarding");
  }, [router]);

  const checkVerified = useCallback(async () => {
    const verified = await reloadEmailVerified();
    if (verified) goOnboarding();
    return verified;
  }, [goOnboarding]);

  useEffect(() => {
    setEmail(getCurrentUserEmail());
    // Poll Firebase for verification; once verified, forward to onboarding.
    pollRef.current = setInterval(checkVerified, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkVerified]);

  const handleManualCheck = async () => {
    setChecking(true);
    const verified = await checkVerified();
    if (!verified) setChecking(false);
  };

  const handleResend = async () => {
    await sendVerificationEmail();
    setResentAt(Date.now());
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] w-full bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />

      <div className="glass-effect p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-white/50 relative z-10 text-center">
        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify your email</h1>
        <p className="text-slate-500 mb-6">
          We sent a verification link to{" "}
          <span className="font-medium text-slate-700">{email ?? "your inbox"}</span>.
          Open it to confirm your address — this page will continue automatically.
        </p>

        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="w-full rounded-lg bg-sky-500 text-white font-medium py-2.5 hover:bg-sky-600 transition disabled:opacity-60"
        >
          {checking ? "Checking…" : "I've verified — continue"}
        </button>

        <div className="mt-4 text-sm text-slate-500">
          Didn&apos;t get it?{" "}
          <button onClick={handleResend} className="text-sky-600 font-medium hover:underline">
            Resend email
          </button>
          {resentAt && <span className="block mt-1 text-emerald-600">Sent — check your inbox.</span>}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Wrong account?{" "}
          <Link href="/auth/signin" className="text-sky-600 hover:underline">
            Sign in with a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
