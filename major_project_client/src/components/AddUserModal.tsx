import Modal from "./Model";
import { DrawContext } from "../context/DrawContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Util";

const AddUserModal: React.FC<{}> = ({}) => {
  const context = useContext(DrawContext);
  const { addUserModal, setAddUserModal, canvasState, socket, setCanvasState } =
    context;
  const closeWindowHandler = () => {
    setAddUserModal(false);
  };
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [user, setUser] = useState("");

  const resetCollaborators = () => {
    setCollaborators(canvasState.collaborators.map((item: string) => item));
  };

  const addUserHandler = async () => {
    setCollaborators((x) => [...x, user]);
    setUser("");
  };

  const shareWithUserHandler = async () => {
    try {
      await axios.post(`${BASE_URL}/addCollaborator/${canvasState.docId}`, {
        user: {
          usernames: collaborators,
        },
      });
      console.log("Docs are shared");
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
    <Modal isOpen={addUserModal} onClose={closeWindowHandler}>
      <div className="h-full w-[500px] p-2">
        <div className="border-2 border-black mb-2 p-2">
          <span className=" font-bold">RoomId: </span>
          {canvasState.docId}
        </div>
        <div className="flex">
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className=" border-2 border-black w-full p-2"
          />
          <button
            onClick={addUserHandler}
            className="p-2 bg-slate-500 mb-2 text-sm"
          >
            Add user
          </button>
        </div>
        {collaborators.map((username) => (
          <div
            key={username}
            className=" hover:cursor-pointer border-b-2 border-b-black m-2"
            onClick={() =>
              setCollaborators((collaborators) =>
                collaborators.filter((c) => c !== username)
              )
            }
          >
            {username}
          </div>
        ))}

        <button
          onClick={shareWithUserHandler}
          className="p-2 bg-slate-500 mb-2"
        >
          Share Document
        </button>
        <br />
        <button onClick={resetCollaborators} className="p-2 bg-slate-500">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default AddUserModal;
