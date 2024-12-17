"use client";
import AppDivider from "@/components/app-divider";
import AppImage from "@/components/app-image";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import EllipsisTextWithTooltip from "@/components/app-tooltip/EllipsisTextWithTooltip";
import NoData from "@/components/no-data";
import { EDirection, EEventNoti, LIMIT_COIN_ITEMS_TABLE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { PATH_ROUTER } from "@/constant/router";
import { Information, INotificationResponse } from "@/entities/notification";
import { BeSuccessResponse } from "@/entities/response";
import { getTimeDDMMMYYYYHHMM } from "@/helpers/date-time";
import { convertNumber, nFormatter } from "@/helpers/formatNumber";
import isAuth from "@/helpers/isAuth";
import useDebounce from "@/hooks/useDebounce";
import useWindowSize from "@/hooks/useWindowSize";
import { getAPI } from "@/service";
import { ImageDefaultIcon } from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import { get } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TabTitle from "../_components/TabTitle";

const checkType = (type: string, data: Information) => {
  switch (type) {
    case EEventNoti.BUY:
      return (
        <>
          <span className="text-success-main mr-2">Bought</span>
          <span className="text-neutral-9">
            {nFormatter(
              convertNumber(data?.amount, get(data, "token.decimal", 0)),
              2
            )}
          </span>
          {get(data, "token.avatar", "") ? (
            <AppImage
              alt="avatar"
              src={get(data, "token.avatar", "")}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover overflow-hidden rounded-full mx-2"
            />
          ) : (
            <Image
              alt="avatar"
              src={ImageDefaultIcon}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover rounded-full mx-2"
            />
          )}
        </>
      );
    case EEventNoti.SELL:
      return (
        <>
          <span className="text-error-main mr-2">Sold</span>
          <span className="text-neutral-9">
            {nFormatter(
              convertNumber(data?.amount, get(data, "token.decimal", 0)),
              2
            )}
            &nbsp;Of&nbsp;
          </span>
          {get(data, "token.avatar", "") ? (
            <AppImage
              alt="avatar"
              src={get(data, "token.avatar", "")}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover overflow-hidden rounded-full mx-2"
            />
          ) : (
            <Image
              alt="avatar"
              src={ImageDefaultIcon}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover rounded-full mx-2"
            />
          )}
        </>
      );

    case EEventNoti.TOKEN_CREATED:
    case EEventNoti.TOKEN_LISTED:
      return (
        <>
          <span className="text-[var(--color-created-noti)]">
            {type === EEventNoti.TOKEN_CREATED
              ? "Created"
              : type === EEventNoti.TOKEN_LISTED
              ? "Listed"
              : "-"}
          </span>
          {get(data, "token.avatar", "") ? (
            <AppImage
              alt="avatar"
              src={get(data, "token.avatar", "")}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover overflow-hidden rounded-full mx-2"
            />
          ) : (
            <Image
              alt="avatar"
              src={ImageDefaultIcon}
              className="w-[24px] min-w-[24px] h-[24px] [&>img]:!object-cover rounded-full mx-2"
            />
          )}
        </>
      );
    default:
      break;
  }
};

const NotificationItem = ({ data }: { data: INotificationResponse }) => {
  const router = useRouter();
  const { isMobile } = useWindowSize();
  return (
    <div className="my-2">
      <div className="text-16px-bold flex flex-row items-center mt-3 mb-2">
        <EllipsisTextWithTooltip
          className="mr-2 cursor-pointer text-16px-bold text-neutral-9 hover:!underline"
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              PATH_ROUTER.USER_PROFILE(
                get(data, "information.walletAddress", "")
              )
            );
          }}
          value={get(data, "information.usernamme", "")}
          maxWidth={isMobile ? 70 : 200}
        />
        {checkType(get(data, "information.action", ""), data?.information)}
        <EllipsisTextWithTooltip
          className="mr-2 cursor-pointer text-16px-bold text-[var(--color-noti-token)] hover:!underline"
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              PATH_ROUTER.TOKEN_DETAIL(get(data, "information.token.id", 0))
            );
          }}
          value={get(data, "information.token.name", "-")}
          maxWidth={isMobile ? 100 : "100%"}
        />
      </div>
      <div className="text-12px-medium text-neutral-7 mb-3">
        {getTimeDDMMMYYYYHHMM(data?.createdAt)}
      </div>
      <AppDivider />
    </div>
  );
};

const NotificationPage = () => {
  const [params, setParams] = useState<any>({
    page: 1,
    limit: LIMIT_COIN_ITEMS_TABLE,
  });
  const [search, setSearch] = useState<string>("");
  const debounceSearch = useDebounce(search);

  const { data, isPending } = useQuery({
    queryKey: ["notification", params, debounceSearch],
    queryFn: async () => {
      return getAPI(API_PATH.USER.NOTIFICATION, {
        params: {
          ...params,
          keyword: debounceSearch?.trim() || null,
          orderBy: "createdAt",
          direction: EDirection.DESC,
        },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<INotificationResponse[]>, any>
      >;
    },
  });

  const notification = get(data, "data.data", []) as INotificationResponse[];
  const total = get(data, "data.metadata.total", 0) as number;

  return (
    <div className="m-auto max-w-[var(--width-content-sidebar-layout)] h-full">
      <div className="w-full flex sm:flex-row flex-col sm:items-center justify-between">
        <TabTitle title="Notification" />
        {/* <AppInput
          className="sm:!w-[400px] w-full h-[40px]"
          isSearch={true}
          iconPosition="left"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}
      </div>
      {isPending ? (
        <div className="!h-full w-full flex justify-center items-center mt-[-62px]">
          <Spin />
        </div>
      ) : !notification?.length && !isPending ? (
        <div className="!h-full w-full mt-[-62px]">
          <NoData />
        </div>
      ) : (
        <div>
          <div className="my-6 sm:w-[70%] w-full bg-neutral-2 p-6 rounded-3xl">
            {notification?.map((item: INotificationResponse, index: number) => (
              <NotificationItem data={item} key={index} />
            ))}
          </div>
          <AppPaginationCustom
            label="notifications"
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

export default isAuth(NotificationPage);
