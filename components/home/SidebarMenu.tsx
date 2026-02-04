import Image from "next/image";
import React, { JSX } from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  component: JSX.Element;
}

interface SidebarMenuProps {
  menuItems: MenuItem[];
  activeKey: string;
  onMenuItemClick: (key: string) => void;
}

const SideBar: React.FC<SidebarMenuProps> = ({
  menuItems,
  activeKey,
  onMenuItemClick,
}) => {
  return (
    <div className="flex flex-row sm:flex-col bg-white rounded-[10px] overflow-x-auto sm:overflow-visible">
      {menuItems.map((item, index) => (
        <button
          key={item.key}
          className={`
            flex items-center py-2 px-3 sm:py-[15px] sm:pl-[15px] cursor-pointer
            whitespace-nowrap
            ${activeKey === item.key ? "bg-[#2686BE]/10" : ""}
            ${index === 0 ? "rounded-l-[10px] sm:rounded-t-[10px]" : ""}
            ${index === menuItems.length - 1 ? "rounded-r-[10px] sm:rounded-b-[10px]" : ""}
          `}
          onClick={() => onMenuItemClick(item.key)}
        >
          <Image
            src={item.icon}
            alt={item.label}
            width={12}
            height={12}
            className="w-5 h-5 mr-2 sm:w-6 sm:h-6"
          />
          <span className="text-[#262262] text-[12px] sm:text-[13px] font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SideBar;
