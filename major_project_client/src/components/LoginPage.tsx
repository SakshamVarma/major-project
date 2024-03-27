import { useState } from "react";

export default function LoginPage() {

  const [credentails, setCredentails] = useState({
    name: "",
    email: "",
    password: "",
  });
  const onCredentialChange = (e: any) => {
    setCredentails({
      ...credentails,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = () => {
    console.log(credentails);
  };

  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-lg p-8 flex flex-col justify-center items-center">
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          Login
        </h2>

        <div className="relative mb-4 w-full">
          <label htmlFor="email" className="leading-7 text-sm text-gray-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={onCredentialChange}
            value={credentails.email}
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
            onChange={onCredentialChange}
            value={credentails.password}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={handleLogin}
          className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          
          LOGIN
        </button>
      </div>


    </>
  );
}
