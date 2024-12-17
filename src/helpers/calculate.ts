import { BigNumber } from "bignumber.js";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
type DateType = string | number | Date | Dayjs;

declare module "dayjs" {
  interface Dayjs {
    fromNow(withoutSuffix?: boolean): string;
    from(compared: DateType, withoutSuffix?: boolean): string;
    toNow(withoutSuffix?: boolean): string;
    calendar(withoutSuffix?: boolean): string;
    to(compared: DateType, withoutSuffix?: boolean): string;
  }
}

const TARGET = new BigNumber("1000000000");
const INITIAL_TOKEN_RESERVE = new BigNumber("1000000000");
const INITIAL_ETH_RESERVE = new BigNumber("1");
export const DISCOUNT_FACTOR = new BigNumber("0.99");

export const calculateUsdtShouldPay = (y: string): string => {
  const denominator = INITIAL_TOKEN_RESERVE.minus(new BigNumber(y));
  const result = TARGET.dividedBy(denominator)
    .minus(INITIAL_ETH_RESERVE)
    .dividedBy(DISCOUNT_FACTOR);
  return result.toFixed();
};

export const calculateTokenReceive = (x: string): string => {
  const discountedX = new BigNumber(x).multipliedBy(DISCOUNT_FACTOR);
  const denominator = INITIAL_ETH_RESERVE.plus(discountedX);
  const result = INITIAL_TOKEN_RESERVE.minus(TARGET.dividedBy(denominator));
  return result.toFixed();
};

export const calculateTokenReceiveWithoutFee = (x: string): string => {
  const denominator = INITIAL_ETH_RESERVE.plus(x);
  const result = INITIAL_TOKEN_RESERVE.minus(TARGET.dividedBy(denominator));
  return result.toFixed();
};

export const countAgeToken = (createdAt: any): string => {
  const data = dayjs(new Date());
  const diffMinute = data.diff(
    dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
    "minute"
  );
  const diffHour = data.diff(
    dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
    "hour"
  );
  const diffDay = data.diff(dayjs(createdAt).format("YYYY-MM-DD HH:mm"), "day");
  const diffMonth = data.diff(
    dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
    "month"
  );
  if (Math.floor(diffMonth) > 12) {
    return ">12m";
  }
  if (Math.floor(diffMonth) > 0) {
    return `${Math.floor(diffMonth)}mo`;
  }
  if (Math.floor(diffDay) > 0) {
    return `${Math.floor(diffDay)}d`;
  }
  if (Math.floor(diffHour) > 0) {
    return `${Math.floor(diffHour)}h`;
  }
  if (Math.floor(diffMinute) < 1) {
    return "<1m";
  }
  return `${Math.floor(diffMinute) || 1}m`;
};

export const increaseByPercent = (
  originalValue: string,
  percentIncrease: string
): string => {
  const original = new BigNumber(originalValue);
  const increase = new BigNumber(percentIncrease);

  if (increase.isNegative()) {
    throw new Error("Percent increase cannot be negative.");
  }

  const factor = BigNumber(1).plus(increase.div(100));
  return original.multipliedBy(factor).toString();
};

export const decreaseByPercent = (
  originalValue: string,
  percentDecrease: string
): string => {
  const original = new BigNumber(originalValue);
  const decrease = new BigNumber(percentDecrease);

  if (decrease.isNegative() || decrease.gt(100)) {
    throw new Error("Percent decrease must be between 0 and 100.");
  }

  const factor = new BigNumber(1).minus(decrease.div(100));
  return original.multipliedBy(factor).toString();
};

const FEE_MULTIPLIER = 0.997; // 0.3% Uniswap fee

type SwapFunction = (x: any, y: any, delta: any) => any;

/**
 * Calculates how much Token 2 you receive when swapping Token 1.
 */
export const swapToken1ForToken2: SwapFunction = (x, y, deltaX) => {
  const k = x.multipliedBy(y); // Constant product k = x * y
  const newY = k.dividedBy(x.plus(deltaX.multipliedBy(FEE_MULTIPLIER))); // New reserve of Token 2
  return y.minus(newY); // Token 2 received
};

/**
 * Calculates how much Token 1 you receive when swapping Token 2.
 */
export const swapToken2ForToken1: SwapFunction = (x, y, deltaY) => {
  const k = x.multipliedBy(y); // Constant product k = x * y
  const newX = k.dividedBy(y.plus(deltaY.multipliedBy(FEE_MULTIPLIER))); // New reserve of Token 1
  return x.minus(newX); // Token 1 received
};

export const calculateUsdtShouldPayAfterListed = (
  tokenReserve: BigNumber,
  usdtReserve: BigNumber,
  y: string
): string => {
  const k = tokenReserve.multipliedBy(usdtReserve);
  const denominator = tokenReserve.minus(BigNumber(y));

  const x = k.dividedBy(denominator).minus(usdtReserve);
  const result = BigNumber(x).div(FEE_MULTIPLIER);

  return result.toFixed();
};

export const calculateTokenReceiveAfterListed = (
  tokenReserve: BigNumber,
  usdtReserve: BigNumber,
  x: string
): string => {
  const k = tokenReserve.multipliedBy(usdtReserve);
  const discountedX = BigNumber(x).multipliedBy(FEE_MULTIPLIER);
  const denominator = usdtReserve.plus(discountedX);
  const result = tokenReserve.minus(k.dividedBy(denominator));
  return result.toFixed();
};
