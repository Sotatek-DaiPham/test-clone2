import { TooltipIcon } from "@public/assets";
import { Tooltip } from "antd";
import { TooltipPropsWithOverlay } from "antd/es/tooltip";
import Image from "next/image";

interface ITooltipProps extends TooltipPropsWithOverlay {
  overlayClassName?: string;
  isShowIcon?: boolean;
}

const AppTooltip = ({
  children,
  isShowIcon = false,
  ...props
}: ITooltipProps) => {
  return (
    <Tooltip
      overlayClassName={`app-tooltip app-tooltip-ellipsis ${props.overlayClassName || ""}`}
      {...props}
    >
      {isShowIcon ? <Image src={TooltipIcon} alt="tooltip-icon" /> : children}
    </Tooltip>
  );
};

export default AppTooltip;
