import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";
import TwitchIntegrationCard from "./TwitchIntegrationCard";
import YouTubeIntegrationCard from "./YouTubeIntegrationCard";
import KickIntegrationCard from "./KickIntegrationCard";
import FacebookIntegrationCard from "./FacebookIntegrationCard";

const Integrations: React.FC = () => {
  return (
    <Box className="py-10 pl-10">
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Integrations
      </Typography>
      <Typography variant="body1" className="text-gray-600 pb-5">
        Connect streaming and social platforms to your account.
        <strong className="ml-1 font-semibold">
          Twitch chat integration has no practical API usage limits,
        </strong>
        <span className="ml-1">while</span>
        <strong className="ml-1 font-semibold">
          YouTube chat uses a daily API quota
        </strong>
        (see YouTube&apos;s
        <a
          href="https://developers.google.com/youtube/v3/determine_quota_cost"
          target="_blank"
          rel="noreferrer"
          className="mx-1 text-[#27AAFF] underline"
        >
          quota cost
        </a>
        and
        <a
          href="https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits"
          target="_blank"
          rel="noreferrer"
          className="mx-1 text-[#27AAFF] underline"
        >
          quota &amp; compliance
        </a>
        guides).
      </Typography>
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <TwitchIntegrationCard />
        <Divider flexItem />
        <YouTubeIntegrationCard />
        <Divider flexItem />
        <FacebookIntegrationCard />
        <Divider flexItem />
        <KickIntegrationCard />
      </Stack>
    </Box>
  );
};

export default Integrations;