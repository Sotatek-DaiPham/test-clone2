"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@public/assets";
import Pagination, { PaginationProps } from "antd/es/pagination";
import clsx from "clsx";
import Image from "next/image";
import { useEffect } from "react";
import "./style.scss";
interface Props extends PaginationProps {
  className?: string;
  rootClassName?: string;
}

function AppPagination(props: Props) {
  const { className, ...restProps } = props;

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
    <div className="flex flex-row w-full justify-between items-center relative">
      <Pagination
        responsive={true}
        className={clsx("app-pagination", className)}
        hideOnSinglePage={true}
        nextIcon={<Image src={ArrowRightIcon} alt="next icon" />}
        prevIcon={<Image src={ArrowLeftIcon} alt="prev icon" />}
        showSizeChanger={false}
        jumpPrevIcon={() => {
          return "...";
        }}
        jumpNextIcon={() => {
          return "...";
        }}
        {...restProps}
      />
    </div>
  );
}

export default AppPagination;
