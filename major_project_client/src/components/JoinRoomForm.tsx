import { useState } from "react";
import { BASE_URL, User } from "../Util";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/JoinRoomForm.css"; // Import the CSS file
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JoinRoomForm = () => {
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();

  const formSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (id.length === 0) {
      toast.error('DocId cannot be empty.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/joinDoc/${id}`, {
        user: {
          username: localStorage.getItem(User.username),
        },
      });
      sessionStorage.setItem(User.docId, id);
      navigate(`/doc/${id}`);
    } catch (err) {
      toast.error('Error joining document. Please try again.');
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
        className={`form-input shadow-lg hover:border-blue-500 ${id.length > 0 ? 'border-blue-500' : ''}`}
      />
      <input type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-5 rounded shadow-lg" />
    </form>
  );
};

export default JoinRoomForm;
