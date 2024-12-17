import BigNumber from "bignumber.js";
import { isNaN } from "lodash";

type IBigNumberArg = string | number | BigNumber;

export const formatNumberWithComma = (value: string) => {
  const parts = value?.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedNumber =
    parts.length > 1 ? integerPart + "." + parts[1] : integerPart;
  return formattedNumber;
};

export const nFormatter = (
  number: string | number,
  digits = 6,
  roundingMode?: BigNumber.RoundingMode
) => {
  if (Number(number) === 0 || isNaN(Number(number))) {
    return "0.00";
  }

  const SI = [
    { value: 1, symbol: "" },
    // { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
    { value: 1e21, symbol: "s" },
    { value: 1e24, symbol: "S" },
  ];
  // |(\.[0-9]*[1-9])0+$
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const num = parseFloat(number?.toString());

  let i;
  for (i = SI.length - 1; i > 0; i--) {
    if (num >= SI[i].value) {
      break;
    }
  }

  const roundingModeCombined = roundingMode || BigNumber.ROUND_DOWN;

  const minimumNumber = BigNumber(1).div(`1e${digits}`).toNumber();

  if (Number(number) > 0 && new BigNumber(number).lt(minimumNumber)) {
    return "< " + parseFloat(minimumNumber?.toExponential()).toFixed(digits);
  }

  const formatedValue =
    new BigNumber(num)
      .div(SI[i].value)
      .toFixed(digits, roundingModeCombined)
      .toString()
      .replace(rx, "$1") + SI[i].symbol;

  return formatNumberWithComma(formatedValue);
};

export const formatRoundFloorDisplayWithCompare = (
  value: IBigNumberArg,
  decimalPlace = 2
): string => {
  if (!Number(value)) {
    return "";
  }
  const minimumNumber = BigNumber(1).div(`1e${decimalPlace}`).toNumber();
  const data = String(
    new BigNumber(value).toNumber().toLocaleString("en-US", {
      maximumFractionDigits: decimalPlace,
      minimumFractionDigits: 0,
    })
  );

  if (Number(value) !== 0 && new BigNumber(value).lt(minimumNumber)) {
    return "<" + minimumNumber;
  }
  return data;
};

export const formatAmount = (
  value: string | number | BigNumber,
  decimalPlace = 2,
  shiftedBy = 0
): string => {
  if (Number(value) !== 0 && new BigNumber(value).lt(0.01)) {
    return "<0.01";
  }
  return new BigNumber(value || 0)
    .shiftedBy(-shiftedBy)
    .decimalPlaces(decimalPlace, BigNumber.ROUND_DOWN)
    .toFormat();
};

export const formatAmountWithDecimal = (
  value: string | number | BigNumber,
  decimalPlace = 2,
  shiftedBy = 0
): string => {
  if (Number(value) !== 0 && new BigNumber(value).lt(0.01)) {
    return "<0.01";
  }
  return new BigNumber(value || 0)
    .shiftedBy(-shiftedBy)
    .decimalPlaces(decimalPlace, BigNumber.ROUND_DOWN)
    .toFormat(decimalPlace);
};

export const convertNumber = (
  value: string | number,
  decimalPlace = 18
): string => {
  if (Number(value) === 0) {
    return "0";
  }
  return new BigNumber(value)
    .div(new BigNumber(10).pow(decimalPlace))
    ?.toString();
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = (bytes / Math.pow(k, i)).toFixed(2); // Rounded to 2 decimal places
  return `${size} ${units[i]}`;
};

export const nFormatterVer2 = (
  number: string | number,
  digits = 2,
  roundingMode?: BigNumber.RoundingMode
) => {
  if (Number(number) === 0 || isNaN(Number(number))) {
    return 0;
  }

  const SI = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
    { value: 1e21, symbol: "s" },
    { value: 1e24, symbol: "S" },
  ];
  // |(\.[0-9]*[1-9])0+$
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const num = parseFloat(number?.toString());

  let i;
  for (i = SI.length - 1; i > 0; i--) {
    if (num >= SI[i].value) {
      break;
    }
  }

  const roundingModeCombined = roundingMode || BigNumber.ROUND_DOWN;

  const minimumNumber = BigNumber(1).div(`1e${digits}`).toNumber();

  if (Number(number) > 0 && new BigNumber(number).lt(minimumNumber)) {
    return "< " + parseFloat(minimumNumber?.toExponential()).toFixed(digits);
  }

  const formatedValue =
    new BigNumber(num)
      .div(SI[i].value)
      .toFixed(digits, roundingModeCombined)
      .toString()
      .replace(rx, "$1") + SI[i].symbol;

  return formatNumberWithComma(formatedValue);
};
