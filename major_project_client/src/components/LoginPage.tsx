import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../Util";


export default function LoginPage() {

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
      const { token, userId } = response.data;

      // Store the token (e.g., in localStorage or an HTTP-only cookie)
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);

      // Redirect the user or perform any other necessary actionsnavigate("/home");
      console.log('Login successful');
      navigate("/home");
    } catch (err) {
      // Handle login error
      setError('Invalid credentials');
      console.error('Login error:', err.response.data.error);
    }
  };

  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-lg p-8 flex flex-col justify-center items-center">
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          Login
        </h2>

        <div className="relative mb-4">
              <label
                htmlFor="name"
                className="leading-7 text-sm text-gray-600"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
        <div className="relative mb-4 w-full">
          <label htmlFor="password" className="leading-7 text-sm text-gray-600">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        > 
          LOGIN
        </button>
      </div>


    </>
  );
}
