"use client";

import { PATH_ROUTER } from "@/constant/router";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function isProfilePage(Component: any) {
  return function IsAuth(props: any) {
    const { id } = useParams();
    const router = useRouter();
    const { address: userAddress } = useAccount();

    useEffect(() => {
      if (id === userAddress) {
        return router.push(PATH_ROUTER.MY_PROFILE);
      }
    }, [id, userAddress, router]);

    if (id === userAddress) {
      return null;
    }

    return <Component {...props} />;
  };
}
