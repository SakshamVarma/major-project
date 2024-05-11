import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./components/JoinRoomForm";
import { useEffect, useState } from "react";
import { User, BASE_URL } from "./Util";
import axios from "axios";
import "./styles/App.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [username, setUsername] = useState<string>("");
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logout clicked');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate("/login");
    // You can also reset the username or perform any other necessary actions
    setUsername('');
  };

  useEffect(() => {
    const _user = localStorage.getItem(User.username);
    const _id = localStorage.getItem(User.userId);

    // if (!_user || !_id) {
    //   navigate("/auth");
    //   return;
    // }

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
      toast.error('Error creating document. Please try again.');
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-2 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src="./src/assets/inkpen.svg" alt="pen" className="w-10 h-10 mr-2 rounded-full" />
            <h1 className="text-2xl font-bold ml-5">IdeaInk</h1>
          </div>
          {/* Profile Icon */}
          <div className="relative">
            <div
              className="rounded-full bg-white w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <svg
                className="w-8 h-8 text-blue-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-2">
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Hello {username}
                  </span>
                  <span
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 flex justify-center items-center">
        <div className="container grid grid-cols-2 gap-8">
          {/* Column 1: Existing Content */}
          <div>
            <h1 className="text-3xl font-bold mb-4 mt-6">Hi {username}</h1>
            <p className="text-lg text-gray-600 mb-4">
              Welcome to IdeaInk! Create a new document or join an existing one.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 shadow-lg"
              onClick={createNewRoom}
            >
              Create Document
            </button>
            <br />
            <br />
            <JoinRoomForm />
          </div>

          {/* Column 2: Image */}
          <div>
            <img
              src="../src/assets/meeting-vector.jpg"
              alt="Your Image"
              className="max-w-full"
              loading="eager"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
