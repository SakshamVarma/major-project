import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./components/JoinRoomForm";
import { useEffect, useState } from "react";
import { User, BASE_URL } from "./Util";
import axios from "axios";
import "./styles/App.css"; // Import the CSS file

function App() {
  const [username, setUsername] = useState<string>("");
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const _user = sessionStorage.getItem(User.username);
    const _id = sessionStorage.getItem(User.userId);

    if (!_user || !_id) {
      navigate("/auth");
      return;
    }

    setUsername(_user);
    setId(_id);
  }, []);

  const createNewRoom = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/createDoc`, {
        user: {
          username,
        },
      });
      const data = res.data;
      console.log("data is here", data);
      sessionStorage.setItem(User.docId, data.docId);
      navigate(`/doc/{docId}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="container">
        <h1 className="title">hi {username}</h1>
        <button
          className="button"
          onClick={createNewRoom}
        >
          Create Document
        </button>
        <br />
        <br />
        <JoinRoomForm />
      </div>
    </div>
  );
}

export default App;
