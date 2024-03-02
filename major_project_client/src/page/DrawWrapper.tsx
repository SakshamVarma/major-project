import { useEffect, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { User } from "../Util";
import { io } from "socket.io-client";
import { DrawContext } from "../context/DrawContext";
import { BASE_URL } from "../Util";
import axios from "axios";

const DrawWrapper = () => {
  const navigate = useNavigate();
  const context = useContext(DrawContext);
  const { setSocket, setCanvasState } = context;
  useEffect(() => {
    const docId = sessionStorage.getItem(User.docId);
    if (!docId) {
      navigate("/home");
      return;
    }

    const getDocState = async () => {
      try {
        const res = (await axios.post(`${BASE_URL}/getCanvasState/${docId}`))
          .data;
        setCanvasState(res);
      } catch (err) {
        console.error(err);
        navigate("/home");
      }
    };

    getDocState();
  }, []);

  useEffect(() => {
    const initialiseSocket = () => {
      try {
        if (!setSocket) {
          console.log("set socket is undefined");
          return;
        }
        const socket = io(BASE_URL);

        socket.on("connect_error", (err) => {
          console.log(err instanceof Error);
          console.log(err.message);
        });

        socket.on("connect", () => {
          console.log("user is connected on client");
        });

        const userId = sessionStorage.getItem(User.userId);
        const docId = sessionStorage.getItem(User.docId);
        socket.emit("join_custom_room", { userId, docId });

        setSocket(socket);

        return socket;
      } catch (err: any) {
        console.log(err);
        setTimeout(() => {
          return initialiseSocket();
        }, 1000);
      }
    };

    const socket = initialiseSocket();

    return () => {
      socket?.emit("leave_custom_room", {
        docId: sessionStorage.getItem(User.docId),
      });
      socket?.disconnect();
    };
  }, []);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default DrawWrapper;
