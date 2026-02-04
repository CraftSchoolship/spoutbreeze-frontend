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
    <div className="flex flex-row sm:flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto sm:overflow-visible">
      {menuItems.map((item, index) => (
        <button
          key={item.key}
          className={`
            flex items-center py-3 px-4 sm:py-4 sm:px-5 cursor-pointer
            whitespace-nowrap transition-all duration-200
            ${activeKey === item.key 
              ? "bg-gradient-to-r from-sky-50 to-teal-50 border-l-0 sm:border-l-4 border-b-4 sm:border-b-0 border-sky-500" 
              : "hover:bg-slate-50"
            }
            ${index === 0 ? "rounded-l-2xl sm:rounded-t-2xl sm:rounded-bl-none" : ""}
            ${index === menuItems.length - 1 ? "rounded-r-2xl sm:rounded-b-2xl sm:rounded-tr-none" : ""}
          `}
          onClick={() => onMenuItemClick(item.key)}
        >
          <Image
            src={item.icon}
            alt={item.label}
            width={12}
            height={12}
            className={`w-5 h-5 mr-3 sm:w-5 sm:h-5 transition-all duration-200 ${
              activeKey === item.key ? "opacity-100" : "opacity-60"
            }`}
          />
          <span className={`text-sm font-medium transition-colors duration-200 ${
            activeKey === item.key ? "text-slate-800" : "text-slate-500"
          }`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SideBar;
