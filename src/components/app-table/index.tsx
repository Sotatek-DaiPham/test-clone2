"use client";
import { Empty, Table, TableProps } from "antd";
import { useEffect } from "react";
import "./style.scss";
import NoData from "../no-data";

interface AppTableProps extends TableProps {
  customClassName?: string;
  textEmpty?: string;
}

const AppTable = (props: AppTableProps) => {
  const handleLocaleTable = () => {
    if (props.loading) {
      return null;
    }
    if (!props.loading && props.dataSource?.length === 0) {
      return <NoData />;
    }
  };

  useEffect(() => {
    document.querySelectorAll('[aria-label="Page"]').forEach((element) => {
      element.addEventListener("keydown", function (event: any) {
        const key = event.key;

        // Allow only numbers and control keys like 'Backspace', 'Enter', 'Arrow keys'
        if (
          !/^\d$/.test(key) && // Check if it's not a digit
          key !== "Backspace" && // Allow backspace
          key !== "Enter" && // Allow enter
          key !== "ArrowLeft" && // Allow left arrow
          key !== "ArrowRight" && // Allow right arrow
          key !== "Tab" && // Allow tab
          key !== "Delete" // Allow delete
        ) {
          event.preventDefault(); // Prevent any invalid key press
        }
      });
    });
  });

  return (
    <div className={`app-table ${props.customClassName || ""}`}>
      <Table
        locale={{
          emptyText: handleLocaleTable(),
        }}
        rowKey={(record) => record.id}
        scroll={{ x: "max-content" }}
        {...props}
      />
    </div>
  );
};

export default AppTable;
