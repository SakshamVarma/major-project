import { useState } from "react";
import { BASE_URL, User } from "../Util";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JoinRoomForm = () => {
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();
  const formSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (id.length == 0) {
      alert("id is empty");
    }

    try {
      await axios.post(`${BASE_URL}/joinDoc/${id}`, {
        user: {
          username: sessionStorage.getItem(User.username)
        },
      });
      sessionStorage.setItem(User.docId, id);
      navigate(`/doc/${id}`);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form onSubmit={formSubmitHandler}>
      <label htmlFor="">Enter room id</label>
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="submit" />
    </form>
  );
};

export default JoinRoomForm;
