import withClient from "@/helpers/with-client";
import { Image, ImageProps } from "antd";
import "./style.scss";

interface AppImageProps extends ImageProps {
  className?: string;
  alt?: string;
}

const AppImage = ({ className, alt, ...props }: AppImageProps) => {
  return (
    <Image
      rootClassName={`app-image ${className}`}
      alt={alt}
      preview={false}
      {...props}
    />
  );
};

export default withClient(AppImage);
