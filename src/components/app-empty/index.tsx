import EmptyIcon from "@/assets/icons/empty-icon.svg";

interface IAppEmpty {
  emptyIcon?: any;
  title?: string;
  description?: string;
  className?: string;
  classNameImage?: string;
  classnameDescription?: string;
}

const AppEmpty = ({
  title,
  description,
  className = "",
  classNameImage,
  classnameDescription = "",
  emptyIcon = (
    <div className={classNameImage}>
      <EmptyIcon />
    </div>
  ),
}: IAppEmpty) => {
  return (
    <div
      className={`flex flex-col flex-1 h-full gap-[12px] items-center justify-center ${className}`}
    >
      {emptyIcon}
      {title && (
        <p className="text-text-primary-2 text-[14px] font-bold">{title}</p>
      )}
      {description && (
        <p
          className={`text-base-0 text-[14px] text-center text-text-secondary ${classnameDescription}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default AppEmpty;
