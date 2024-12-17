import AppTooltip from "../app-tooltip";

interface AppTruncateTextProps {
  text: string;
  maxLength?: number;
}

const AppTruncateText: React.FC<AppTruncateTextProps> = ({
  text,
  maxLength = 6,
}) => {
  return (
    <>
      {text && text.length > maxLength ? (
        <AppTooltip title={text}>{text.slice(0, maxLength)}...</AppTooltip>
      ) : (
        text
      )}
    </>
  );
};

export default AppTruncateText;
