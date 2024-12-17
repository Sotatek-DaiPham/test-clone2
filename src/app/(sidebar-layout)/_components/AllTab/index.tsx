import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import NoData from "@/components/no-data";
import { LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { ITokenDashboardResponse } from "@/entities/dashboard";
import { BeSuccessResponse } from "@/entities/response";
import { getAge, getAgeType } from "@/helpers/date-time";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useDebounce from "@/hooks/useDebounce";
import useSocket from "@/hooks/useSocket";
import { ESocketEvent } from "@/libs/socket/constants";
import { getAPI } from "@/service";
import {
  DollarCircleUpIcon,
  DropdownIcon,
  FinalizedIcon,
  NewSpaperIcon,
  TopIcon,
  TrendUpIcon,
  UsersIcon,
} from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import { get } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import FilterTerminal from "../FilterTerminal";
import ProjectCard from "../ProjectCard";

const FILTER_TERMINAL = [
  {
    label: "Trending",
    value: "trending",
    icon: TrendUpIcon,
  },
  {
    label: "Top",
    value: "top",
    icon: TopIcon,
    children: [
      // {
      //   label: "Progress",
      //   value: "progress",
      // },
      {
        label: "Volume",
        value: "volume",
      },
      {
        label: "Txns",
        value: "txns",
      },
    ],
  },
  {
    label: "Rising",
    value: "rasing",
    icon: DollarCircleUpIcon,
    // children: [
    //   {
    //     label: "5M",
    //     value: "5m",
    //   },
    //   {
    //     label: "1H",
    //     value: "1h",
    //   },
    //   {
    //     label: "6H",
    //     value: "6h",
    //   },
    //   {
    //     label: "24H",
    //     value: "24h",
    //   },
    // ],
  },
  {
    label: "New",
    value: "new",
    icon: NewSpaperIcon,
  },
  {
    label: "Finalized",
    value: "finalize",
    icon: FinalizedIcon,
    // children: [
    //   {
    //     label: "Trending",
    //     value: "treding",
    //   },
    //   {
    //     label: "Newest",
    //     value: "newest",
    //   },
    //   {
    //     label: "Top Mcap",
    //     value: "top-mcap",
    //   },
    //   {
    //     label: "Oldest",
    //     value: "oldest",
    //   },
    // ],
  },
  {
    label: "Age",
    value: "age",
    icon: UsersIcon,
    children: [
      { key: "", label: "Any" },
      { key: "less15M", label: "≤15m" },
      { key: "less30M", label: "≤30m" },
      { key: "less1H", label: "≤1h" },
      { key: "less3H", label: "≤3h" },
      { key: "less6H", label: "≤6h" },
      { key: "less12H", label: "≤12h" },
      { key: "less24H", label: "≤24h" },
      { key: "less3D", label: "≤3d" },
    ],
    children1: [
      { key: "bigger15M", label: "≥15m" },
      { key: "bigger30M", label: "≥30m" },
      { key: "bigger1H", label: "≥1h" },
      { key: "bigger3H", label: "≥3h" },
      { key: "bigger6H", label: "≥6h" },
      { key: "bigger12H", label: "≥12h" },
      { key: "bigger24H", label: "≥24h" },
      { key: "bigger3D", label: "≥3d" },
    ],
  },
  {
    label: "Min progress",
    value: "minProgress",
    icon: DropdownIcon,
    children: [
      { key: "", label: "Any" },
      { key: "10", label: "10%" },
      { key: "25", label: "25%" },
      { key: "50", label: "50%" },
      { key: "75", label: "75%" },
      { key: "90", label: "90%" },
    ],
  },
  {
    label: "Max progress",
    value: "maxProgress",
    icon: DropdownIcon,
    children: [
      { key: "", label: "Any" },
      { key: "10", label: "10%" },
      { key: "25", label: "25%" },
      { key: "50", label: "50%" },
      { key: "75", label: "75%" },
      { key: "90", label: "90%" },
    ],
  },
];

const AllTab = () => {
  const { isConnected, socket } = useSocket();
  const [search, setSearch] = useState<string>("");
  const { searchParams, setSearchParams } = useAppSearchParams("terminal");

  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });

  const debounceSearch = useDebounce(search);

  const paramsAPI = useMemo(() => {
    return {
      ...params,
      keyword: debounceSearch?.trim() || null,
      typeFilterAge: getAgeType(searchParams?.age) || null,
      age: getAge(searchParams?.age) || null,
      minProgress: searchParams?.minProgress || null,
      maxProgress: searchParams?.maxProgress || null,
      mainFilterToken:
        searchParams?.filter === "top" && searchParams?.top === "volume"
          ? "TOP_VOLUME"
          : searchParams.top === "txns"
          ? "TOP_TRANSACTION"
          : searchParams?.filter?.toUpperCase() || "TRENDING",
    };
  }, [
    params,
    debounceSearch,
    searchParams.filter,
    searchParams.top,
    searchParams.age,
    searchParams.minProgress,
    searchParams.maxProgress,
  ]);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["all-tab", paramsAPI],
    queryFn: async () => {
      return getAPI(API_PATH.TOKEN.LIST, {
        params: { ...paramsAPI },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<ITokenDashboardResponse[]>, any>
      >;
    },
    enabled: !searchParams.tab ? true : searchParams.tab === "all",
  });

  const tokenList = get(data, "data.data", []) as ITokenDashboardResponse[];

  const total = get(data, "data.metadata.total", 0) as number;

  const handleClickFilter = useCallback(
    (value: any, queryKey: string, subValue?: any, subQueryKey?: any) => {
      const newParams = {
        tab: searchParams.tab ?? "all",
        age: searchParams?.age ?? "",
        minProgress: searchParams?.minProgress ?? "",
        maxProgress: searchParams?.maxProgress ?? "",
      };
      setSearchParams({
        ...newParams,
        [queryKey]: value,
        ...(subValue &&
          subQueryKey && {
            [subQueryKey]: subValue,
          }),
      });
    },
    [searchParams, setSearchParams]
  );

  const handleClickFilterOption = useCallback(
    (value: any, queryKey: string) => {
      setSearchParams({
        ...searchParams,
        [queryKey]: value,
      });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (isConnected) {
      socket?.on(ESocketEvent.BUY, () => {
        refetch();
      });
      socket?.on(ESocketEvent.SELL, () => {
        refetch();
      });
    }
  }, [isConnected]);

  return (
    <div>
      <FilterTerminal
        search={search}
        onChangeSearch={(e) => {
          setSearch(e);
          setParams({ ...params, page: 1 });
        }}
        filterArr={FILTER_TERMINAL}
        searchParams={searchParams}
        handleClickFilter={handleClickFilter}
        handleClickFilterOption={handleClickFilterOption}
      />
      {isPending ? (
        <Spin />
      ) : !tokenList?.length && !isPending ? (
        <div className="mt-14">
          <NoData></NoData>
        </div>
      ) : (
        <div>
          <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 my-9">
            {tokenList?.map(
              (project: ITokenDashboardResponse, index: number) => (
                <ProjectCard data={project} key={index} />
              )
            )}
          </div>
          <AppPaginationCustom
            label="tokens"
            total={total}
            page={params?.page}
            limit={params?.limit}
            onChange={(page) => setParams({ ...params, page })}
            hideOnSinglePage={true}
          />
          {/* {baseData?.length < total && (
            <div className="w-full flex justify-center mt-2">
              <AppButton
                customClass="!w-[200px]"
                loading={isPending}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
              >
                Load more
              </AppButton>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default AllTab;
