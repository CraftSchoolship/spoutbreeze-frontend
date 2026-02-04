import React from "react";
import PlatformPlaceholderCard from "./PlatformPlaceholderCard";

const FacebookIntegrationCard: React.FC = () => {
  return (
    <PlatformPlaceholderCard
      name="Facebook"
      iconSrc="/facebook_icon.svg"
      description="Planned: Facebook Live streaming & chat relay once API integration is available."
      comingSoon
    />
  );
};

export default FacebookIntegrationCard;
