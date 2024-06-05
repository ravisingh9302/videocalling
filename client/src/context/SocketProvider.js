import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  // const socket = useMemo(() => io("https://game-cowboy-lighter-uniprotkb.trycloudflare.com"), []);
  const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
