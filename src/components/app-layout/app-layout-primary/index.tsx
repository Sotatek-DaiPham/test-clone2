import useWindowSize from "@/hooks/useWindowSize";
import AppHeaderPrimary from "../app-header-primary";
import AppSidebar from "../app-sidebar";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Image from "next/image";
import {
  BackgounrdEffect1,
  BackgounrdEffect2,
  BackgounrdEffect3,
} from "@public/assets";

export default function AppLayoutPrimary({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDesktop } = useWindowSize();
  return (
    <>
      {isDesktop ? <AppSidebar /> : null}
      <Layout className="h-screen overflow-y-scroll overflow-x-hidden">
        <AppHeaderPrimary />
        <Content
          className={`app-content relative min-h-[auto] p-6 ${
            !isDesktop ? "mt-20" : ""
          }`}
        >
          <div className="relative z-[2] h-full">{children}</div>
          <Image
            className="absolute left-[-226px] top-[-92px]"
            src={BackgounrdEffect1}
            alt="effect"
          />
          <Image
            className="absolute right-[22%] top-[-3%] scale-[0.8]"
            src={BackgounrdEffect2}
            alt="effect"
          />
          <Image
            className="absolute top-[-58px] right-[-32px] scale-[0.8]"
            src={BackgounrdEffect3}
            alt="effect"
          />
        </Content>
      </Layout>
    </>
  );
}
