import React from "react";
import PlatformPlaceholderCard from "./PlatformPlaceholderCard";

const YouTubeIntegrationCard: React.FC = () => {
  return (
    <PlatformPlaceholderCard
      name="YouTube"
      iconSrc="/youtube_icon.svg"
      description="Planned: connect your YouTube channel for chat sync, live metrics and automated ingestion."
      comingSoon
    />
  );
};

export default YouTubeIntegrationCard;