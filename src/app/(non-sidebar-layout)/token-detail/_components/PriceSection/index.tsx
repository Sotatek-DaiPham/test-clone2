import AppNumberToolTip from "@/components/app-number-tooltip";
import AppProgress from "@/components/app-progress";
import AppTextLoading from "@/components/app-text-loading";
import AppTooltip from "@/components/app-tooltip";
import { TOKEN_DECIMAL, NATIVE_TOKEN_DECIMAL, ETH_THRESHOLD } from "@/constant";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { calculateUsdtShouldPay } from "@/helpers/calculate";
import { nFormatter } from "@/helpers/formatNumber";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

const PriceSection = () => {
  const {
    tokenDetail,
    tokenDetailSC,
    isTokenDetailLoading,
    isTokenDetailScLoading,
  } = useTokenDetail();

  const tokenInfo = useMemo(() => {
    const tokenPrice = BigNumber(tokenDetail?.price).div(NATIVE_TOKEN_DECIMAL);

    const tokenTotalSupply = BigNumber(tokenDetail?.total_supply).div(
      TOKEN_DECIMAL
    );

    const marketCap = BigNumber(tokenPrice)
      .multipliedBy(tokenTotalSupply)
      .toString();

    return {
      marketCap,
    };
  }, [tokenDetailSC, tokenDetail]);

  const textLoading = isTokenDetailScLoading || isTokenDetailLoading;

  return (
    <div className="bg-neutral-2 rounded-[16px] shadow-[0px_40px_32px_-24px_rgba(15,15,15,0.12)] p-5 flex flex-col gap-[15px]">
      <div className="flex justify-between items-center">
        <div className="text-14px-normal text-neutral-7">Price</div>
        <div className="text-14px-medium text-white-neutral">
          ${" "}
          <AppTextLoading
            text={
              <AppNumberToolTip
                decimal={6}
                isFormatterK={false}
                value={BigNumber(tokenDetail?.price)
                  .div(NATIVE_TOKEN_DECIMAL)
                  .toString()}
              />
            }
            loading={textLoading}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-14px-normal text-neutral-7">Market Cap</div>
        <div className="text-14px-medium text-white-neutral">
          ${" "}
          <AppTextLoading
            text={
              <AppNumberToolTip
                decimal={6}
                isFormatterK={false}
                value={tokenInfo?.marketCap}
              />
            }
            loading={textLoading}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-14px-normal text-neutral-7">Volume</div>
        <div className="text-14px-medium text-white-neutral">
          ${" "}
          <AppTextLoading
            text={
              <AppNumberToolTip
                decimal={6}
                isFormatterK={false}
                value={BigNumber(tokenDetail?.volume)
                  .div(NATIVE_TOKEN_DECIMAL)
                  .toString()}
              />
            }
            loading={textLoading}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-14px-normal text-neutral-7">
            Bonding curve progress
          </div>
          <AppTooltip
            title="When the market cap reaches 3.5 ETH all the liquidity from the bonding curve will be deposited into Uniswap."
            isShowIcon={true}
          />
        </div>
        <div className="text-14px-medium text-white-neutral">
          <AppTextLoading
            text={nFormatter(tokenDetail?.progressToListDex, 2)}
            loading={textLoading}
          />{" "}
          %
        </div>
      </div>
      <AppProgress
        percent={+tokenDetail?.progressToListDex}
        strokeColor="var(--color-primary-7)"
      />
    </div>
  );
};

export default PriceSection;
