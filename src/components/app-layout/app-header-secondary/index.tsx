"use client";
import ConnectWalletButton from "@/components/Button/ConnectWallet";
import useWindowSize from "@/hooks/useWindowSize";
import { Hamburgericon, Logo1Icon, RainmakrIcon } from "@public/assets";
import { Flex, Layout } from "antd";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AppMenu from "../app-menu";

const { Header } = Layout;

export default function AppHeaderSecondary() {
  const { isDesktop } = useWindowSize();
  const [isOpenMenuMobile, setIsOpenMenuMobile] = useState<boolean>(false);

  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current?.contains(event.target as Node)
      ) {
        setIsOpenMenuMobile(false);
      }
    };

    if (isOpenMenuMobile) {
      document.body.classList.add("disable-scroll");
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("disable-scroll");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("disable-scroll");
    };
  }, [isOpenMenuMobile]);

  useEffect(() => {
    setIsOpenMenuMobile(false);
  }, [pathname]);

  return (
    <Header
      className={`bg-neutral-2 h-14 z-50 border-b-[1px] border-solid border-b-neutral-4 ${
        !isDesktop ? "fixed top-0 bg-neutral-2 w-full pl-0 pr-4" : ""
      }`}
    >
      <div
        className={clsx(
          "flex justify-between items-center h-full mx-auto",
          isDesktop ? "max-w-[var(--width-content-sidebar-layout)]" : ""
        )}
      >
        {isDesktop ? (
          <Link href="/" className="flex items-center">
            <Image src={RainmakrIcon} alt="rainmakr icon" />
          </Link>
        ) : null}
        {!isDesktop ? (
          <div className="mr-auto h-full flex items-center">
            <a
              className={clsx(
                "p-4 w-14 h-14",
                isOpenMenuMobile ? "bg-primary-main" : ""
              )}
              ref={toggleButtonRef}
              onClick={() => setIsOpenMenuMobile((prevState) => !prevState)}
            >
              {isOpenMenuMobile ? (
                <Image
                  src={Hamburgericon}
                  alt="close icon"
                  className="filter-white"
                />
              ) : (
                <Image src={Hamburgericon} alt="close icon" />
              )}
            </a>

            <Link href="/" className={isOpenMenuMobile ? "ml-2" : ""}>
              <Image
                src={Logo1Icon}
                alt="rainmakr icon"
                width={84}
                height={24}
                className="my-auto"
              />
            </Link>

            {/* Sidebar Overlay */}
            <div
              className={`fixed top-14 inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
                isOpenMenuMobile
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            ></div>
            {/* Sidebar */}
            <div
              ref={sidebarRef}
              className={`fixed top-14 left-0 p-6 h-full w-[90%] bg-neutral-2 shadow-lg transform transition-transform duration-300 overflow-y-auto ${
                isOpenMenuMobile ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <Flex vertical>
                <AppMenu className="bg-neutral-2 !p-0" />
              </Flex>
            </div>
          </div>
        ) : null}
        <div className="ml-auto flex items-center">
          <ConnectWalletButton />
        </div>
      </div>
    </Header>
  );
}
