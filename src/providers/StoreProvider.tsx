"use client";
import makeStore from "@/libs/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";

persistStore(makeStore);
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={makeStore}>{children}</Provider>;
}
