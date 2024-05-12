import React, { useState } from 'react';
import Modal from 'react-modal';

interface ModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    documentIds: string[];
    handleDocumentClick: (docId: string) => void;
}

const DocListModal: React.FC<ModalProps> = ({
    isOpen,
    onRequestClose,
    documentIds,
    handleDocumentClick,
}) => {
    //const [buttonText, setButtonText] = useState("Copy");
    //console.log("document Id",documentIds);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Document IDs Modal"
        >
            <h2 className="text-2xl font-bold mb-4 ">All the document that you have created</h2>
            <ul className="space-y-2 ">
                {documentIds.map((docId) => {
                    const [buttonText, setButtonText] = useState("Copy");
                    return (
                        <li
                            key={docId}
                            onClick={() => handleDocumentClick(docId)}
                            className="flex justify-between items-center cursor-pointer hover:text-blue-500 border border-gray-300 rounded-md p-2"
                        >
                            <span>{docId}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(docId);
                                    setButtonText("Copied");
                                    setTimeout(() => {
                                        setButtonText("Copy");
                                    }, 2000);

                                }}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                            >
                                {buttonText}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <button
                onClick={onRequestClose}
                className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-2 mt-3 mr-3 rounded-full absolute top-1 right-6"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </Modal>
    );
};

export default DocListModal;