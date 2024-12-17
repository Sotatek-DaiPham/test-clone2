import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import EllipsisTextWithTooltip from "@/components/app-tooltip/EllipsisTextWithTooltip";
import NoData from "@/components/no-data";
import { EDirection } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { PATH_ROUTER } from "@/constant/router";
import { ITokenDashboardResponse } from "@/entities/dashboard";
import {
  convertNumber,
  formatAmount,
  nFormatter,
} from "@/helpers/formatNumber";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useDebounce from "@/hooks/useDebounce";
import { getAPI } from "@/service";
import { DollarCircleUpIcon, TrendUpIcon } from "@public/assets";
import { Spin } from "antd";
import get from "lodash/get";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import FilterTerminal from "../FilterTerminal";
import ProjectCard from "../ProjectCard";
import { debounce } from "lodash";

const FILTER_TERMINAL = [
  {
    label: "Activities",
    value: "activity",
    icon: TrendUpIcon,
  },
  {
    label: "Created Tokens",
    value: "created",
    icon: DollarCircleUpIcon,
  },
];

const FollowingTab = () => {
  const [search, setSearch] = useState<string>("");
  const { searchParams, setSearchParams } = useAppSearchParams("terminal");
  const router = useRouter();
  const [data, setData] = useState<ITokenDashboardResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isPending, setIsPending] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    page: 1,
    limit: 100,
  });

  const debounceSearch = useDebounce(search);

  const paramsAPI = useMemo(() => {
    return {
      ...params,
      orderBy: "createdAt",
      direction: EDirection.DESC,
      keyword: debounceSearch?.trim() || null,
    };
  }, [debounceSearch, params]);

  const fetchActivityTab = useCallback(async () => {
    try {
      setIsPending(true);
      await getAPI(API_PATH.TRADING.ACTIVITY, {
        params: {
          ...paramsAPI,
        },
      })
        .then((data) => {
          setIsPending(false);
          const tokenList = get(
            data,
            "data.data",
            []
          ) as ITokenDashboardResponse[];
          const total = get(data, "data.metadata.total", 0) as number;
          setData(tokenList);
          setTotal(total);
        })
        .catch(() => {
          setIsPending(false);
        });
    } catch (error) {}
  }, [debounceSearch?.trim()]);

  const fetchCreatedTab = useCallback(async () => {
    try {
      setIsPending(true);
      await getAPI(API_PATH.TOKEN.FOLLOWING_TOKEN_CREATED, {
        params: {
          ...paramsAPI,
        },
      })
        .then((data) => {
          setIsPending(false);
          const tokenList = get(
            data,
            "data.data",
            []
          ) as ITokenDashboardResponse[];
          const total = get(data, "data.metadata.total", 0) as number;
          setData(tokenList);
          setTotal(total);
        })
        .catch(() => {
          setIsPending(false);
        });
    } catch (error) {}
  }, [debounceSearch?.trim()]);

  useLayoutEffect(() => {
    if (searchParams?.filter === "created") {
      fetchCreatedTab();
    }
    if (searchParams?.filter === "activity") {
      fetchActivityTab();
    }
  }, [searchParams?.filter, fetchCreatedTab, fetchActivityTab]);

  const handleClickFilter = useCallback(
    (value: any, queryKey: string) => {
      setData([]);
      setTotal(0);
      setSearchParams({
        ...searchParams,
        [queryKey]: value,
      });
    },
    [searchParams, setSearchParams]
  );

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
        handleClickFilterOption={handleClickFilter}
      />
      {isPending ? (
        <Spin />
      ) : !data?.length && !isPending ? (
        <div className="mt-14">
          <NoData></NoData>
        </div>
      ) : (
        <div>
          <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 my-9">
            {data?.map((project: any, index: number) => (
              <ProjectCard
                data={{
                  ...project,
                  avatar: project?.avatar || project?.tokenAvatar,
                  id: project?.id || project?.tokenId,
                }}
                key={index}
                header={
                  searchParams?.filter === "created" ? null : (
                    <div className="mb-3 flex-row flex items-center">
                      <EllipsisTextWithTooltip
                        className="mr-1 cursor-pointer text-neutral-7 hover:!underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            PATH_ROUTER.USER_PROFILE(project?.walletAddress)
                          );
                        }}
                        value={project?.username}
                        maxWidth={100}
                      />
                      <div
                        className={
                          project?.action === "BUY"
                            ? "text-success-main"
                            : project?.action === "SELL"
                            ? "text-error-main"
                            : ""
                        }
                      >
                        {project?.action === "BUY"
                          ? "bought"
                          : project?.action === "SELL"
                          ? "sold"
                          : "-"}
                      </div>
                      <div className="mx-1">
                        {nFormatter(
                          convertNumber(project?.amount, project?.decimal)
                        ) || "-"}
                        &nbsp;
                        {project?.symbol}
                      </div>
                      <div className="text-14px-normal">for</div>
                      <div className="mx-1">
                        {nFormatter(convertNumber(project?.ethAmount)) || "-"}
                        &nbsp;ETH
                      </div>
                    </div>
                  )
                }
              />
            ))}
          </div>
          <AppPaginationCustom
            label="tokens"
            total={total}
            page={params?.page}
            limit={params?.limit}
            onChange={(page) => setParams({ ...params, page })}
            hideOnSinglePage={true}
          />
        </div>
      )}
    </div>
  );
};

export default FollowingTab;
