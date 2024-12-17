import clsx from "clsx";

const AppAmountSelect = ({
  numbers,
  onSelect,
  customClass,
}: {
  numbers: string[];
  onSelect: (value: string) => void;
  customClass?: string;
}) => {
  return (
    <div className={clsx("flex gap-3 flex-wrap", customClass ?? "")}>
      {numbers.map((num, index) => (
        <button
          key={index}
          className="px-3 py-[6px] bg-neutral-3 text-neutral-9 rounded-[6px] hover:bg-gray-600 flex-1 h-8"
          onClick={() => onSelect(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default AppAmountSelect;
