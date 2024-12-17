import { Checkbox, CheckboxProps } from "antd";
import withClient from "@/helpers/with-client";
import "./style.scss";

interface AppCheckboxProps extends CheckboxProps {
  className?: string;
  label?: string;
}

const AppCheckbox = ({
  className,
  label,
  children,
  ...props
}: AppCheckboxProps) => {
  return (
    <Checkbox rootClassName={`app-checkbox ${className}`} {...props}>
      <span
        className={`${
          props.disabled ? "text-text-disable" : "text-text-primary-2"
        } checkbox-label`}
      >
        {label || children}
      </span>
    </Checkbox>
  );
};

export default withClient(AppCheckbox);
