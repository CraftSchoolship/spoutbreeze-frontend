"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { exchangeCodeForToken } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Authentication failed. " + (errorParam || "Please try again."));
      return;
    }

    if (code && typeof code === "string") {
      exchangeCodeForToken(code)
        .then(() => {
          router.push("/home"); // Redirect to your app's main page
        })
        .catch((err) => {
          console.error(err);
          setError("Authentication failed. Please try again.");
        });
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-72px)] w-full bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />

        <div className="glass-effect p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full mx-4 text-center border border-white/50 relative z-10">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Failed</h2>

          <p className="text-slate-600 mb-8">
            {error}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-sky-500/25 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transform hover:-translate-y-0.5"
            >
              Return to Home
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-slate-600 font-semibold text-sm transition-all duration-200 hover:bg-slate-50 border border-transparent hover:border-slate-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Centered loading GIF
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <Image
        src="/bluescale_animated.gif"
        alt="Loading"
        width={100}
        height={100}
        unoptimized
      />
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-screen">
          <Image
            src="/bluescale_animated.gif"
            alt="Loading"
            width={100}
            height={100}
            unoptimized
          />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
