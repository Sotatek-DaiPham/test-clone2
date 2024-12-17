"use client";
import useWalletAuth from "@/hooks/useWalletAuth";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppDispatch } from "@/libs/hooks";
import { clearUser } from "@/libs/slices/userSlice";
import { config } from "@/wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import { Layout } from "antd";
import { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { watchAccount } from "wagmi/actions";
import LoginModal from "../app-modal/app-login-modal";
import "./styles.scss";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { success } = useContext(NotificationContext);
  const dispatch = useAppDispatch();
  const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);
  const { chain } = useAccount();
  const { openChainModal } = useChainModal();
  const {
    login,
    accessToken: isAuth,
    isConnected,
    isLoginLoading,
    logout,
    disconnectWallet,
  } = useWalletAuth();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isConnected && !isAuth && chain) {
      timeout = setTimeout(() => {
        setIsOpenWarningModal(true);
      }, 1000);
    } else if (isConnected && !isAuth && !chain) {
      timeout = setTimeout(() => {
        openChainModal?.();
      }, 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isConnected, isAuth, chain]);

  useEffect(() => {
    const unwatchAccount = watchAccount(config, {
      onChange(data, previousAccount) {
        if (
          data.status === "connected" &&
          previousAccount?.address !== data?.address
        ) {
          dispatch(clearUser());
        }
      },
    });
    return () => {
      unwatchAccount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuth) {
      disconnectWallet();
    }
  }, [isAuth]);

  return (
    <Layout className="app-layout">
      {children}
      <LoginModal
        onOk={() => {
          login(
            () => {
              setIsOpenWarningModal(false);

              success({
                message: "Wallet connection successfull",
              });
            },
            () => {
              setIsOpenWarningModal(false);
              logout();
            }
          );
        }}
        open={isOpenWarningModal}
        onCancel={() => {
          setIsOpenWarningModal(false);
          logout();
        }}
        title="Signature required"
        content="Please sign on your wallet to confirm"
        loading={isLoginLoading}
      />
    </Layout>
  );
};

export default AppLayout;
