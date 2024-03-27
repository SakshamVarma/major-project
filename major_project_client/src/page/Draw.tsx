import React, { useRef, useState, useEffect } from "react";
import { DrawContext } from "../context/DrawContext";
import {
  BASE_URL,
  CanvasStateType,
  User,
  penColors,
  undoRedoUtil,
} from "../Util";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import ColorWindow from "../components/ColorWindow";
import AddUserModal from "../components/AddUserModal";
import UsersModal from "../components/UsersModal";
import StickyNotes from "../components/StickeyNotes";
import DragNDrop from "../components/DragNDrop";
import jsPDF from "jspdf";

const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const username = sessionStorage.getItem(User.username);
  //   const countRef = useRef<number>(2);
  // const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [moving, setMoving] = useState<boolean>(false);
  const [cord, setCord] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [value, setValue] = useState<string>("");

  const drawingRef = useRef<HTMLDivElement>(null);

  const pagesArrayRef = useRef<string[]>([]);
  const currentPageRef = useRef<number>(0);

  const navigate = useNavigate();
  const drawContext = React.useContext(DrawContext);
  if (!drawContext) throw new Error("Draw context not defined");
  const {
    socket,
    setSocket,
    colorModal,
    setColorModal,
    ctxRef,
    canvasState,
    setCanvasState,
    addUserModal,
    usersModal,
    setUsersModal,
    setAddUserModal,
    showNotes,
    setShowNotes,
  } = drawContext;
  // console.log("Pen width: ", penWidth);
  // console.log("Color: ", color);

  //   const [url, setUrl] = useState<string>("");
  //   const [notes, setNotes] = useState<string[]>([]);
  //   const [imgUrls, setImgUrls] = useState<string[]>([]);

  //   const { penColor, penWidth, undoRedoTracker, createNotesToggle, imgUrl } =
  //     useSelector((state: RootState) => state.tool);

  //   const dispatch = useDispatch();

  const drawOnCanvas = (url: any) => {
    ctxRef.current?.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      ctxRef.current?.drawImage(
        img,
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );
    };
  };

  const moveStartHandler = (X: number, Y: number) => {
    const _ctx = ctxRef.current;
    if (!_ctx || username !== canvasState?.editor) {
      return;
    }

    _ctx.beginPath();
    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.moveTo(x, y);
    setMoving(true);
  };

  const moveHandler = (X: number, Y: number) => {
    const _ctx = ctxRef.current;
    if (!_ctx || moving === false) {
      return;
    }

    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.lineTo(x, y);
    _ctx.stroke();
  };

  const moveEndHandler = () => {
    const url = canvasRef.current?.toDataURL();
    // console.log(url);
    // if (url) {
    //   dispatch(updateUndoRedoTracker(url));
    // }
    if (!url) return;

    setMoving(false);
    pagesArrayRef.current.push(url);
    currentPageRef.current = pagesArrayRef.current.length - 1;
    socket.emit("update_canvas", {
      docId: sessionStorage.getItem(User.docId),
      canvas: url,
    });
  };

  const exitDocHandler = async () => {
    try {
      const docId = sessionStorage.getItem(User.docId);
      const res = await axios.post(`${BASE_URL}/deleteDoc`, {
        user: {
          docId,
        },
      });

      sessionStorage.removeItem(User.docId);
      navigate("/home");
    } catch (err) {
      console.log(err);
    }
  };

  const undoRedoHandler = (option: string) => {
    if (option === undoRedoUtil.undo) {
      if (currentPageRef.current === 0) {
        console.log("Undo cannot be performed");
        return;
      }

      currentPageRef.current--;
    } else {
      if (currentPageRef.current === pagesArrayRef.current.length - 1) {
        console.log("Redo cannot be performed");
        return;
      }

      currentPageRef.current++;
    }

    console.log("undo", pagesArrayRef.current[currentPageRef.current]);
    drawOnCanvas(pagesArrayRef.current[currentPageRef.current]);
    socket.emit("update_canvas", {
      docId: sessionStorage.getItem(User.docId),
      canvas: pagesArrayRef.current[currentPageRef.current],
    });
  };

  const askForWriteAccessHandler = async (username: string) => {
    try {
      if (
        username.length === 0 ||
        canvasState.editor === username ||
        canvasState.creater === username
      ) {
        throw new Error("You cannot ask for access");
      }

      socket.emit("raise_hand", { docId: canvasState.docId, user: username });
    } catch (err) {
      console.log(err);
    }
  };

  const uploadImageHandler = (file: any) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      const src = e.target?.result;
      if (!src) return;
      img.src = src.toString();
      img.onload = function () {
        // Clear canvas before drawing the new image
        ctxRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw the image on the canvas
        ctxRef.current.drawImage(
          img,
          0,
          0,
          window.innerWidth,
          window.innerHeight
        );

        moveEndHandler();
      };
    };

    reader.readAsDataURL(file);
  };

  const downloadPdfHandler = () => {
    const doc = new jsPDF();

    // Add canvas content to PDF
    if (!canvasRef.current) return;
    const canvasImg = canvasRef.current.toDataURL("image/png");
    // doc.addImage(canvasImg, "PNG", 0, 0, window.innerWidth, window.innerHeight);
    doc.addImage(canvasImg, 10, 10, 180, 120);

    const margin = 10;
    const maxWidth = 180; // Maximum width for text wrapping
    const lineHeight = 10;

    // Split text into lines
    const lines = doc.splitTextToSize(value, maxWidth - margin * 2);

    // Calculate total height of text
    const textHeight = lines.length * lineHeight;

    // Add text to PDF with proper wrapping
    doc.text(lines, margin, 150, { maxWidth: maxWidth });

    // Download the PDF
    doc.save("content.pdf");
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      const temp = canvasRef.current.getContext("2d");
      if (!temp) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = rect.left + window.scrollX;
      const y = rect.top + window.scrollY;

      // temp.lineWidth = penWidth;
      // temp.strokeStyle = color;
      temp.lineWidth = 4;
      temp.strokeStyle = penColors[0];
      ctxRef.current = temp;

      setCord({
        x,
        y,
      });

      pagesArrayRef.current.push(canvasRef.current.toDataURL());

      //   const url = canvasRef.current.toDataURL();
      //   dispatch(initialiseUndoRedoTracker(url));
    }

    console.log(canvasState);
  }, []);
  // }, [penWidth, color]);

  useEffect(() => {
    const canvasAndSocket = () => {
      if (!socket) {
        console.log("Socket is not available");
        return;
      }
      console.log("Socket is available");

      socket.on("updated_canvas", (canvas: any) => {
        console.log("Updating canvas", canvas);
        pagesArrayRef.current.push(canvas);
        currentPageRef.current = pagesArrayRef.current.length - 1;
        drawOnCanvas(canvas);
      });

      socket.on("updated_canvas_status", (canvasState: CanvasStateType) => {
        let found = false;
        canvasState.collaborators.forEach((user) => {
          const username = sessionStorage.getItem(User.username);
          if (user === username) found = true;
        });

        if (!found) exitDocHandler();

        setCanvasState(canvasState);
        console.log("Updated doc received", canvasState);
      });

      socket.on("raised_hand", (user: string) => {
        alert(`User: ${user} is asking for write access`);
      });

      socket.on("init_canvas", (canvas: any) => {
        console.log("Initialising canvas");
        pagesArrayRef.current.push(canvas);
        currentPageRef.current = pagesArrayRef.current.length - 1;
        drawOnCanvas(canvas);
      });
    };

    canvasAndSocket();
  }, [socket, setSocket]);

  useEffect(() => {
    const getCurrentCanvas = async () => {
      drawOnCanvas(canvasState.canvas);
    };

    getCurrentCanvas();
  }, [canvasState, setCanvasState]);

  return (
    <div ref={drawingRef} className="w-screen h-screen relative">
      {colorModal && <ColorWindow />}
      {addUserModal && <AddUserModal />}
      {usersModal && <UsersModal />}
      <div className=" absolute top-0 m-auto bg-blue-500 text-white flex justify-between items-center p-4 w-full">
        {/* Pen */}
        {username === canvasState?.editor && (
          <button
            onClick={() => {
              setColorModal((x: boolean) => !x);
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Eraser */}
        {username === canvasState?.editor && (
          <button
            onClick={() => {
              ctxRef.current.strokeStyle = "#fff";
              // ctxRef.current.strokeStyle = "#f8fafc";
              ctxRef.current.lineWidth = 10;
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.36052 0.72921C8.55578 0.533948 8.87236 0.533948 9.06763 0.72921L14.2708 5.93235C14.466 6.12761 14.466 6.4442 14.2708 6.63946L8.95513 11.9551L7.3466 13.5636C6.76081 14.1494 5.81106 14.1494 5.22528 13.5636L1.43635 9.7747C0.850563 9.18891 0.850563 8.23917 1.43635 7.65338L3.04488 6.04485L8.36052 0.72921ZM8.71407 1.78987L4.10554 6.3984L8.60157 10.8944L13.2101 6.28591L8.71407 1.78987ZM7.89447 11.6015L3.39843 7.10551L2.14346 8.36049C1.94819 8.55575 1.94819 8.87233 2.14346 9.06759L5.93238 12.8565C6.12765 13.0518 6.44423 13.0518 6.63949 12.8565L7.89447 11.6015Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Download */}
        {
          <button onClick={downloadPdfHandler}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        }
        {/* Upload */}
        {username === canvasState?.editor && (
          <span className=" relative">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
            <input
              type="file"
              className="absolute top-0 left-0 w-[20px] opacity-0"
              onChange={(e) =>
                uploadImageHandler(
                  e.target.files?.length ? e.target.files[0] : ""
                )
              }
            />
          </span>
        )}
        {/* Undo */}
        {username === canvasState?.editor && (
          <button onClick={() => undoRedoHandler(undoRedoUtil.undo)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.85355 3.85355C7.04882 3.65829 7.04882 3.34171 6.85355 3.14645C6.65829 2.95118 6.34171 2.95118 6.14645 3.14645L2.14645 7.14645C1.95118 7.34171 1.95118 7.65829 2.14645 7.85355L6.14645 11.8536C6.34171 12.0488 6.65829 12.0488 6.85355 11.8536C7.04882 11.6583 7.04882 11.3417 6.85355 11.1464L3.20711 7.5L6.85355 3.85355ZM12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L8.14645 7.14645C7.95118 7.34171 7.95118 7.65829 8.14645 7.85355L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L9.20711 7.5L12.8536 3.85355Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Redo */}
        {username === canvasState?.editor && (
          <button onClick={() => undoRedoHandler(undoRedoUtil.redo)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Notes */}
        <button
          onClick={() => {
            setShowNotes((x: boolean) => !x);
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        {/* Clear */}
        {username === canvasState?.editor && (
          <button
            onClick={() => {
              ctxRef.current.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
              );

              moveEndHandler();
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Hand */}
        {username !== canvasState?.editor && (
          <button
            onClick={() => {
              askForWriteAccessHandler(
                sessionStorage.getItem(User.username) || ""
              );
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.8113 1.64706C6.62188 2.87918 6.68268 3.88523 6.76848 5.30499C6.78415 5.56426 6.80065 5.83732 6.81661 6.12808C6.83111 6.39208 6.63758 6.62172 6.37495 6.65217C6.11232 6.68262 5.87138 6.50334 5.82509 6.24304L5.74754 5.80698C5.64402 5.16529 5.48355 4.25481 5.17807 3.44741C4.86241 2.61312 4.4486 2.04121 3.93436 1.86044C3.64994 1.76104 3.41901 1.84279 3.25868 2.01052C3.08746 2.18962 2.9976 2.47065 3.0627 2.75399C3.2146 3.34424 3.44627 3.9167 3.69836 4.51802C3.72082 4.57158 3.74346 4.62543 3.76621 4.67954C3.9954 5.22457 4.23619 5.7972 4.41644 6.39081L4.41691 6.39238C4.562 6.87586 4.65646 7.2595 4.73086 7.56165C4.76034 7.68138 4.78667 7.78831 4.81175 7.88359C4.86768 8.09606 4.77836 8.32014 4.59161 8.43588C4.40486 8.55161 4.16445 8.53188 3.99907 8.38725C3.73749 8.15848 3.515 7.92784 3.31817 7.71802C3.27627 7.67335 3.23602 7.63018 3.19705 7.58838C3.04777 7.42826 2.91712 7.28812 2.78334 7.16029C2.45989 6.85122 2.18398 6.68004 1.80585 6.64369L1.80324 6.64343C1.56117 6.61888 1.41402 6.66441 1.31756 6.72627C1.21899 6.78947 1.11988 6.90414 1.03784 7.1123C0.976576 7.28492 1.01515 7.62987 1.1929 7.96911L1.19728 7.97747C1.40086 8.38452 1.74475 8.81587 2.18141 9.29299C2.39739 9.52898 2.62872 9.76849 2.86934 10.0174L2.87966 10.0281C3.11546 10.2721 3.35962 10.5247 3.59713 10.7827C4.4288 11.6863 5.27706 12.7538 5.4627 14H11.5087C11.5636 12.4353 11.8756 11.268 12.2875 10.1346C12.4454 9.70041 12.6121 9.28412 12.7826 8.85829C13.1097 8.04139 13.4509 7.18937 13.7705 6.10824C14.0989 4.99737 14.0097 4.37033 13.8613 4.03984C13.717 3.71858 13.4914 3.61786 13.3816 3.59606C13.1381 3.54774 13.0384 3.60947 12.9698 3.67901C12.867 3.78316 12.7698 3.98273 12.6921 4.30269C12.6166 4.61345 12.5752 4.96517 12.533 5.32501L12.5298 5.35285C12.4924 5.67242 12.4505 6.03016 12.3665 6.30098C12.3383 6.40699 12.2819 6.50407 12.1979 6.57539C12.1382 6.6261 12.0104 6.70818 11.8309 6.69312C11.5424 6.66891 11.3712 6.42143 11.365 6.14783C11.356 5.75454 11.3883 5.35864 11.4074 4.96608C11.4428 4.23646 11.477 3.5337 11.4245 2.8342L11.4242 2.82934C11.3916 2.32997 11.0493 2.00228 10.7007 1.9228C10.5305 1.88401 10.369 1.90601 10.2347 1.9835C10.103 2.05946 9.95535 2.21318 9.8574 2.51394L9.85631 2.51726C9.81525 2.6404 9.77298 2.87753 9.73606 3.2124C9.70044 3.53542 9.67337 3.91279 9.65156 4.29418C9.6329 4.62033 9.61785 4.9584 9.60434 5.26194C9.58728 5.64529 9.57267 5.97357 9.55633 6.1532C9.54983 6.22459 9.52939 6.29493 9.49501 6.35785C9.47356 6.39711 9.36115 6.60947 9.07106 6.61843C8.77917 6.62744 8.63975 6.40057 8.61698 6.35919C8.55634 6.24899 8.55066 6.11807 8.54754 5.99283C8.54474 5.88064 8.54294 5.71798 8.54174 5.54767C8.53935 5.20582 8.53935 4.81919 8.53935 4.70952C8.53935 3.6657 8.53838 2.65372 8.44714 1.64372C8.39183 1.24127 8.06278 1.00455 7.6436 1.00005C7.22399 0.995552 6.87918 1.22704 6.8113 1.64706ZM9.41219 1.3617C9.21469 0.448484 8.39913 0.00810324 7.65433 0.00011154C6.86452 -0.00836308 5.98761 0.465881 5.82365 1.49037L5.82318 1.49334C5.78239 1.7584 5.75229 2.01481 5.7309 2.26652C5.39423 1.67364 4.92622 1.14894 4.2655 0.916859C3.58661 0.679312 2.9492 0.887087 2.53582 1.31952C2.13415 1.73971 1.94438 2.36742 2.09031 2.98746L2.09269 2.99713C2.26478 3.66808 2.52396 4.30316 2.77613 4.90465C2.79814 4.95717 2.8201 5.00941 2.84194 5.06139C3.02139 5.48842 3.19378 5.89866 3.33871 6.31256C2.96404 5.98142 2.51925 5.70796 1.90276 5.6484C1.48865 5.60663 1.10391 5.67536 0.777805 5.88444C0.454239 6.0919 0.240671 6.40405 0.104187 6.75406L0.100868 6.76281C-0.10184 7.31286 0.0663312 7.97157 0.304895 8.42897C0.573704 8.96474 0.996104 9.47904 1.44372 9.96813C1.67046 10.2159 1.91136 10.4652 2.15033 10.7124L2.15682 10.7191C2.39524 10.9658 2.63217 11.2109 2.86134 11.4599C3.80937 12.49 4.50002 13.4632 4.50002 14.5C4.50002 14.7761 4.72388 15 5.00002 15H12C12.2762 15 12.5 14.7761 12.5 14.5C12.5 12.8212 12.8021 11.6462 13.2274 10.4762C13.3653 10.0968 13.5216 9.70579 13.6868 9.29247C14.0238 8.44922 14.398 7.51298 14.7295 6.39175C15.0956 5.15324 15.0559 4.25904 14.7735 3.63017C14.487 2.99208 13.9798 2.6953 13.5763 2.6152C13.1276 2.52614 12.7367 2.60475 12.4268 2.83081C12.4253 2.80773 12.4236 2.78468 12.4219 2.76167C12.3587 1.8105 11.6907 1.12285 10.923 0.947821C10.5346 0.859287 10.1111 0.900393 9.73509 1.11724C9.61852 1.18446 9.51055 1.26623 9.41219 1.3617Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Add user */}
        {username === canvasState?.creater && (
          <button onClick={() => setAddUserModal(true)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
        {/* Users */}
        <button onClick={() => setUsersModal(true)}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        {/* Leave */}
        <button onClick={exitDocHandler}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      {showNotes && (
        // <div key={id} className=" w-40 h-40 bg-yellow-50">Hello world</div>
        <DragNDrop _ref={drawingRef}>
          <StickyNotes value={value} setValue={setValue} />
        </DragNDrop>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => moveStartHandler(e.clientX, e.clientY)}
        onMouseMove={(e) => moveHandler(e.clientX, e.clientY)}
        onMouseUp={(e) => moveEndHandler()}
        // onMouseLeave={(e) => moveEndHandler()}
      ></canvas>
    </div>
  );
};

export default Draw;
