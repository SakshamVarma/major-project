import Modal from "./Model";
import { DrawContext } from "../context/DrawContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Util";
import "../styles/AddUserModal.css";
import { ToastContainer, toast } from "react-toastify";

const AddUserModal: React.FC<{}> = ({}) => {
  const [buttonText, setButtonText] = useState("Copy");
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
      closeWindowHandler();
      alert("Document shared successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const copyRoomID = () => {
    navigator.clipboard.writeText(canvasState.docId);
    setButtonText("Copied");
    setTimeout(() => {
      setButtonText("Copy");
    }, 2000);
  };

  useEffect(() => {
    resetCollaborators();
  }, [canvasState]);

  return (
    <Modal isOpen={addUserModal} onClose={closeWindowHandler}>
    <div className="modal-container">
    <div className="input-container">
      <div className="info-box">
        <span className="font-bold">RoomId: </span>
        {canvasState.docId}
      </div>
      <button
          onClick={copyRoomID}
          className="copy-button"
        >
          {buttonText}
        </button>
      </div>  
      <div className="input-container mb-2">
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="input-field"
        />
        <button
          onClick={addUserHandler}
          className="add-user-button"
        >
          Add user
        </button>
      </div>
      {collaborators.map((username) => (
        <div
          key={username}
          className="collaborator"
          onClick={() =>
            setCollaborators((collaborators) =>
              collaborators.filter((c) => c !== username)
            )
          }
        >
          {username}
        </div>
      ))}
      <div className="flex flex-row-reverse mt-10">
      <button
        onClick={shareWithUserHandler}
        className="share-button"
      >
        Share Document
      </button>
      <button onClick={resetCollaborators} className="cancel-button">
        Cancel
      </button>
      </div>
    </div>
  </Modal>
  );
};

export default AddUserModal;
