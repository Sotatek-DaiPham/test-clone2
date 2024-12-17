"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import useWalletAuth from "@/hooks/useWalletAuth";

export default function isAuth(Component: any) {
  return function IsAuth(props: any) {
    const { accessToken } = useWalletAuth();

    useEffect(() => {
      if (!accessToken) {
        return redirect("/");
      }
    }, []);

    if (!accessToken) {
      return null;
    }

    return <Component {...props} />;
  };
}
