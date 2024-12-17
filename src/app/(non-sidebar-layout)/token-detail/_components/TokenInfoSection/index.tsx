import AppButton from "@/components/app-button";
import AppImage from "@/components/app-image";
import AppTruncateText from "@/components/app-truncate-text";
import NoData from "@/components/no-data";
import { ITokenDetailRes } from "@/interfaces/token";
import {
  DiscordLinkIcon,
  TeleLinkIcon,
  TwitterLinkIcon,
  WebsiteLinkIcon,
} from "@public/assets";
import Image from "next/image";

interface ITokenInfoSectionProps {
  tokenDetail: ITokenDetailRes;
}

const TokenInfoSection = ({ tokenDetail }: ITokenInfoSectionProps) => {
  const SocialLink = [
    { label: "Website", image: WebsiteLinkIcon, link: tokenDetail?.website },
    { label: "Twitter", image: TwitterLinkIcon, link: tokenDetail?.twitter },
    { label: "Telegram", image: TeleLinkIcon, link: tokenDetail?.telegram },
    { label: "Discord", image: DiscordLinkIcon, link: tokenDetail?.discord },
  ];
  return (
    <>
      <div className="px-4 md:px-14 py-6 bg-neutral-2 rounded-[16px] shadow-[0px_40px_32px_-24px_rgba(15,15,15,0.12)] mt-6">
        <div className="flex flex-col">
          <div className="flex justify-center h-[202px]">
            <AppImage
              className="max-w-[278px] [&>img]:object-cover w-full [&>img]:!h-full [&>img]:!w-full"
              src={tokenDetail?.avatar}
              alt="token image"
              preview={true}
            />
          </div>

          <div className="text-22px-bold text-white-neutral mt-6 justify-center flex gap-x-1 flex-wrap">
            <div>
              <AppTruncateText text={tokenDetail?.name} maxLength={20} />
            </div>
            <span>({tokenDetail?.symbol})</span>
          </div>
          <div className="text-12px-normal text-neutral-7 mt-3 break-words">
            {tokenDetail?.description ? tokenDetail?.description : <NoData />}
          </div>

          <div className="w-full">
            {SocialLink.every((item) => !item.link) ? null : (
              <div className="text-14px-medium text-error-3 mt-[30px] mb-[10px]">
                Links
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {SocialLink.map((item) =>
                item?.link ? (
                  <AppButton
                    key={item.label}
                    classChildren="text-14px-bold text-neutral-9"
                    typeButton="secondary"
                    customClass="!w-[135px]"
                    onClick={() =>
                      window.open(
                        item?.link as string,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    <div className="flex gap-2">
                      <Image src={item.image} alt={item.label} />
                      <span>{item.label}</span>
                    </div>
                  </AppButton>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenInfoSection;
