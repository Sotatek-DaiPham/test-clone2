"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { useAppSelector } from "../hooks";

const domain = process.env.NEXT_PUBLIC_SOCKET_URL;

interface Props {
  children: React.ReactNode;
}

interface SocketInterface {
  isConnected: boolean;
  addEvent: (
    eventName: string,
    handleEventCallback: (data: any) => void
  ) => void;
  removeEvent: (eventName: string, listener?: (data: any) => void) => void;
  connect: () => void;
  disconnect: () => void;
  socket: Socket | null;
}

export const SocketContext = createContext<SocketInterface>({
  isConnected: false,
  addEvent: () => {},
  removeEvent: () => {},
  connect: () => {},
  disconnect: () => {},
  socket: null,
});

const SocketProvider = ({ children }: Props) => {
  const accessToken = useAppSelector((state: any) => state.user.accessToken);

  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // handle event
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    console.log("Connect socket successfully!");
  }, []);
  const handleConnectError = useCallback(() => {
    setIsConnected(false);
    console.log("Connect socket failed");
  }, []);
  const handleError = useCallback((error: any) => {
    console.log("error", error);
  }, []);
  const handleMissingSocketInstance = useCallback(() => {
    console.log("Socket hasn't been initiated");
  }, []);

  const connect = () => {
    console.log("connect socket");
    if (!socket.current) {
      socket.current = io(domain || "", {
        autoConnect: false,
        transports: ["websocket", "polling"],
        query: {
          authorization: accessToken,
        },
      });
    }

    if (!isConnected) {
      socket.current.connect();
      socket.current.on("connect", handleConnect);
      socket.current.on("connect_error", handleConnectError);
      socket.current.io.on("error", handleError);
    }
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.removeAllListeners();
      console.log("Remove all listeners and disconnect socket");
      socket.current.on("disconnect", (reason) => {
        console.log("Disconnect socket successfully!");
      });
      setIsConnected(false);
      socket.current.disconnect();
    }
  };

  const addEvent = useCallback(
    (eventName: string, handleEventCallback: (data: any) => void) => {
      if (socket.current) {
        console.log(`Added event ${eventName}`);
        socket.current.on(eventName, handleEventCallback);
      } else {
        handleMissingSocketInstance();
      }
    },
    []
  );
  const removeEvent = useCallback(
    (eventName: string, listener?: (data: any) => void) => {
      if (socket.current) {
        if (listener) {
          socket.current.off(eventName, listener);
          console.log(`Removed listener of [${eventName}]`);
        } else {
          socket.current.off(eventName);
          console.log(`Removed all listeners of [${eventName}]`);
        }
      } else {
        handleMissingSocketInstance();
      }
    },
    []
  );
  useEffect(() => {
    connect();
  }, [accessToken, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        addEvent,
        removeEvent,
        connect,
        disconnect,
        socket: socket?.current,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
