"use client";

import React, { useEffect, useState, Suspense } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ContentDisplay from "../home/ContentDisplay";
import { useRouter, useSearchParams } from "next/navigation";

export interface PageItem {
  key: string;
  label: string;
  icon?: string | React.ReactNode;
  component: React.ReactElement;
}

interface PageLayoutProps {
  items: PageItem[];
  defaultSection: string;
  sectionParam?: string;
  sidebarComponent: React.ComponentType<{
    items: PageItem[];
    activeKey: string;
    onItemClick: (key: string) => void;
  }>;
  className?: string;
}

function PageLayoutContent({
  items,
  defaultSection,
  sectionParam = "section",
  sidebarComponent: SidebarComponent,
  className = "gradient-bg min-h-[calc(100vh-72px)] pb-10",
}: PageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const section = searchParams.get(sectionParam) || defaultSection;
  const isValidSection = items.some((item) => item.key === section);
  const activeSection = isValidSection ? section : defaultSection;

  const [activeComponent, setActiveComponent] = useState(activeSection);

  useEffect(() => {
    if (isValidSection) {
      setActiveComponent(section);
    } else if (section !== defaultSection) {
      router.replace(`?${sectionParam}=${defaultSection}`);
    }
  }, [section, isValidSection, router, defaultSection, sectionParam]);

  const handleItemClick = (key: string) => {
    setActiveComponent(key);
    router.push(`?${sectionParam}=${key}`);
  };

  const currentComponent = items.find(
    (item) => item.key === activeComponent
  )?.component;

  return (
    <section className={className}>
      <Box
        sx={{ flexGrow: 1 }}
        className="px-4 pt-6 sm:px-8 sm:pt-8 lg:px-24 lg:pt-10"
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
            <SidebarComponent
              items={items}
              activeKey={activeComponent}
              onItemClick={handleItemClick}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            <Box className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full mt-4 md:mt-0">
              <ContentDisplay component={currentComponent} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </section>
  );
}

const PageLayout: React.FC<PageLayoutProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PageLayoutContent {...props} />
    </Suspense>
  );
};

export default PageLayout;
