"use client";

import { formatAmount } from "@/helpers/formatNumber";
import withClient from "@/helpers/with-client";

const ShowingPage = ({ total, range, label }: any) => {
  return (
    <span className="!text-neutral-9">
      Showing {label || ""} {formatAmount(range[0])}-{formatAmount(range[1])} of{" "}
      {formatAmount(total)}
    </span>
  );
};

export default withClient(ShowingPage);
