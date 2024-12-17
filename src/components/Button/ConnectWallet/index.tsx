import AppButton from "@/components/app-button";
import AppTextLoading from "@/components/app-text-loading";
import { nFormatter } from "@/helpers/formatNumber";
import { shortenAddress } from "@/helpers/shorten";
import useWalletAuth from "@/hooks/useWalletAuth";
import useWindowSize from "@/hooks/useWindowSize";
import { useAccountModal } from "@/providers/WagmiProvider";
import { EthIcon } from "@public/assets";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Flex } from "antd";
import Image from "next/image";
import { useEffect } from "react";

const ConnectWalletButton = ({ customClass }: { customClass?: string }) => {
  const { userAddress, isConnected, accessToken, logout } = useWalletAuth();
  const { isDesktop } = useWindowSize();
  const { setOpenAccountModal, userBalance } = useAccountModal();

  useEffect(() => {
    if (!isConnected) {
      const inner = setTimeout(() => {
        logout();
      }, 300);
      return () => {
        clearTimeout(inner);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userAddress]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated") &&
          accessToken;
        return (
          <Flex
            align="center"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className={customClass || ""}
          >
            {(() => {
              if (!connected) {
                return (
                  <AppButton onClick={openConnectModal} customClass="w-full">
                    Connect Wallet
                  </AppButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <AppButton onClick={openChainModal}>Wrong network</AppButton>
                );
              }

              return (
                <div className="flex items-center justify-center gap-3 flex-col md:flex-row flex-1 md:flex-auto">
                  {/* <ButtonContained
                    buttonType="secondary"
                    className="pointer-events-none"
                  >
                    {chain.name}
                  </ButtonContained> */}

                  <div
                    className="flex rounded-[90px] border-[1.5px] border-neutral-4 text-white-neutral text-14px-bold h-[32px] md:h-[40px] overflow-hidden cursor-pointer  w-full md:w-auto"
                    onClick={() => setOpenAccountModal(true)}
                  >
                    <div className="flex items-center gap-2.5 h-full flex-1 md:flex-auto ml-[4px] mr-2.5">
                      {chain.hasIcon && (
                        <div
                          className="flex items-center justify-center rounded-full overflow-hidden"
                          style={{
                            background: chain.iconBackground,
                          }}
                        >
                          {chain.iconUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <Image
                              alt={"ETH Icon"}
                              src={EthIcon}
                              className={`${
                                isDesktop
                                  ? "w-[32px] h-[32px]"
                                  : "w-[24px] h-[24px]"
                              }`}
                            />
                          )}
                        </div>
                      )}
                      <AppTextLoading
                        loading={!Boolean(isConnected)}
                        text={
                          account.displayBalance
                            ? ` ${nFormatter(
                                account.balanceFormatted || 0,
                                4
                              )}` + " ETH"
                            : ""
                        }
                        className="text-12px-medium min-w-[50px]"
                      />
                    </div>

                    <div className="p-4 bg-neutral-3 flex items-center text-12px-medium">
                      {isDesktop
                        ? shortenAddress(account.address, 6, -3)
                        : shortenAddress(account.address, 3, -3)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Flex>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
