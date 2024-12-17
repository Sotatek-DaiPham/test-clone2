//@ts-nocheck

import { SEARCH_PARAMS, TypeSearchParams } from "@/constant/search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useMemo } from "react";

export function useAppSearchParams<K extends keyof typeof SEARCH_PARAMS>(
  key: K,
  isReloadResetToDefault = false
) {
  const searchParams = useSearchParams();

  const router = useRouter();
  const pathname = usePathname();

  const addQueryParam = (value) => {
    const params = new URLSearchParams(value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const memoSearchParams = useMemo(() => {
    return queryString.parse(searchParams?.toString());
  }, [searchParams]);

  const updateSearchParams = (
    params: Partial<Record<TypeSearchParams<typeof key>, string>>
  ) => {
    const newParams = { ...memoSearchParams, ...params };
    addQueryParam(newParams);
  };

  return {
    searchParams: memoSearchParams as Record<
      TypeSearchParams<typeof key>,
      string
    >,
    setSearchParams: addQueryParam,
    updateSearchParams,
  };
}
