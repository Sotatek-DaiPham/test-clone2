import withClient from "@/helpers/with-client";
import { Loading3QuartersOutlined } from "@ant-design/icons";

type Props = {
  className?: string;
  sizeIcon?: number;
};
const AppLoading = (props: Props) => {
  const { className, sizeIcon } = props;

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <Loading3QuartersOutlined
        style={{
          fontSize: sizeIcon || 50,
          color: "var(--color-text-primary-1)",
        }}
        spin
      />
    </div>
  );
};

export default withClient(AppLoading);
