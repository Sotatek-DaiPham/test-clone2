"use client";
import AppImage from "@/components/app-image";
import AppInput from "@/components/app-input";
import AppNumberToolTip from "@/components/app-number-tooltip";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import AppTable from "@/components/app-table";
import AppTooltip from "@/components/app-tooltip";
import EllipsisTextWithTooltip from "@/components/app-tooltip/EllipsisTextWithTooltip";
import NoData from "@/components/no-data";
import { LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { PATH_ROUTER } from "@/constant/router";
import { MyRankResponse } from "@/entities/leaderboard";
import { BeSuccessResponse } from "@/entities/response";
import { convertNumber } from "@/helpers/formatNumber";
import { shortenAddress } from "@/helpers/shorten";
import useDebounce from "@/hooks/useDebounce";
import useWalletAuth from "@/hooks/useWalletAuth";
import useWindowSize from "@/hooks/useWindowSize";
import { useAppSelector } from "@/libs/hooks";
import { getAPI } from "@/service";
import {
  ImageDefaultIcon,
  Top1Webp,
  TopLeaderBoardIcon,
  UserTop1,
  UserTop2,
  UserTop3,
} from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import { get } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import MyTopLine from "./components/MyTopLine";
import TopUser from "./components/TopUser";

const LeaderboardPage = () => {
  const { isMobile } = useWindowSize();
  const { address: userAddress } = useAccount();
  const { accessToken } = useWalletAuth();
  const { userId } = useAppSelector((state) => state.user);
  const router = useRouter();
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });
  const [search, setSearch] = useState<string>("");
  const debounceSearch = useDebounce(search);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["leader-board", params, debounceSearch],
    queryFn: async () => {
      return getAPI(API_PATH.TRADING.LEADERBOARD, {
        params: {
          ...params,
          keyword: debounceSearch?.trim() || null,
        },
      }) as Promise<AxiosResponse<BeSuccessResponse<MyRankResponse[]>, any>>;
    },
  });

  const leaderboardRes = get(data, "data.data", []) as MyRankResponse[];

  const total = get(data, "data.metadata.total", 0) as number;

  const topUser = useMemo(() => {
    if (debounceSearch?.trim() || params?.page > 1) {
      return leaderboardRes;
    } else {
      const data = [...leaderboardRes];
      return data?.slice(3);
    }
  }, [userId, debounceSearch, leaderboardRes]);

  const { data: myRank } = useQuery({
    queryKey: ["my-rank"],
    queryFn: async () => {
      return getAPI(API_PATH.TRADING.MY_RANK) as Promise<
        AxiosResponse<BeSuccessResponse<MyRankResponse>, any>
      >;
    },
    enabled: !!accessToken,
  });

  const myRankRes = get(myRank, "data.data", {}) as MyRankResponse;

  const columns = [
    {
      title: "Rank",
      dataIndex: "top",
      key: "top",
      width: "10%",
      render: (value: string, data: any) => {
        return (
          <div className="relative h-fit min-w-[110px] w-[110px]">
            <div className="relative h-fit w-fit">
              <Image
                src={TopLeaderBoardIcon}
                alt="top-leaderboard"
                className={
                  userAddress === data?.walletAddress && userId
                    ? "active-primary-icon"
                    : ""
                }
              />
              <span className="text-primary-main text-22px-bold absolute inset-0 flex items-center justify-center">
                {Number(value) > 500 ? "500+" : value}
              </span>
            </div>
            {userAddress === data?.walletAddress && userId && (
              <div className="absolute rounded-2xl px-[6px] right-0 top-0 leading-4 bg-[var(--color-primary-10)] text-primary-main text-[10px] font-bold">
                My Rank
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      width: "10%",
      render: (value: string, data: any) => {
        return (
          <div
            className="flex flex-row items-center w-fit cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(PATH_ROUTER.USER_PROFILE(data?.walletAddress));
            }}
          >
            {data?.avatar ? (
              <AppImage
                src={data?.avatar}
                alt="avatar"
                className="w-[40px] min-w-[40px] h-[40px] [&>img]:!object-cover rounded-full bg-primary-7 mr-3 flex overflow-hidden"
              />
            ) : (
              <Image
                alt="avatar"
                className="w-[40px] min-w-[40px] h-[40px] object-cover rounded-full bg-primary-7 mr-3 flex overflow-hidden"
                src={ImageDefaultIcon}
              />
            )}
            <EllipsisTextWithTooltip
              className="text-neutral-9 text-16px-normal"
              value={value}
              width={150}
              maxWidth="100%"
            />
          </div>
        );
      },
    },
    {
      title: "Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      width: "15%",
      render: (value: string, data: any) => {
        return (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              router.push(PATH_ROUTER.USER_PROFILE(data?.walletAddress));
            }}
          >
            <AppTooltip title={value}>{shortenAddress(value)}</AppTooltip>
          </div>
        );
      },
    },
    // {
    //   title: "Profit and loss",
    //   dataIndex: "pal",
    //   key: "pal",
    //   sorter: true,
    //   width: "15%",
    //   render: (value: string, data: any) => {
    //     return <span>{formatAmount(value)}</span>;
    //   },
    // },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: "15%",
      render: (value: string, data: any) => {
        return (
          <span>
            <AppNumberToolTip
              value={convertNumber(value)}
              isNoFormatterKMB={true}
            />
          </span>
        );
      },
    },
    {
      title: "Buy",
      dataIndex: "buy",
      key: "buy",
      width: "15%",
      render: (value: string, data: any) => {
        return (
          <span className="text-success-main">
            <AppNumberToolTip
              value={convertNumber(value)}
              isNoFormatterKMB={true}
            />
          </span>
        );
      },
    },
    {
      title: "Sell",
      dataIndex: "sell",
      key: "sell",
      width: "15%",
      render: (value: string, data: any) => {
        return (
          <span className="text-error-main">
            <AppNumberToolTip
              value={convertNumber(value)}
              isNoFormatterKMB={true}
            />
          </span>
        );
      },
    },
  ];

  return (
    <div className="m-auto max-w-[var(--width-content-sidebar-layout)] h-full">
      {isMobile && (
        <div className="text-20px-bold text-white-neutral mb-4">
          RainPump Leaderboard
        </div>
      )}
      {!debounceSearch?.trim() && (
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6 mb-6">
          {isMobile && leaderboardRes?.length > 0 && (
            <TopUser
              image={Top1Webp}
              top1={true}
              className="!bg-gradient-to-b from-[var(--color-top-1-from)] to-[var(--color-top-1-to)]"
              data={leaderboardRes[0]}
            />
          )}
          {leaderboardRes?.length > 1 && (
            <TopUser
              image={UserTop2}
              className="!bg-gradient-to-b from-[var(--color-top-2-from)] to-[var(--color-top-2-to)]"
              data={leaderboardRes[1]}
            />
          )}
          {!isMobile && leaderboardRes?.length > 0 && (
            <TopUser
              image={UserTop1}
              top1={true}
              className="!bg-gradient-to-b from-[var(--color-top-1-from)] to-[var(--color-top-1-to)]"
              data={leaderboardRes[0]}
            />
          )}
          {leaderboardRes?.length > 2 && (
            <TopUser
              image={UserTop3}
              className="!bg-gradient-to-b from-[var(--color-top-3-from)] to-[var(--color-top-3-to)]"
              data={leaderboardRes[2]}
            />
          )}
        </div>
      )}
      <div
        className={`w-full flex sm:flex-row flex-col items-center ${
          userId && !debounceSearch?.trim() && leaderboardRes?.length > 0
            ? "justify-between"
            : "justify-end"
        }`}
      >
        {userId && !debounceSearch?.trim() && leaderboardRes?.length > 0 && (
          <MyTopLine data={myRankRes} />
        )}
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
      ) : leaderboardRes?.length < 3 && !debounceSearch && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="my-6">
            <AppTable
              className="leaderboard-app-table"
              loading={false}
              columns={columns}
              dataSource={topUser}
              pagination={false}
              rowKey="id"
            />
          </div>
          <AppPaginationCustom
            label="users"
            total={total}
            page={params?.page}
            limit={params?.limit}
            onChange={(page) => setParams({ ...params, page })}
            hideOnSinglePage={true}
          />
        </div>
      )}
      {/* <AppPagination
        className="w-full !justify-end !mr-6"
        hideOnSinglePage={true}
        showTotal={(total, range) => (
          <ShowingPage total={total} range={range} />
        )}
        current={params?.page}
        pageSize={params?.limit}
        total={18}
        onChange={(page, size) => {
          setParams((prev: any) => ({ ...prev, page, limit: size }));
        }}
      /> */}
    </div>
  );
};

export default LeaderboardPage;
