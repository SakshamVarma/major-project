import Modal from "./Model";
import { DrawContext } from "../context/DrawContext";
import { penColors } from "../Util";
import { useContext, useEffect } from "react";

const ColorWindow: React.FC<{}> = ({}) => {
  const context = useContext(DrawContext);
  const { colorModal, setColorModal, ctxRef, color: clr, setColor, penWidth, setPenWidth } =
    context;
  const closeWindowHandler = () => {
    setColorModal(false);
  };

  useEffect(() => {
    if (!ctxRef.current) {
      console.log("Context is null");
      return;
    }

    ctxRef.current.lineWidth = penWidth;
    ctxRef.current.strokeStyle = clr;

  }, [clr, setColor, penWidth, setPenWidth]);

  return (
    <Modal isOpen={colorModal} onClose={closeWindowHandler}>
      <div className="w-full h-full ">
        <h2>Width</h2>
        <input
          type="range"
          min="0"
          max="10"
          value={penWidth}
          onChange={(e) => {
            if (!ctxRef.current) {
              console.log("Context is null");
              return;
            }

            setPenWidth(+e.target.value)
          }}
          // onChange={(e) => setPenWidth(e.target.value)}
        />
        <h2>Colors</h2>
        <div className="flex items-center justify-between gap-4">
          {penColors.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`w-10 h-10 rounded-full ${clr == color && "ring-2 ring-slate-200"}`}
              onClick={() => setColor(color)}
            ></button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ColorWindow;
