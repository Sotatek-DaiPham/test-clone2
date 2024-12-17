import {
  formatAmount,
  nFormatter,
  nFormatterVer2,
} from "@/helpers/formatNumber";
import React from "react";
import AppTooltip from "../app-tooltip";

interface IAppNumberToolTipProps {
  value: number | string;
  decimal?: number;
  isFormatterK?: boolean;
  isNoFormatterKMB?: boolean;
}
const AppNumberToolTip: React.FC<IAppNumberToolTipProps> = ({
  value,
  decimal = 2,
  isFormatterK = true,
  isNoFormatterKMB = false,
}: IAppNumberToolTipProps) => {
  const checkShowToolTip = () => {
    const numberDecimal = value?.toString()?.split(".")[1]?.length;
    if (
      Number(value) > 1e3 ||
      (value?.toString()?.includes(".") && numberDecimal > decimal)
    ) {
      return value;
    } else {
      return null;
    }
  };

  return (
    <AppTooltip title={checkShowToolTip()}>
      {isNoFormatterKMB
        ? formatAmount(value)
        : isFormatterK
        ? nFormatterVer2(value)
        : nFormatter(value, decimal)}
    </AppTooltip>
  );
};

export default AppNumberToolTip;
