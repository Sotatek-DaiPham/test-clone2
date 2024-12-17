"use client";
import { TokenDetailProvider } from "@/context/TokenDetailContext";
import React, { ReactNode } from "react";

const TokenDetailLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <TokenDetailProvider>{children}</TokenDetailProvider>;
};

export default TokenDetailLayout;
