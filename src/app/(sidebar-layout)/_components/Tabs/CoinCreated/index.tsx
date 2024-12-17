import AppDivider from "@/components/app-divider";
import AppInput from "@/components/app-input";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import NoData from "@/components/no-data";
import { EDirection, LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { IProjectCardResponse } from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useDebounce from "@/hooks/useDebounce";
import useSocket from "@/hooks/useSocket";
import { ESocketEvent } from "@/libs/socket/constants";
import { getAPI } from "@/service";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import { useEffect, useState } from "react";
import ProjectCard from "../../ProjectCard";
import TabTitle from "../../TabTitle";

const CoinCreatedTab = ({ walletAddress }: { walletAddress: string }) => {
  const { addEvent, isConnected, removeEvent } = useSocket();
  const { searchParams } = useAppSearchParams("myProfile");
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });
  const [search, setSearch] = useState<string>("");

  const debounceSearch = useDebounce(search, () =>
    setParams({ ...params, page: 1 })
  );

  const { data, isPending, refetch } = useQuery({
    queryKey: ["coin-created", params, debounceSearch, searchParams],
    queryFn: async () => {
      return getAPI(API_PATH.TOKEN.COINS_CREATED, {
        params: {
          ...params,
          orderBy: "createdAt",
          direction: EDirection.DESC,
          walletAddress: walletAddress || null,
          keyword: debounceSearch?.trim() || null,
        },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<IProjectCardResponse[]>, any>
      >;
    },
    enabled: searchParams.tab === "coin-created",
  });

  const coinCreated = get(data, "data.data", []) as IProjectCardResponse[];
  const total = get(data, "data.metadata.total", 0) as number;

  useEffect(() => {
    if (isConnected) {
      addEvent(ESocketEvent.BUY, (data) => {
        if (data) {
          refetch();
        }
      });
      addEvent(ESocketEvent.SELL, (data) => {
        if (data) {
          refetch();
        }
      });
    }
    return () => {
      removeEvent(ESocketEvent.BUY);
      removeEvent(ESocketEvent.SELL);
    };
  }, [isConnected]);

  return (
    <div className="w-full h-full">
      <div className="w-full flex sm:flex-row flex-col sm:items-center justify-between">
        <TabTitle title="Token created" />
        <AppInput
          className="sm:!w-[400px] w-full h-[40px]"
          isSearch={true}
          iconPosition="left"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isPending ? (
        <div className="!h-full w-full flex justify-center items-center mt-[-62px]">
          <Spin />
        </div>
      ) : !coinCreated?.length && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 my-9">
            {coinCreated?.map(
              (project: IProjectCardResponse, index: number) => (
                <ProjectCard data={project} key={index} />
              )
            )}
          </div>
          <AppDivider />
          <AppPaginationCustom
            label="tokens"
            total={total}
            page={params?.page}
            limit={params?.limit}
            onChange={(page) => setParams({ ...params, page })}
            hideOnSinglePage={true}
          />
          {/* <AppPagination
            className="w-full !justify-end !mr-6"
            hideOnSinglePage={true}
            showTotal={(total, range) => (
              <ShowingPage total={total} range={range} />
            )}
            current={params?.page}
            pageSize={params?.limit}
            total={total}
            onChange={(page, size) =>
              setParams((prev: any) => ({ ...prev, page, limit: size }))
            }
          /> */}
        </div>
      )}
    </div>
  );
};

export default CoinCreatedTab;
