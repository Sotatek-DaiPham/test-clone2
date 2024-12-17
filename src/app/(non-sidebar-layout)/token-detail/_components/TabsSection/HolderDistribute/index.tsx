import AppModal from "@/components/app-modal";
import AppNumberToolTip from "@/components/app-number-tooltip";
import AppPaginationCustom from "@/components/app-pagination/app-pagination-custom";
import AppTable from "@/components/app-table";
import { LIMIT_COIN_ITEMS_TABLE, NATIVE_TOKEN_DECIMAL } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { envs } from "@/constant/envs";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { nFormatter } from "@/helpers/formatNumber";
import { cleanParamObject, shortenAddress } from "@/helpers/shorten";
import { IMetaData } from "@/interfaces";
import { IGetHolderRes, IGetTradeHistoryParams } from "@/interfaces/token";
import { getAPI } from "@/service";
import { ArrowExport } from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { ColumnType } from "antd/es/table";
import BigNumber from "bignumber.js";
import { get } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const HolderDistribute = () => {
  const { tokenDetail } = useTokenDetail();
  const [isOpenBubbleChart, setisOpenBubbleChart] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    page: number;
  }>({
    page: 1,
  });
  const { data, refetch, isFetching } = useQuery({
    queryFn: () => {
      return getAPI(API_PATH.TOKEN.HOLDER_DISTRIBUTE, {
        params: cleanParamObject({
          tokenAddress: tokenDetail?.contractAddress,
          page: searchParams.page,
          limit: LIMIT_COIN_ITEMS_TABLE,
        } as IGetTradeHistoryParams),
      });
    },
    select(data) {
      return data;
    },
    queryKey: [API_PATH.TOKEN.HOLDER_DISTRIBUTE],
    enabled: !!tokenDetail?.contractAddress,
  });

  const metadata = get(data, "data.metadata") as IMetaData;

  const listData = get(data, "data.data", []) as IGetHolderRes[];

  const columns: ColumnType<any>[] = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render(value, record, index) {
        return index + 1;
      },
    },
    {
      title: "Address",
      dataIndex: "user_address",
      key: "user_address",
      render(value, record, index) {
        return shortenAddress(value);
      },
    },
    {
      title: "PERCENTAGE",
      dataIndex: "percent",
      key: "percent",
      render(value, record, index) {
        return <div>{nFormatter(value)}</div>;
      },
    },
    {
      title: "VALUE {$}",
      dataIndex: "value",
      key: "value",
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
      title: "VIEW ON BLOCK EXPLORER",
      dataIndex: "user_address",
      key: "user_address",
      render(value, record, index) {
        return (
          <Link
            href={`${envs.SCAN_URL}/address/${value}`}
            target="_blank"
            className="text-16px-medium text-white-neutral flex gap-1"
          >
            <Image src={ArrowExport} alt="arrow-export" />
          </Link>
        );
      },
    },
  ];

  return (
    <div>
      {/* <AppButton
        typeButton="secondary"
        onClick={() => setisOpenBubbleChart(true)}
        customClass="!w-fit my-6"
      >
        Generate bubble map
      </AppButton> */}
      <AppTable
        scroll={{ x: 900 }}
        columns={columns}
        dataSource={listData}
        loading={isFetching}
        pagination={false}
      />
      <div className="mt-4">
        <AppPaginationCustom
          label="holders"
          total={metadata?.total}
          page={searchParams.page}
          limit={LIMIT_COIN_ITEMS_TABLE}
          onChange={(page) => setSearchParams({ ...searchParams, page })}
          hideOnSinglePage={true}
        />
      </div>
      <AppModal
        width={700}
        open={isOpenBubbleChart}
        onCancel={() => setisOpenBubbleChart(false)}
        footer={null}
        centered={false}
      >
        <iframe
          src="https://app.bubblemaps.io/arbi/token/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
          style={{
            width: "100%",
            height: "500px",
            marginTop: "40px",
          }}
        />
      </AppModal>
    </div>
  );
};

export default HolderDistribute;
