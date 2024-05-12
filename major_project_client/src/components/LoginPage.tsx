import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../Util";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    // Validate username
    if (!username || !password) {
      toast.error('Fields cannot be empty.');
      return;
    }
    
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      toast.error('Username should only contain alphabets and numbers.');
      return;
    }

    // Validate password
    if (password.length < 8) {
      toast.error('Password should be at least 8 characters long.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
      const { token, userId } = response.data;

      // Store the token (e.g., in localStorage or an HTTP-only cookie)
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      toast.success('Login successful');
      navigate("/home");
    } catch (err) {
      // Handle login error
      if (err.response.status === 401) {
        toast.error('Invalid credentials. Please try again.');
      } else if (err.response.status === 400) {
        toast.error('Fields cannot be empty.');
      } else {
        toast.error('Login failed. Please try again.');
      }
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
            className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
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
            className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg"
        > 
          LOGIN
        </button>
        <p className="mt-5 text-base text-gray-600">
          Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
        </p>
      </div>
    </>
  );
}
