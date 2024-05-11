export const User = {
  username: "username",
  userId: "userId",
  password: "password",
  docId: "docId"
};

export const BASE_URL = "https://ideaink.onrender.com";

export const penColors = [
    "#020617", // black
    "#d946ef", // white
    "#f43f5e", // rose-500
    "#14b8a6", // teal
    "#0ea5e9", // sky
    "#f59e0b", // amber - yellow
  ];

export const undoRedoUtil = {
  numberOfPages: "numberOfPages",
  currentPage: "currentPage",
  imgUrl: "imgUrl",
  undo: "undo",
  redo: "redo"
}

export interface CanvasStateType  {
  creater: string;
  editor: string;
  canvas: string;
  collaborators: string[];
  docId: string;
}