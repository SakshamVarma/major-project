import { useState } from "react";

interface NotesType {
  value: string;
  setValue: any;
}

const StickyNotes: React.FC<NotesType> = ({ setValue, value }) => {
  const [minimised, setMinimised] = useState<boolean>(false);

  const minimiseHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("minimised");
    setMinimised((k) => !k);
  };

  return (
    <div
      className={`${!minimised && "w-52 h-60"} rounded-md shadow-lg ${
        // className={`absolute  ${!minimised && "w-52 h-60"} rounded-md shadow-lg ${
        minimised && " h-[2.125rem] w-20 z-40"
      } z-40 border-2 border-black`}
    >
      <div
        className={`h-8 bg-blue-500 flex justify-end items-center gap-2 p-2 ${
          !minimised && "border-b-2"
        } border-black`}
      >
        <button
          className="h-5 w-5 bg-red-500 border-2 border-black rounded-full flex items-center justify-center"
          onClick={(e) => minimiseHandler(e)}
        >
          {/* <VscChromeMinimize /> */}-
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`notesText w-full h-[12.8rem] outline-none resize-none p-2 ${
          minimised && "hidden"
        } font-bold z-50 `}
        spellCheck={false}
        maxLength={160}
      ></textarea>
    </div>
  );
};

export default StickyNotes;
