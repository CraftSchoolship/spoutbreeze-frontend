import React from "react";
import PlatformPlaceholderCard from "./PlatformPlaceholderCard";

const KickIntegrationCard: React.FC = () => {
  return (
    <PlatformPlaceholderCard
      name="Kick"
      iconSrc="/kick_icon.svg"
      description="Planned: Kick chat relay & event presence once API/chat stability is finalized."
      comingSoon
    />
  );
};

export default KickIntegrationCard;