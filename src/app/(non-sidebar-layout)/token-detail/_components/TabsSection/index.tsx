import AppTabs from "@/components/app-tabs";
import DiscussionThread from "../DiscussionThreadSection";
import TradeHistory from "./TradeHistory";
import HolderDistribute from "./HolderDistribute";

enum ETokenDetailTabs {
  DISCUSSION = "DISCUSSION",
  HOLDER = "HOLDER",
  TRANSACTION = "TRANSACTION",
}
const TabsSection = () => {
  const tabs = [
    {
      label: "Discussion Thread",
      key: ETokenDetailTabs.DISCUSSION,
      children: <DiscussionThread />,
    },
    {
      label: "Holder Distribution",
      key: ETokenDetailTabs.HOLDER,
      children: <HolderDistribute />,
    },
    {
      label: "Transactions",
      key: ETokenDetailTabs.TRANSACTION,
      children: <TradeHistory />,
    },
  ];
  return (
    <div className="mt-[26px]">
      <AppTabs items={tabs} destroyInactiveTabPane={true} />
    </div>
  );
};

export default TabsSection;
