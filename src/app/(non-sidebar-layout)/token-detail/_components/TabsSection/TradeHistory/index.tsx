import DatePickerModal from "@/components/app-modal/app-date-picker-modal";
import AppNumberToolTip from "@/components/app-number-tooltip";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import AppTable from "@/components/app-table";
import AppTruncateText from "@/components/app-truncate-text";
import {
  ETradeAction,
  LIMIT_COIN_ITEMS_TABLE,
  TOKEN_DECIMAL,
  NATIVE_TOKEN_DECIMAL,
} from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { envs } from "@/constant/envs";
import { PATH_ROUTER } from "@/constant/router";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { getTimeDDMMMYYYYHHMM } from "@/helpers/date-time";
import { cleanParamObject } from "@/helpers/shorten";
import useSocket from "@/hooks/useSocket";
import { IMetaData } from "@/interfaces";
import {
  IGetTradeHistoryParams,
  ISocketData,
  ITradeHistoryRes,
} from "@/interfaces/token";
import { ESocketEvent } from "@/libs/socket/constants";
import { getAPI } from "@/service";
import { ArrowExport, TableFilterIcon } from "@public/assets";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "antd";
import { useForm } from "antd/es/form/Form";
import { ColumnType } from "antd/es/table";
import BigNumber from "bignumber.js";
import { get } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./styles.scss";

const TradeHistory = () => {
  const queryClient = useQueryClient();
  const { tokenDetail } = useTokenDetail();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<{
    page: number;
    action: string;
    startDate: string;
    endDate: string;
  }>({
    page: 1,
    action: "",
    startDate: "",
    endDate: "",
  });
  const { isConnected, socket } = useSocket();
  const [filters, setFilters] = useState<string[]>([]);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [form] = useForm<{
    startDate: string;
    endDate: string;
  }>();
  const { data, refetch, isFetching } = useQuery({
    queryFn: () => {
      return getAPI(API_PATH.TOKEN.TRADING_HISTORIES, {
        params: cleanParamObject({
          tokenAddress: tokenDetail?.contractAddress,
          page: searchParams.page,
          limit: LIMIT_COIN_ITEMS_TABLE,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          action: filters.length > 1 ? "" : filters[0],
          orderBy: "created_at",
          direction: "DESC",
        } as IGetTradeHistoryParams),
      });
    },
    select(data) {
      return data;
    },
    queryKey: [
      API_PATH.TOKEN.TRADING_HISTORIES,
      searchParams,
      tokenDetail?.contractAddress,
      filters,
    ],
    enabled: !!tokenDetail?.contractAddress,
  });

  const metadata = get(data, "data.metadata") as IMetaData;

  const listData = get(data, "data.data", []) as ITradeHistoryRes[];

  const columns: ColumnType<any>[] = [
    {
      title: "Type",
      dataIndex: "action",
      key: "action",
      render(value, record, index) {
        return value === ETradeAction.BUY ? (
          <div className="rounded-2xl bg-[rgba(15,190,90,0.2)] px-3 text-[#0FBE5A] text-16px-normal w-fit">
            Buy
          </div>
        ) : (
          <div className="rounded-2xl bg-[rgba(235,81,70,0.20)] px-3 text-error-main text-16px-normal w-fit">
            Sell
          </div>
        );
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        return (
          <div className="table-filter-dropdown">
            <Checkbox.Group
              options={[
                { label: "Buy", value: ETradeAction.BUY },
                { label: "Sell", value: ETradeAction.SELL },
              ]}
              rootClassName="custom-filter-checkbox"
              value={filters}
              onChange={(checkedValues) => {
                setFilters(checkedValues as string[]);
                setSelectedKeys(checkedValues as string[]);
              }}
            />
          </div>
        );
      },
      filteredValue: filters,
      filterIcon(filtered) {
        return <Image src={TableFilterIcon} alt="filter icon" />;
      },
    },
    {
      title: "ETH",
      dataIndex: "eth_amount",
      key: "eth_amount",
      render(value, record, index) {
        return (
          <div>
            <AppNumberToolTip
              decimal={6}
              isFormatterK={false}
              value={BigNumber(value).div(NATIVE_TOKEN_DECIMAL).toString()}
            />
          </div>
        );
      },
    },
    {
      title: tokenDetail?.symbol,
      dataIndex: "amount",
      key: "amount",
      render(value, record, index) {
        return (
          <div>
            <AppNumberToolTip
              decimal={6}
              isFormatterK={false}
              value={BigNumber(value).div(TOKEN_DECIMAL).toString()}
            />
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex gap-1.5">
          <div>DATE AND TIME</div>
          <Image
            src={TableFilterIcon}
            alt="filter icon"
            className="cursor-pointer"
            onClick={() => setIsDatePickerModalOpen(true)}
          />
        </div>
      ),
      dataIndex: "timestamp_created",
      key: "timestamp_created",
      render(value, record, index) {
        return <div>{getTimeDDMMMYYYYHHMM(Number(value))}</div>;
      },
    },
    {
      title: "MAKER",
      dataIndex: "username",
      key: "username",
      render(value, record, index) {
        return (
          <div
            className="text-[#0184FC] px-3 text-16px-normal rounded-xl bg-[rgba(1,132,252,0.20)] w-fit cursor-pointer hover:!underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(PATH_ROUTER.USER_PROFILE(record.user_address));
            }}
          >
            <AppTruncateText text={value} maxLength={15} />
          </div>
        );
      },
    },
    {
      title: "TXN",
      dataIndex: "txh",
      key: "txh",
      render(value, record, index) {
        return (
          <Link
            href={`${envs.SCAN_URL}/tx/${value}`}
            target="_blank"
            className="text-16px-medium text-white-neutral flex gap-1"
          >
            <Image src={ArrowExport} alt="arrow-export" />
          </Link>
        );
      },
    },
  ];

  useEffect(() => {
    if (isConnected) {
      socket?.on(ESocketEvent.BUY, (data: ISocketData) => {
        if (data.data.tokenAddress === tokenDetail?.contractAddress) {
          // queryClient.setQueryData(
          //   [
          //     API_PATH.TOKEN.TRADING_HISTORIES,
          //     searchParams,
          //     tokenDetail?.contractAddress,
          //     filters,
          //   ],
          //   (oldData: any) => {
          //     if (!oldData) return { data: [data.data], total: 1 };

          //     return {
          //       ...oldData,
          //       data: [data.data, ...oldData.data.slice(0, 99)],
          //     };
          //   }
          // );
          refetch();
        }
      });
      socket?.on(ESocketEvent.SELL, (data: ISocketData) => {
        if (data.data.tokenAddress === tokenDetail?.contractAddress) {
          refetch();
        }
      });
    }
  }, [isConnected]);

  return (
    <div className="trade-history-container">
      <AppTable
        scroll={{ x: 900 }}
        columns={columns}
        dataSource={listData}
        loading={isFetching}
        pagination={false}
      />
      <div className="mt-4">
        <AppPaginationCustom
          label="tokens"
          total={metadata?.total}
          page={searchParams.page}
          limit={LIMIT_COIN_ITEMS_TABLE}
          onChange={(page) => setSearchParams({ ...searchParams, page })}
          hideOnSinglePage={true}
        />
      </div>

      <DatePickerModal
        form={form}
        open={isDatePickerModalOpen}
        onCancel={() => setIsDatePickerModalOpen(false)}
        setSearchParams={setSearchParams}
      />
    </div>
  );
};

export default TradeHistory;
