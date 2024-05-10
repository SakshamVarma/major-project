import Modal from "./Model";
import { DrawContext } from "../context/DrawContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, User } from "../Util";

const UsersModal: React.FC<{}> = ({}) => {
  const context = useContext(DrawContext);
  const { usersModal, setUsersModal, canvasState, socket, setCanvasState } =
    context;
  const closeWindowHandler = () => {
    setUsersModal(false);
  };
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const resetCollaborators = () => {
    setCollaborators(canvasState.collaborators.map((item: string) => item));
  };

  const giveAccessHandler = async (user: string) => {
    const username = localStorage.getItem(User.username);
    try {
      if (canvasState.editor !== username && canvasState.creater !== username) {
        console.log(username, canvasState.editor, canvasState.creater);
        throw new Error("You are not authorized to give write access");
      }

      await axios.post(`${BASE_URL}/giveAccess/${canvasState.docId}`, {
        user: {
          username: user,
        },
      });

      console.log("Access is given");
      socket.emit("update_canvas_status", { docId: canvasState.docId });
      const res = (
        await axios.post(`${BASE_URL}/getCanvasState/${canvasState.docId}`)
      ).data;
      setCanvasState(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    resetCollaborators();
  }, [canvasState]);

  return (
    <Modal isOpen={usersModal} onClose={closeWindowHandler}>
      <div className="h-full w-[500px] p-2">
        <h1 className=" text-center text-xl font-bold mb-4">Users</h1>
        {collaborators.map((user) => (
          <div
            key={user}
            className="bg-blue-100 hover:bg-blue-300 border border-blue-700 rounded-md px-2 py-1 mb-1 cursor-pointer flex flex-row justify-between items-center"
            onClick={() => giveAccessHandler(user)}
          >
            <span>{user}</span>
            {canvasState.editor === user ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default UsersModal;
