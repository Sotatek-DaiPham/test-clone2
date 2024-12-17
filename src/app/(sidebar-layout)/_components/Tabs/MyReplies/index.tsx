"use-client";
import AppButton from "@/components/app-button";
import AppDivider from "@/components/app-divider";
import AppImage from "@/components/app-image";
import AppInput from "@/components/app-input";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import EllipsisTextWithTooltip from "@/components/app-tooltip/EllipsisTextWithTooltip";
import NoData from "@/components/no-data";
import { EDirection, LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { PATH_ROUTER } from "@/constant/router";
import { IMyRepliesResponse } from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { getTimeDDMMMYYYYHHMM } from "@/helpers/date-time";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useDebounce from "@/hooks/useDebounce";
import { getAPI } from "@/service";
import { ArrowExport, ImageDefaultIcon } from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TabTitle from "../../TabTitle";

const ReplyItem = ({ data }: { data: IMyRepliesResponse }) => {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full bg-neutral-2 rounded-3xl px-6 py-4 text-neutral-9">
      <div className="flex flex-row gap-3">
        <div className="!min-w-[40px] !w-[40px] !h-[40px] overflow-hidden flex items-center justify-center rounded-full bg-primary-7">
          {data?.avatar ? (
            <AppImage
              className="!bg-neutral-4 !min-w-[40px] !w-[40px] !h-[40px] flex items-center justify-center rounded-full [&>img]:object-cover [&>img]:!w-full [&>img]:!h-full"
              src={data?.avatar}
              alt="logo"
            />
          ) : (
            <Image
              className="!bg-neutral-4 !min-w-[40px] !w-[40px] !h-[40px] [&>img]:!object-cover"
              alt="logo"
              src={ImageDefaultIcon}
            />
          )}
        </div>
        <div className="flex w-full flex-col grow max-w-[85%]">
          <div className="text-16px-bold">
            <EllipsisTextWithTooltip
              className="text-16px-bold text-neutral-9 hover:!underline cursor-pointer"
              value={data?.userName}
              maxWidth="100%"
            />
          </div>
          <span className="text-14px-normal text-neutral-7">
            {getTimeDDMMMYYYYHHMM(data?.createdAt)}
          </span>
        </div>
      </div>
      <div className="my-4 truncate-2-line text-14px-normal">
        {data?.content}
      </div>
      <AppButton
        size="small"
        typeButton="outline-primary"
        customClass="!w-fit !rounded-full"
        classChildren="!flex !flex-row !items-center !text-primary-main"
        onClick={() => {
          const query = `?replyId=${
            data?.replyId ? data?.replyId : data?.id
          }&replyUserId=${data?.replyUserId ? data?.replyUserId : data?.id}`;
          router.push(`${PATH_ROUTER.TOKEN_DETAIL(data?.tokenId)}${query}`, {
            scroll: true,
          });
        }}
      >
        <span className="mr-2">View in thread</span>
        <Image
          src={ArrowExport}
          alt="arrow-export"
          className="active-primary-icon"
        />
      </AppButton>
    </div>
  );
};

const MyRepliesTab = () => {
  const { searchParams, setSearchParams } = useAppSearchParams("myProfile");
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });
  const [search, setSearch] = useState<string>("");

  const debounceSearch = useDebounce(search, () =>
    setParams({ ...params, page: 1 })
  );

  const { data, isPending } = useQuery({
    queryKey: ["my-replies", params, debounceSearch, searchParams],
    queryFn: async () => {
      return getAPI(API_PATH.USER.MY_REPLIES, {
        params: {
          ...params,
          orderBy: "createdAt",
          direction: EDirection.DESC,
          keyword: debounceSearch?.trim() || null,
        },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<IMyRepliesResponse[]>, any>
      >;
    },
    enabled: searchParams.tab === "my-replies",
  });

  const myReplies = get(data, "data.data", []) as IMyRepliesResponse[];

  const total = get(data, "data.metadata.total", 0) as number;

  return (
    <div className="w-full h-full">
      <div className="w-full flex sm:flex-row flex-col sm:items-center justify-between">
        <TabTitle title="My replies" />
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
      ) : !myReplies?.length && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="my-6 grid sm:grid-cols-2 grid-cols-1 gap-6">
            {myReplies?.map((item: IMyRepliesResponse, index: number) => (
              <ReplyItem data={item} key={index} />
            ))}
          </div>
          <AppDivider />
          <AppPaginationCustom
            label="my replies"
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
            onChange={(page: any, size) =>
              setParams((prev: any) => ({ ...prev, page, limit: size }))
            }
          /> */}
        </div>
      )}
    </div>
  );
};

export default MyRepliesTab;
