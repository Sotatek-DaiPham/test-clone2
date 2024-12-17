import AppDivider from "@/components/app-divider";
import AppInput from "@/components/app-input";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import NoData from "@/components/no-data";
import { EDirection, LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { IFollowerResponse } from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useDebounce from "@/hooks/useDebounce";
import useFollowUser from "@/hooks/useFollowUser";
import useWalletAuth from "@/hooks/useWalletAuth";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppSelector } from "@/libs/hooks";
import { getAPI } from "@/service";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import { useContext, useLayoutEffect, useState } from "react";
import TabTitle from "../../TabTitle";
import UserFollow from "../../UserFollow";
import { EFollow } from "../MyProfileTab";

const FollowersTab = ({ walletAddress }: { walletAddress: string }) => {
  const { error, success } = useContext(NotificationContext);
  const { searchParams } = useAppSearchParams("myProfile");
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });

  const { userId } = useAppSelector((state) => state.user);
  const [search, setSearch] = useState<string>("");

  const [followData, setFollowData] = useState<any>({});

  const debounceSearch = useDebounce(search, () =>
    setParams({ ...params, page: 1 })
  );
  const { accessToken } = useWalletAuth();

  const { data, isPending, refetch } = useQuery({
    queryKey: ["followers", params, debounceSearch, searchParams],
    queryFn: async () => {
      return getAPI(API_PATH.USER.FOLLOWERS, {
        params: {
          ...params,
          orderBy: "createdAt",
          direction: EDirection.DESC,
          walletAddress: walletAddress || null,
          keyword: debounceSearch?.trim() || null,
          viewerId: userId || null,
        },
      }) as Promise<AxiosResponse<BeSuccessResponse<IFollowerResponse[]>, any>>;
    },
    enabled: searchParams.tab === "followers",
  });

  const followers = get(data, "data.data", []) as IFollowerResponse[];
  const total = get(data, "data.metadata.total", 0) as number;

  useLayoutEffect(() => {
    if (searchParams.tab === "followers") {
      refetch();
    }
  }, [accessToken]);

  const { onFollow } = useFollowUser({
    onFollowSuccess: () => {
      success({
        message: `${
          followData?.isFollow === EFollow.FOLLOW ? "Follow" : "Unfollow"
        } successfully`,
      });
      refetch();
    },
    onFollowFailed: (message: string) => {
      error({
        message: `${
          followData?.isFollow === EFollow.FOLLOW ? "Follow" : "Unfollow"
        } failed`,
      });
    },
  });

  return (
    <div className="w-full h-full">
      <div className="w-full flex sm:flex-row flex-col sm:items-center justify-between">
        <TabTitle title="Followers" />
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
      ) : !followers?.length && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="my-6 grid sm:grid-cols-2 grid-cols-1 gap-6">
            {followers?.map((user: IFollowerResponse, index: number) => (
              <UserFollow
                data={user}
                key={index}
                onFollow={(data: any) => {
                  onFollow(data);
                  setFollowData(data?.payload);
                }}
              />
            ))}
          </div>
          <AppDivider />
          <AppPaginationCustom
            label="followers"
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

export default FollowersTab;
