"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForToken } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

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
    return <div className="p-4 text-red-600">{error}</div>;
  }

  // Centered loading GIF
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <img
        src="/loading_state.gif"
        alt="Loading"
        // className="w-32 h-32"
      />
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-screen">
          <img
            src="/loading_state.gif"
            alt="Loading"
            // className="w-32 h-32"
          />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
