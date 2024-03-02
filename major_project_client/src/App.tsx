import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./components/JoinRoomForm";
import { useEffect, useState } from "react";
import { User, BASE_URL } from "./Util";
import axios from "axios";

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
    <div>
      <h1>hi {username}</h1>
      <button onClick={createNewRoom}>Create room</button>
      <br />
      <br />
      <JoinRoomForm />
    </div>
  );
}

export default App;
