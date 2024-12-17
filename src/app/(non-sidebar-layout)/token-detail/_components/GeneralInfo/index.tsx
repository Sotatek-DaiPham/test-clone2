import AppTooltip from "@/components/app-tooltip";
import AppTruncateText from "@/components/app-truncate-text";
import { envs } from "@/constant/envs";
import { DATE_FORMAT } from "@/constant/format";
import { PATH_ROUTER } from "@/constant/router";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { shortenAddress } from "@/helpers/shorten";
import { ArrowExport } from "@public/assets";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

const GeneralInfo = () => {
  const { tokenDetail } = useTokenDetail();
  return (
    <div className="flex items-center px-1 mb-3.5 flex-wrap gap-2 md:gap-x-10">
      <div className="flex gap-2 items-center">
        <div className="text-12px-normal md:text-14px-normal text-neutral-7">
          Token name
        </div>
        <div className="text-12px-medium md:text-14px-medium text-white-neutral">
          <div className="flex items-center gap-1">
            <AppTruncateText text={`${tokenDetail?.name}`} maxLength={15} />
            <div>({tokenDetail?.symbol})</div>
          </div>
        </div>
      </div>
      <div className="flex gap-10">
        <div className="flex gap-2 items-center">
          <div className="text-12px-normal md:text-14px-normal text-neutral-7">
            Created on
          </div>
          <div className="text-12px-medium md:text-14px-medium text-white-neutral">
            &nbsp;
            {tokenDetail?.createdAt
              ? dayjs(tokenDetail?.createdAt).format(DATE_FORMAT)
              : "-"}
          </div>
        </div>
        <div className="flex gap-2 flex-row items-center">
          <div className="text-12px-normal md:text-14px-normal text-neutral-7">
            Creator
          </div>
          <Link
            href={PATH_ROUTER.USER_PROFILE(tokenDetail?.userWalletAddress)}
            className="py-[2px] px-3 rounded-[16px] bg-[rgba(15,190,90,0.20)] text-[#0FBE5A] text-14px-normal hover:underline cursor-pointer"
          >
            <AppTruncateText text={tokenDetail?.username} maxLength={6} />
          </Link>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <div className="text-12px-normal md:text-14px-normal text-neutral-7">
          Contract address
        </div>
        <div className="flex gap-1">
          <div className="text-12px-medium md:text-14px-medium text-white-neutral flex gap-1">
            {shortenAddress(tokenDetail?.contractAddress || "") || "-"}
          </div>
          <Link
            href={`${envs.SCAN_URL}/address/${tokenDetail?.contractAddress}`}
            target="_blank"
          >
            <AppTooltip title="View on Block Explorer">
              <Image src={ArrowExport} alt="arrow-export" />
            </AppTooltip>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo;
