import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";
import TwitchIntegrationCard from "./TwitchIntegrationCard";
import YouTubeIntegrationCard from "./YouTubeIntegrationCard";
import KickIntegrationCard from "./KickIntegrationCard";

const Integrations: React.FC = () => {
  return (
    <Box className="py-10 pl-10">
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Integrations
      </Typography>
      <Typography variant="body1" className="text-gray-600 pb-5">
        Connect streaming and social platforms to your account. More platforms are on the way.
      </Typography>
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <TwitchIntegrationCard />
        <Divider flexItem />
        <YouTubeIntegrationCard />
        <KickIntegrationCard />
      </Stack>
    </Box>
  );
};

export default Integrations;