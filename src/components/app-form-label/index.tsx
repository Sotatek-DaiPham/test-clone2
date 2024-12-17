import { Flex, Tooltip, TooltipProps } from "antd";

interface Props {
  label: string;
  isRequired?: boolean;
  className?: string;
  tooltipInfo?: {
    title: React.ReactNode;
    tooltipIconProps?: React.SVGProps<SVGSVGElement>;
    tooltipProps?: TooltipProps;
  };
}

const FormItemLabel = ({
  label,
  className,
  isRequired,
  tooltipInfo,
}: Props) => {
  return (
    <Flex
      align="center"
      gap={4}
      className={`text-neutral-7 text-14px-medium ${className ?? ""}`}
    >
      {label} {isRequired ? <span className="text-error-main">*</span> : ""}
      {tooltipInfo ? (
        <Tooltip title={tooltipInfo?.title} {...tooltipInfo.tooltipProps} />
      ) : null}
    </Flex>
  );
};

export default FormItemLabel;
