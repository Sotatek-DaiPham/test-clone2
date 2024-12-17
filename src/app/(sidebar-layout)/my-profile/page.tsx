"use client";
import AppTabs from "@/components/app-tabs";
import { API_PATH } from "@/constant/api-path";
import isAuth from "@/helpers/isAuth";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import {
  DollarCircleUpIcon,
  FollowersIcon,
  FollowingIcon,
  MyProfileIcon,
  MyRepliesIcon,
  PortfolioIcon,
} from "@public/assets";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CoinCreatedTab from "../_components/Tabs/CoinCreated";
import FollowersTab from "../_components/Tabs/Followers";
import FollowingTab from "../_components/Tabs/Following";
import MyProfileTab from "../_components/Tabs/MyProfileTab";
import MyRepliesTab from "../_components/Tabs/MyReplies";
import PortfolioTab from "../_components/Tabs/PortfolioTab";
import { ETabsMyProfile } from "@/entities/my-profile";

const MyProfilePage = () => {
  const { address: userAddress } = useAccount();
  const { searchParams, setSearchParams } = useAppSearchParams("myProfile");
  const [activeTab, setActiveTab] = useState<string>(ETabsMyProfile.MY_PROFILE);

  const tabs = [
    {
      label: "My Profile",
      key: ETabsMyProfile.MY_PROFILE,
      children: (
        <MyProfileTab apiPath={API_PATH.USER.PROFILE(userAddress as string)} />
      ),
      icon: <Image src={MyProfileIcon} alt="my-profile" />,
    },
    {
      label: "Portfolio",
      key: ETabsMyProfile.PORTFOLIO,
      children: <PortfolioTab walletAddress={userAddress as string} />,
      icon: <Image src={PortfolioIcon} alt="my-portfolio" />,
    },
    {
      label: "Token Created",
      key: ETabsMyProfile.COIN_CREATED,
      children: <CoinCreatedTab walletAddress={userAddress as string} />,
      icon: <Image src={DollarCircleUpIcon} alt="coin-created" />,
    },
    {
      label: "Followers",
      key: ETabsMyProfile.FOLLOWERS,
      children: <FollowersTab walletAddress={userAddress as string} />,
      icon: <Image src={FollowersIcon} alt="followers" />,
    },
    {
      label: "Following",
      key: ETabsMyProfile.FOLLOWING,
      children: <FollowingTab walletAddress={userAddress as string} />,
      icon: <Image src={FollowingIcon} alt="following" />,
    },
    {
      label: "My Replies",
      key: ETabsMyProfile.MY_REPLIES,
      children: <MyRepliesTab />,
      icon: <Image src={MyRepliesIcon} alt="my-replies" />,
    },
  ];

  useEffect(() => {
    switch (searchParams?.tab) {
      case ETabsMyProfile.MY_PROFILE:
        return setActiveTab(ETabsMyProfile.MY_PROFILE);
      case ETabsMyProfile.PORTFOLIO:
        return setActiveTab(ETabsMyProfile.PORTFOLIO);
      case ETabsMyProfile.COIN_CREATED:
        return setActiveTab(ETabsMyProfile.COIN_CREATED);
      case ETabsMyProfile.FOLLOWERS:
        return setActiveTab(ETabsMyProfile.FOLLOWERS);
      case ETabsMyProfile.FOLLOWING:
        return setActiveTab(ETabsMyProfile.FOLLOWING);
      case ETabsMyProfile.MY_REPLIES:
        return setActiveTab(ETabsMyProfile.MY_REPLIES);

      default:
        return;
    }
  }, []);

  const handleChangeTab = (value: any) => {
    setActiveTab(value);
    setSearchParams({
      tab: value,
    });
  };

  return (
    <div className="m-auto max-w-[var(--width-content-sidebar-layout)] h-full">
      <AppTabs
        items={tabs}
        className="app-tabs-primary active-tab-new h-full"
        activeKey={activeTab}
        onChange={handleChangeTab}
        destroyInactiveTabPane={true}
      />
    </div>
  );
};

export default isAuth(MyProfilePage);
