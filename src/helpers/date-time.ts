import { DATE_TIME_FORMAT, DATE_TIME_SECONDS_FORMAT } from "@/constant/format";
import dayjs from "dayjs";

export const getTimeDDMMMYYYYHHMM = (date: string | number | null) => {
  if (!dayjs(date).isValid()) {
    return "-";
  }

  return dayjs(date).format(DATE_TIME_FORMAT);
};

export const getTimeDDMMMYYYYHHMMss = (date: string | number | null) => {
  if (!dayjs(date).isValid()) {
    return "-";
  }

  return dayjs(date).format(DATE_TIME_SECONDS_FORMAT);
};

const getAgeMilliseconds = (interval: string): number => {
  const stringIntervals: { [key: string]: number } = {
    "1H": 60,
    "3H": 3 * 60,
    "6H": 6 * 60,
    "12H": 12 * 60,
    "24H": 24 * 60,
    "1D": 24 * 60,
    "3D": 3 * 24 * 60,
  };
  if (stringIntervals[interval]) {
    return stringIntervals[interval] * 60 * 1000;
  } else {
    return Number(interval?.replace("M", "")) * 60 * 1000;
  }
};

export const getAge = (age: string | undefined) => {
  if (!age) return "";
  const newAge = age?.replace("less", "")?.replace("bigger", "");
  return getAgeMilliseconds(newAge)?.toString();
};

export const getAgeType = (age: string | undefined) => {
  if (!age) return "";
  if (age.includes("less")) {
    return "LESS_THAN_EQUAL";
  } else if (age.includes("bigger")) {
    return "GREATER_THAN_EQUAL";
  } else return "";
};
