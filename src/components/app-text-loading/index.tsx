import { Skeleton } from "antd";
import "./styles.scss";

interface Props {
  loading: boolean;
  text: React.ReactNode;
  className?: string;
}

const AppTextLoading = ({ loading, text, className }: Props) => {
  return (
    <>
      {loading ? (
        <Skeleton.Button active className="app-text-loading" />
      ) : (
        <span className={className}>{text}</span>
      )}
    </>
  );
};

export default AppTextLoading;
