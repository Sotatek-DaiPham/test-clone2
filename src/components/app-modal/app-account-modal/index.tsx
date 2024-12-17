import { API_PATH } from "@/constant/api-path";
import { MyProfileResponse } from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { nFormatterVer2 } from "@/helpers/formatNumber";
import { shortenAddress } from "@/helpers/shorten";
import useWalletAuth from "@/hooks/useWalletAuth";
import { useAccountModal } from "@/providers/WagmiProvider";
import { getAPI } from "@/service";
import { useQuery } from "@tanstack/react-query";
import { Modal, ModalProps } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import "./styles.scss";
import AppImage from "@/components/app-image";
import { ImageDefaultIcon } from "@public/assets";
import BigNumber from "bignumber.js";
import { NATIVE_TOKEN_DECIMAL } from "@/constant";

interface IAccountModal extends ModalProps {
  onClose: () => void;
}

const AccountModal = ({ onClose, ...props }: IAccountModal) => {
  const [isCopied, setIsCopied] = useState(false);
  const { address } = useAccount();
  const { userBalance } = useAccountModal();
  const { logout } = useWalletAuth();
  const { data } = useQuery({
    queryKey: ["my-profile", props.open],
    queryFn: async () => {
      return getAPI(API_PATH.USER.PROFILE(address as string)) as Promise<
        AxiosResponse<BeSuccessResponse<MyProfileResponse>, any>
      >;
    },
    enabled: props.open,
  });

  const myProfile = get(data, "data.data", {}) as MyProfileResponse;

  const handleCopy = () => {
    if (isCopied) {
      return;
    }
    setIsCopied(true);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(address as string);
    } else {
      (window as any)?.clipboardData.setData(address);
    }

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    onClose?.();
    logout();
  };

  return (
    <Modal
      className="account-modal"
      width={448}
      footer={false}
      centered
      closable={false}
      {...props}
    >
      <button onClick={onClose} className="close-button">
        <svg
          aria-hidden="true"
          fill="none"
          height="10"
          viewBox="0 0 10 10"
          width="10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Close</title>
          <path
            d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z"
            fill="#e0e8ff99"
          ></path>
        </svg>
      </button>

      <div className="account-modal__info">
        {myProfile?.avatar ? (
          <AppImage
            src={myProfile?.avatar}
            alt="avatar"
            width={74}
            height={74}
            className="rounded-full [&>img]:!object-cover [&>img]:!w-full [&>img]:!h-full"
          />
        ) : (
          <Image
            src={ImageDefaultIcon}
            alt="avatar"
            width={74}
            height={74}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <div className="address text-white-neutral font-[600] text-center text-[18px] leading-[24px]">
            <span>{shortenAddress(address || "", 4, -4)}</span>
          </div>
          <div className="balance  font-[600] text-center text-[#fff9] leading-[18px]">
            <span>
              {userBalance
                ? nFormatterVer2(
                    BigNumber(userBalance).div(NATIVE_TOKEN_DECIMAL).toString(),
                    3
                  )
                : "0"}{" "}
              ETH
            </span>
          </div>
        </div>
      </div>
      <div className="account-modal__actions">
        <button onClick={handleCopy}>
          {isCopied ? (
            <>
              <svg
                fill="none"
                height="13"
                viewBox="0 0 13 13"
                width="13"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Copied</title>
                <path
                  d="M4.94568 12.2646C5.41052 12.2646 5.77283 12.0869 6.01892 11.7109L12.39 1.96973C12.5677 1.69629 12.6429 1.44336 12.6429 1.2041C12.6429 0.561523 12.1644 0.0966797 11.5082 0.0966797C11.057 0.0966797 10.7767 0.260742 10.5033 0.691406L4.9115 9.50977L2.07458 5.98926C1.82166 5.68848 1.54822 5.55176 1.16541 5.55176C0.502319 5.55176 0.0238037 6.02344 0.0238037 6.66602C0.0238037 6.95312 0.112671 7.20605 0.358765 7.48633L3.88611 11.7588C4.18005 12.1074 4.50818 12.2646 4.94568 12.2646Z"
                  fill="#fff"
                ></path>
              </svg>
              <p className="text-white-neutral font-[600]">Copied!</p>
            </>
          ) : (
            <>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 17 16"
                width="17"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Copy</title>
                <path
                  d="M3.04236 12.3027H4.18396V13.3008C4.18396 14.8525 5.03845 15.7002 6.59705 15.7002H13.6244C15.183 15.7002 16.0375 14.8525 16.0375 13.3008V6.24609C16.0375 4.69434 15.183 3.84668 13.6244 3.84668H12.4828V2.8418C12.4828 1.29688 11.6283 0.442383 10.0697 0.442383H3.04236C1.48376 0.442383 0.629272 1.29004 0.629272 2.8418V9.90332C0.629272 11.4551 1.48376 12.3027 3.04236 12.3027ZM3.23376 10.5391C2.68689 10.5391 2.39294 10.2656 2.39294 9.68457V3.06055C2.39294 2.47949 2.68689 2.21289 3.23376 2.21289H9.8783C10.4252 2.21289 10.7191 2.47949 10.7191 3.06055V3.84668H6.59705C5.03845 3.84668 4.18396 4.69434 4.18396 6.24609V10.5391H3.23376ZM6.78845 13.9365C6.24158 13.9365 5.94763 13.6699 5.94763 13.0889V6.45801C5.94763 5.87695 6.24158 5.61035 6.78845 5.61035H13.433C13.9799 5.61035 14.2738 5.87695 14.2738 6.45801V13.0889C14.2738 13.6699 13.9799 13.9365 13.433 13.9365H6.78845Z"
                  fill="#fff"
                ></path>
              </svg>
              <p className="text-white-neutral font-[600]">Copy Address</p>
            </>
          )}
        </button>

        <button onClick={handleDisconnect}>
          <svg
            fill="none"
            height="16"
            viewBox="0 0 18 16"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Disconnect</title>
            <path
              d="M2.67834 15.5908H9.99963C11.5514 15.5908 12.399 14.7432 12.399 13.1777V10.2656H10.6354V12.9863C10.6354 13.5332 10.3688 13.8271 9.78772 13.8271H2.89026C2.3092 13.8271 2.0426 13.5332 2.0426 12.9863V3.15625C2.0426 2.60254 2.3092 2.30859 2.89026 2.30859H9.78772C10.3688 2.30859 10.6354 2.60254 10.6354 3.15625V5.89746H12.399V2.95801C12.399 1.39941 11.5514 0.544922 9.99963 0.544922H2.67834C1.12659 0.544922 0.278931 1.39941 0.278931 2.95801V13.1777C0.278931 14.7432 1.12659 15.5908 2.67834 15.5908ZM7.43616 8.85059H14.0875L15.0924 8.78906L14.566 9.14453L13.6842 9.96484C13.5406 10.1016 13.4586 10.2861 13.4586 10.4844C13.4586 10.8398 13.7321 11.168 14.1217 11.168C14.3199 11.168 14.4635 11.0928 14.6002 10.9561L16.7809 8.68652C16.986 8.48145 17.0543 8.27637 17.0543 8.06445C17.0543 7.85254 16.986 7.64746 16.7809 7.43555L14.6002 5.17285C14.4635 5.03613 14.3199 4.9541 14.1217 4.9541C13.7321 4.9541 13.4586 5.27539 13.4586 5.6377C13.4586 5.83594 13.5406 6.02734 13.6842 6.15723L14.566 6.98438L15.0924 7.33984L14.0875 7.27148H7.43616C7.01917 7.27148 6.65686 7.62012 6.65686 8.06445C6.65686 8.50195 7.01917 8.85059 7.43616 8.85059Z"
              fill="#fff"
            ></path>
          </svg>
          <p className="text-white-neutral font-[600]">Disconnect</p>
        </button>
      </div>
    </Modal>
  );
};

export default AccountModal;
