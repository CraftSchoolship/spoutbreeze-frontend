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

const StyledTabs = styled(Tabs)(() => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#0ea5e9",
    width: 3,
    left: 0,
    borderRadius: "0 4px 4px 0",
  },
  "& .MuiTabs-flexContainer": {
    alignItems: "flex-start",
  },
}));

const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
  minWidth: 0,
  width: "100%",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  padding: "16px 20px",
  color: "#64748b",
  "&.Mui-selected": {
    color: "#0f172a",
    backgroundColor: "rgba(14, 165, 233, 0.04)",
    "& .tab-content": {
      transform: "translateX(4px)",
    },
    "& img": {
      filter: "brightness(0) saturate(100%) invert(53%) sepia(93%) saturate(1352%) hue-rotate(166deg) brightness(97%) contrast(92%)",
    },
    "& .MuiSvgIcon-root": {
      color: "#0ea5e9",
    },
  },
  "&:hover": {
    backgroundColor: "rgba(14, 165, 233, 0.04)",
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
    <Box className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <Box className="border-b border-slate-100">
        <h2 className="font-semibold text-lg px-5 py-4 text-slate-800">
          Settings
        </h2>
      </Box>

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
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px] mr-3 transition-all duration-200 opacity-60"
                    />
                  ) : (
                    <Box
                      className="mr-3 flex items-center justify-center text-slate-400"
                      sx={{ width: 18, height: 18 }}
                    >
                      {item.icon}
                    </Box>
                  )
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </Box>
            }
            sx={{
              borderRadius: index === items.length - 1 ? "0 0 16px 16px" : "0",
            }}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};

export default SettingsSidebar;
