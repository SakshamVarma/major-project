import { useState } from "react";
import { BASE_URL, User } from "../Util";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/JoinRoomForm.css"; // Import the CSS file

const JoinRoomForm = () => {
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();

  const formSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (id.length === 0) {
      alert("id is empty");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/joinDoc/${id}`, {
        user: {
          username: sessionStorage.getItem(User.username),
        },
      });
      sessionStorage.setItem(User.docId, id);
      navigate(`/doc/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form className="form-container" onSubmit={formSubmitHandler}>
      <label htmlFor="" className="form-label">
        Enter Document id
      </label>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="form-input"
      />
      <input type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-5 rounded" />
    </form>
  );
};

export default JoinRoomForm;
