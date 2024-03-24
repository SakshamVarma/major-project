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
      <div
        className="fixed top-0 left-0 w-full h-full z-50 flex items-center backdrop-blur-sm justify-center"
      >
        <div className=" absolute lg:w-2/6 md:w-1/2 sm:w-2/3 max-w-md h-full  ">
          <div
            className="relative overflow-y-auto translate-y-1/2 bg-gray-100 rounded-lg p-8 flex flex-col mt-10 md:mt-0 z-10"
          >
            <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
                Login
            </h2>

            <div className="relative mb-4">
              <label
                htmlFor="email"
                className="leading-7 text-sm text-gray-600"
              >
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
            <div className="relative mb-4">
              <label
                htmlFor="password"
                className="leading-7 text-sm text-gray-600"
              >
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
            <button onClick={handleLogin} className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Button
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
