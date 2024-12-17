/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { SocketContext } from "@/libs/socket/SocketProvider";
import { useContext } from "react";

const useSocket = () => useContext(SocketContext);

export default useSocket;
