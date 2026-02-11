"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
