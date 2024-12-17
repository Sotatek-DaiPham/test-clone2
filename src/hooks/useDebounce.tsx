import { useEffect, useState } from "react";

function useDebounce(value: any, setPage?: () => void, delay: number = 500) {
  const [valueInput, setValueInput] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setValueInput(value);
      setPage?.();
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return valueInput;
}

export default useDebounce;
