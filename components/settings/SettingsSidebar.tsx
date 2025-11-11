/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { PageItem } from "../common/PageLayout";

interface SettingsSidebarProps {
  items: PageItem[];
  activeKey: string;
  onItemClick: (key: string) => void;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#2686BE",
    width: 3,
    left: 0,
  },
  "& .MuiTabs-flexContainer": {
    alignItems: "flex-start",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  minWidth: 0,
  width: "100%",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  padding: "15px",

  color: "black",
  "&.Mui-selected": {
    color: "#262262",
    "& .tab-content": {
      transform: "translateX(4px)",
      color: "#262262",
    },
    "& img": {
      filter: "brightness(0) saturate(100%) invert(19%) sepia(19%) saturate(2048%) hue-rotate(209deg) brightness(95%) contrast(93%)",
    },
  },
  "&:hover": {
    backgroundColor: "rgba(38, 134, 190, 0.05)",
  },
  "& .tab-content": {
    transition: "transform 0.2s ease-in-out",
  },
}));

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  items,
  activeKey,
  onItemClick,
}) => {
  const activeIndex = items.findIndex((item) => item.key === activeKey);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    onItemClick(items[newValue].key);
  };

  return (
    <Box className="bg-white rounded-[10px] overflow-hidden">
      {/* Settings Header */}
      <Box className="">
        <h2
          className="font-medium text-[16px] px-[15px] py-[15px]"          
        >
          Settings
        </h2>
      </Box>

      {/* Tabs */}
      <StyledTabs
        orientation="vertical"
        variant="fullWidth"
        value={activeIndex}
        onChange={handleChange}
        sx={{ height: "100%" }}
      >
        {items.map((item, index) => (
          <StyledTab
            key={item.key}
            label={
              <Box className="flex items-center w-full tab-content h-full">
                {item.icon && (
                  typeof item.icon === "string" ? (
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={16}
                      height={16}
                      className="w-4 h-4 mr-3 transition-all duration-200"
                    />
                  ) : (
                    <Box
                      className="mr-3 flex items-center justify-center"
                      sx={{ width: 16, height: 16 }}
                    >
                      {item.icon}
                    </Box>
                  )
                )}
                <span className="text-[15px] font-medium">{item.label}</span>
              </Box>
            }
            sx={{
              borderRadius: index === items.length - 1 ? "0 0 10px 10px" : "0",
            }}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};

export default SettingsSidebar;