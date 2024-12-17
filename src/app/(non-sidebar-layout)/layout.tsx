"use client";
import React, { ReactNode } from "react";
import AppLayoutSecondary from "@/components/app-layout/app-layout-secondary";

const NonSidebarLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <AppLayoutSecondary>{children}</AppLayoutSecondary>;
};

export default NonSidebarLayout;
