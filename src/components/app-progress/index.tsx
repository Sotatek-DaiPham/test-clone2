import { CSSProperties } from "react";
import "./style.scss";

const AppProgress = ({
  percent,
  strokeColor,
  styles,
}: {
  percent: number;
  strokeColor: string;
  styles?: CSSProperties;
}) => {
  return (
    <div className="app-progress" style={{ ...styles }}>
      <div
        className="app-progress__bar"
        style={{
          backgroundColor: `${strokeColor}`,
          width: `${percent}%`,
        }}
      />
    </div>
  );
};

export default AppProgress;
