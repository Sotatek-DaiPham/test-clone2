"use client";
import { envs } from "@/constant/envs";
import { PATH_ROUTER } from "@/constant/router";
import useWalletAuth from "@/hooks/useWalletAuth";
import {
  BrowseIcon,
  CoinsIcon,
  DiscordIcon,
  LeaderboardIcon,
  NotificationsIcon,
  ProfileIcon,
  RainboostIcon,
  RainDropIcon,
  RainLaunchIcon,
  XIcon,
} from "@public/assets";
import { Menu, MenuProps } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import "./styles.scss";

type MenuItem = Required<MenuProps>["items"][number];

interface AppMenuProps {
  className?: string;
}
export default function AppMenu({ className }: AppMenuProps) {
  const { accessToken } = useWalletAuth();
  // const selectedSegment = useSelectedLayoutSegment();
  const pathname = usePathname();
  const router = useRouter();
  // Split the pathname to get segments
  const segments = pathname.split(" ").filter(Boolean);
  const selectedSegment = segments.length > 0 ? segments[0] : "";

  const items: MenuItem[] = [
    {
      label: "Browse",
      key: PATH_ROUTER.DASHBOARD,
      onClick: () => {
        router.push(PATH_ROUTER.DASHBOARD);
      },
      icon: <Image src={BrowseIcon} alt="menu icon" />,
    },
    {
      label: "Start a New Token",
      key: PATH_ROUTER.CREATE_TOKEN,
      icon: <Image src={CoinsIcon} alt="menu icon" />,
      onClick: () => {
        router.push(PATH_ROUTER.CREATE_TOKEN);
      },
    },
    accessToken
      ? {
          label: "My Portfolio",
          key: PATH_ROUTER.MY_PROFILE,
          icon: <Image src={ProfileIcon} alt="menu icon" />,
          onClick: () => {
            router.push(PATH_ROUTER.MY_PROFILE);
          },
        }
      : null,
    accessToken
      ? {
          label: "Notification",
          key: PATH_ROUTER.NOTIFICATION,
          icon: <Image src={NotificationsIcon} alt="menu icon" />,
          onClick: () => {
            router.push(PATH_ROUTER.NOTIFICATION);
          },
        }
      : null,
    {
      label: "Leaderboard",
      key: PATH_ROUTER.LEADER_BOARD,
      icon: <Image src={LeaderboardIcon} alt="menu icon" />,
      onClick: () => {
        router.push(PATH_ROUTER.LEADER_BOARD);
      },
    },
    {
      type: "divider",
    },
    {
      label: "RainLaunch",
      key: "rainlaunch",
      onClick: () => {
        window.open(envs.RAINLAUNCH_URL, "_blank");
      },
      icon: <Image src={RainLaunchIcon} alt="menu icon" />,
    },
    {
      label: "RainBoost",
      key: "rainboost",
      icon: <Image src={RainboostIcon} alt="menu icon" />,
      onClick: () => {
        window.open(envs.RAINBOOST_URL, "_blank");
      },
    },
    {
      label: "RainDrop",
      key: "raindrop",
      icon: <Image src={RainDropIcon} alt="menu icon" />,
      onClick: () => {
        window.open(envs.RAINDROP_URL, "_blank");
      },
    },
    {
      type: "divider",
    },
    {
      label: "X",
      key: "x",
      icon: <Image src={XIcon} alt="menu icon" />,
      onClick: () => {
        window.open(envs.X_URL, "_blank");
      },
    },
    {
      label: "Discord",
      key: "discord",
      icon: <Image src={DiscordIcon} alt="menu icon" />,
      onClick: () => {
        window.open(envs.DISCORD_URL, "_blank");
      },
    },
  ];

  return (
    <Menu
      mode="inline"
      style={{ height: "100%", borderRight: 0 }}
      items={items}
      selectedKeys={[`${selectedSegment}`]}
      className={`app-menu ${className || ""}`}
    />
  );
}
