"use client";
import React, { ReactNode } from "react";
import AppLayoutPrimary from "@/components/app-layout/app-layout-primary";

const SidebarLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <AppLayoutPrimary>{children}</AppLayoutPrimary>;
};

export default SidebarLayout;
