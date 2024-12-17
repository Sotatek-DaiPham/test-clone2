import "@/assets/scss/globals.scss";
import AppLayout from "@/components/app-layout";
import { NotificationProvider } from "@/libs/antd/NotificationProvider";
import SocketProvider from "@/libs/socket/SocketProvider";
import { WagmiRainbowKitProvider } from "@/providers/WagmiProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";

const ReduxProviders = dynamic(() => import("@/providers/StoreProvider"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "RainPump",
  description: "RainPump",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <ReduxProviders>
          <WagmiRainbowKitProvider>
            <AntdRegistry>
              <NotificationProvider>
                <AppLayout>
                  <SocketProvider>{children}</SocketProvider>
                </AppLayout>
              </NotificationProvider>
            </AntdRegistry>
          </WagmiRainbowKitProvider>
        </ReduxProviders>
      </body>
    </html>
  );
}
