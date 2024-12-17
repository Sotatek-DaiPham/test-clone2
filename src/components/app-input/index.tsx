import { SearchIcon } from "@public/assets";
import { Input, InputProps } from "antd";
import { TextAreaProps } from "antd/es/input";
import Image from "next/image";
import "./style.scss";

interface IAppInputProps extends InputProps {
  className?: string;
  isSearch?: boolean;
  iconPosition?: "left" | "right";
}

const AppInput = ({
  className,
  isSearch,
  iconPosition = "left",
  ...restProps
}: IAppInputProps) => {
  const searchIcon = isSearch ? <Image src={SearchIcon} alt="search" /> : null;

  return (
    <Input
      className={`app-input ${className || ""}`}
      suffix={isSearch && iconPosition === "right" ? searchIcon : null}
      prefix={isSearch && iconPosition === "left" ? searchIcon : null}
      {...restProps}
    />
  );
};

AppInput.TextArea = (props: TextAreaProps) => (
  <Input.TextArea
    className="app-input scroll-text-area"
    {...props}
    onInput={(e) => {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = "88px";
      target.style.height = target.scrollHeight + "px";
    }}
  />
);

export default AppInput;
