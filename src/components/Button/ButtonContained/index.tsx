import { Button, ButtonProps } from "antd";
import "./styles.scss";

export interface IButtonContainedProps extends ButtonProps {
  buttonType?: "primary" | "secondary";
  scale?: "large" | "medium" | "small";
  fullWidth?: boolean;
}

const ButtonContained: React.FC<IButtonContainedProps> = ({
  className,
  children,
  buttonType = "primary",
  scale = "medium",
  fullWidth,
  ...props
}) => {
  return (
    <Button
      className={`btn-contained btn-contained--${buttonType} btn-contained--${scale} ${
        fullWidth ? "btn-contained--full-width" : ""
      } ${className || ""}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonContained;
