import { pickBy } from "lodash";

export const shortenAddress = (label: string, start = 6, end = -4) => {
  if (label?.length > 10)
    return `${label.substring(0, start)}...${label.slice(end)}`;
  return label;
};

// export const shortenAddress = (label: string) => {
//   if (label?.length > 10)
//     return `${label.substring(0, 6)}...${label.slice(-4)}`;
//   return label;
// };
export const cleanParamObject = (obj: any) => {
  return pickBy(obj, (value) => value !== null && value !== "");
};
