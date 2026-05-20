import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

import OnboardingPage from "@/components/onboarding/OnboardingPage";

// OnboardingPage calls useSearchParams() to read the optional ?code=
// invite param. Next.js 15 requires that to live inside a Suspense
// boundary so the build can prerender the surrounding shell.
export default function OnboardingRoute() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={28} />
        </Box>
      }
    >
      <OnboardingPage />
    </Suspense>
  );
}
