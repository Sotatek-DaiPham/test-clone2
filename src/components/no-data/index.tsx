import withClient from "@/helpers/with-client";
import { NoDataIcon } from "@public/assets";
import Image from "next/image";

interface Props {
  mode?: "primary" | "secondary";
}

const NoData = ({ mode = "primary" }: Props) => {
  return (
    <div
      className={`w-full h-full flex flex-col justify-center mt-[${
        mode === "primary" ? "150px" : "10px"
      }] md:mb-[${mode === "primary" ? "150px" : "10px"}]`}
    >
      <div className="w-fit mx-auto">
        <Image src={NoDataIcon} alt="no-data" />
      </div>
      <div className="text-16px-medium text-neutral-7 text-center mt-3">
        No Data
      </div>
    </div>
  );
};

export default withClient(NoData);
