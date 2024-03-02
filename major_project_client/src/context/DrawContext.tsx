import React, { useRef } from "react";
import { ReactNode, useState } from "react";
import { penColors, CanvasStateType } from "../Util";

export const DrawContext = React.createContext<any>(null);

export const DrawContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState<string>(penColors[0]);
  const [penWidth, setPenWidth] = useState<number>(4);
  const [socket, setSocket] = useState<any>(null);
  const [colorModal, setColorModal] = useState<boolean>(false);
  const [addUserModal, setAddUserModal] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [usersModal, setUsersModal] = useState<boolean>(false);
  const [canvasState, setCanvasState] = useState<CanvasStateType | null>(null);
  return (
    <DrawContext.Provider
      value={{
        color,
        setColor,
        addUserModal,
        setAddUserModal,
        penWidth,
        setPenWidth,
        canvasState,
        setCanvasState,
        ctxRef,
        socket,
        setSocket,
        usersModal,
        setUsersModal,
        colorModal,
        showNotes,
        setShowNotes,
        setColorModal,
      }}
    >
      {children}
    </DrawContext.Provider>
  );
};
