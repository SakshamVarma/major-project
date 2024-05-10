import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DrawWrapper from "./page/DrawWrapper.tsx";
import Draw from "./page/Draw.tsx";
import { DrawContextProvider } from "./context/DrawContext.tsx";
import LoginPage from "./components/LoginPage.tsx";
import SignUpPage from "./components/SignUpPage.tsx";
import AuthCheck from './AuthCheck';
import Login from "./components/Login.tsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthCheck>
        <App />
      </AuthCheck>
    ),
  },
  {
    path: "/auth",
    element: (
      <AuthCheck>
        <Login />
      </AuthCheck>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthCheck>
        <LoginPage />
      </AuthCheck>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthCheck>
        <SignUpPage />
      </AuthCheck>
    ),
  },
  {
    path: "/home",
    element: (
      <AuthCheck>
        <App />
      </AuthCheck>
    ),
  },
  {
    path: "/doc",
    element: (
      <AuthCheck>
        <DrawContextProvider>
          <DrawWrapper />
        </DrawContextProvider>
      </AuthCheck>
    ),
    children: [
      {
        path: ":docId",
        element: <Draw />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
