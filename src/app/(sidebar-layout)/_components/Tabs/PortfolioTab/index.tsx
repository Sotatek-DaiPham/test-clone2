import AppButton from "@/components/app-button";
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
import { HideDustCoinIcon, ShowEyesIcon } from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProjectCard from "../../ProjectCard";
import TabTitle from "../../TabTitle";

const PortfolioTab = ({ walletAddress }: { walletAddress: string }) => {
  const { addEvent, isConnected, removeEvent } = useSocket();
  const [hideDustCoin, setHideDustCoin] = useState<boolean>(false);
  const { searchParams } = useAppSearchParams("myProfile");
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });

  const [search, setSearch] = useState<string>(searchParams.search || "");

  const debounceSearch = useDebounce(search, () =>
    setParams({ ...params, page: 1 })
  );

  const { data, isPending, refetch } = useQuery({
    queryKey: ["portfolio", params, debounceSearch, searchParams, hideDustCoin],
    queryFn: async () => {
      return getAPI(API_PATH.TOKEN.PORTFOLIO, {
        params: {
          ...params,
          orderBy: "valueEth",
          direction: EDirection.DESC,
          minAmountHeld: hideDustCoin ? 0.1 * (10 ^ 6) : null,
          walletAddress: walletAddress || null,
          keyword: debounceSearch?.trim() || null,
        },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<IProjectCardResponse[]>, any>
      >;
    },
    enabled: searchParams.tab === "portfolio",
  });

  const myPortfolio = get(data, "data.data", []) as IProjectCardResponse[];
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
        <TabTitle title="Portfolio" />
        <div className="flex sm:flex-row flex-col-reverse items-center">
          <AppButton
            size="middle"
            typeButton="outline"
            rootClassName="!w-fit !border-none"
            classChildren={`!flex !flex-row !items-center ${
              hideDustCoin ? "!text-primary-main" : ""
            }`}
            onClick={() => setHideDustCoin(!hideDustCoin)}
          >
            <Image
              src={hideDustCoin ? ShowEyesIcon : HideDustCoinIcon}
              alt="hide-coin"
            />
            <span className="ml-2">
              {hideDustCoin ? "Show Dust Token" : "Hide Dust Token"}
            </span>
          </AppButton>
          <AppInput
            className="sm:!w-[400px] w-full h-[40px] mb-2 sm:mb-0  sm:ml-4"
            isSearch={true}
            iconPosition="left"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {isPending ? (
        <div className="!h-full w-full flex justify-center items-center mt-[-62px]">
          <Spin />
        </div>
      ) : !myPortfolio?.length && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 my-9">
            {myPortfolio?.map(
              (project: IProjectCardResponse, index: number) => (
                <ProjectCard
                  className="pb-4"
                  data={project}
                  key={index}
                  footer={true}
                />
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
            onChange={(page, size) => {
              setParams((prev: any) => ({ ...prev, page, limit: size }));
            }}
          /> */}
        </div>
      )}
    </div>
  );
};

export default PortfolioTab;
