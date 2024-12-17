import { Button, ButtonProps } from "antd";
import "./styles.scss";

export interface IButtonOutlinedProps extends ButtonProps {
  buttonType?: "primary" | "secondary";
  scale?: "large" | "medium" | "small";
  fullWidth?: boolean;
}

const ButtonOutlined: React.FC<IButtonOutlinedProps> = ({
  className,
  children,
  buttonType = "primary",
  scale = "medium",
  fullWidth,
  ...props
}) => {
  return (
    <Button
      className={`btn-outlined btn-outlined--${buttonType} btn-outlined--${scale} ${
        fullWidth ? "btn-outlined--full-width" : ""
      } ${className || ""}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonOutlined;
