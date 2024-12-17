import React from "react";

interface AppDragDropProps {
  className?: string;
  children: React.ReactNode;
}
const AppDragDrop = ({ children, className, ...props }: AppDragDropProps) => {
  return <div className="text-primary-white">{children}</div>;
};

export default AppDragDrop;
