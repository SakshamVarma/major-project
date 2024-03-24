import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DrawWrapper from "./page/DrawWrapper.tsx";
import Draw from "./page/Draw.tsx";
import { DrawContextProvider } from "./context/DrawContext.tsx";
import Login from "./components/Login.tsx";
import LoginPage from "./components/LoginPage.tsx";
import SignUpPage from "./components/SignUpPage.tsx";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/home",
    element: <App />,
  },
  {
    path: "/doc",
    element: (
      <DrawContextProvider>
        <DrawWrapper />
      </DrawContextProvider>
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
