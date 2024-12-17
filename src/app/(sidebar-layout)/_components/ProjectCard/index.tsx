import AppDivider from "@/components/app-divider";
import AppImage from "@/components/app-image";
import AppNumberToolTip from "@/components/app-number-tooltip";
import AppProgress from "@/components/app-progress";
import EllipsisTextWithTooltip from "@/components/app-tooltip/EllipsisTextWithTooltip";
import { DEFAULT_AVATAR } from "@/constant";
import { PATH_ROUTER } from "@/constant/router";
import { countAgeToken } from "@/helpers/calculate";
import { convertNumber, formatAmount } from "@/helpers/formatNumber";
import { CalendarIcon, ImageDefaultIcon, SwapIcon } from "@public/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./styles.scss";

interface IProjectCardProps {
  data: any;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

const ProjectCard = ({
  data,
  header,
  className,
  footer,
}: IProjectCardProps) => {
  const router = useRouter();

  return (
    <div
      className={`animate-bg-opacity p-4 pb-6 rounded-3xl bg-neutral-2 text-neutral-7 cursor-pointer ${
        className ?? ""
      }`}
      onClick={() => {
        router.push(PATH_ROUTER.TOKEN_DETAIL(data?.id));
      }}
    >
      {header && header}
      <div className="flex w-full flex-row gap-4">
        <div className="!overflow-hidden shrink-0 !bg-neutral-4 !min-w-[130px] !w-[130px] justify-center flex items-center !h-[130px] rounded-2xl">
          {data?.avatar ? (
            <AppImage
              className="!bg-neutral-4 min-w-[115px] w-full !h-[130px] rounded-2xl overflow-hidden flex [&>img]:!object-cover [&>img]:!w-full [&>img]:!h-full"
              src={data?.avatar || DEFAULT_AVATAR}
              alt="logo"
            />
          ) : (
            <Image
              className="[&>img]:!object-cover"
              alt="logo"
              src={ImageDefaultIcon}
            />
          )}
        </div>
        <div className="grow">
          <div className="w-full">
            {!footer && !header && (
              <div className="text-primary-7 flex w-full items-center flex-row !text-12px-normal">
                <div className="mr-1 !min-w-[55px]">Create by</div>
                <div className="w-[80px] 2xs:w-[125px] 3xs:w-[141px] sm:w-[45px] md:w-[109px] 2md:w-[173] lg:w-[107] xl:w-[70px] 2xl:w-[123px] 3xl:w-[211px]">
                  <EllipsisTextWithTooltip
                    onClick={(e: any) => {
                      e.stopPropagation();
                      router.push(
                        PATH_ROUTER.USER_PROFILE(data?.userWalletAddress)
                      );
                    }}
                    maxWidth="100%"
                    value={data?.username}
                    className="text-primary-7 !text-12px-normal hover:!underline cursor-pointer"
                  />
                </div>
              </div>
            )}
            <div className="text-neutral-9 text-18px-bold capitalize truncate-1-line">
              {data?.name}
            </div>
            <AppDivider />
          </div>
          <div className="truncate-3-line">{data?.description}</div>
        </div>
      </div>
      {footer && (
        <div className="mt-3">
          <div className="text-14px-normal text-neutral-7">
            <div className="mt-2 flex justify-between">
              <span>Total hold</span>
              <span>
                <span className="text-primary-main mr-2">
                  {data?.amount ? (
                    <AppNumberToolTip
                      value={convertNumber(data?.amount, data?.decimal)}
                      isNoFormatterKMB={true}
                    />
                  ) : (
                    "-"
                  )}
                </span>
                <span className="text-white-neutral capitalize">
                  {data?.symbol || "-"}
                </span>
              </span>
            </div>
            <div className="my-2 flex justify-between">
              <span>Value</span>
              <span>
                <span
                  className={
                    data?.valueEth
                      ? "text-primary-main mr-2"
                      : "text-white-neutral mr-2"
                  }
                >
                  {Number(data?.valueEth) > 0 ? (
                    <AppNumberToolTip value={convertNumber(data?.valueUsd)} />
                  ) : (
                    "-"
                  )}
                </span>
                <span className="text-white-neutral uppercase">USD</span>
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mt-3">
        <div className="flex justify-between flex-row mb-1 text-14px-normal text-white-neutral flex-wrap">
          <div className="text-14px-bold flex flex-row items-center">
            <span className="text-primary-7 mr-1">
              {formatAmount(data?.progressToListDex || 0)}%
            </span>
            <span>
              $
              <AppNumberToolTip value={convertNumber(data?.marketCap) || 0} />
            </span>
          </div>
          <div className="flex flex-row items-center">
            <Image src={CalendarIcon} alt="calender-icon" />
            <span>{countAgeToken(data?.createdAt) || "-"}</span>
            <Image src={SwapIcon} alt="swap-icon" className="mx-1" />
            <span>{formatAmount(data?.numberTransaction) || 0}</span>
            <span className="mx-1">txns</span>
            <span className="flex flex-row items-center">
              /
              <span className="ml-1 flex flex-row items-center">
                $
                <AppNumberToolTip value={convertNumber(data?.volume) || 0} />
                &nbsp;vol
              </span>
            </span>
          </div>
        </div>
        <AppProgress
          percent={data?.progressToListDex ?? 0}
          strokeColor="var(--color-primary-7)"
        />
      </div>
    </div>
  );
};

export default ProjectCard;
