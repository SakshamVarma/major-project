import React, { useState } from 'react';
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sendMessage: (message: string) => void;
  chatMessages: { userMessage: string; aiResponse: string }[];
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose, sendMessage, chatMessages }) => {
  const [message, setMessage] = useState('');

const [isLoading, setIsLoading] = useState(false);

const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
};

const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    await sendMessage(message);
    setIsLoading(false);
    
};

// Rest of the code...

// const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setIsLoading(true);
//     await sendMessage(message);
//     setMessage('');
//     setIsLoading(false);
// };

return (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Chat Overlay"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">AI Chat</h2>
                <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto mb-4">
                {chatMessages.map((message, index) => (
                    <div key={index} className="mb-4">
                        <p className="text-gray-800 bg-gray-200 p-2 rounded-md mb-1">
                            <span className="flex items-center">
                                <img src="/assets/user.png" alt="User Icon" className="w-4 h-4 mr-2" />
                                {message.userMessage}
                            </span>
                        </p>
                        <p className="text-gray-600 bg-gray-100 p-2 rounded-md">
                            <span className="flex items-center">
                                <img src="/assets/ai.png" alt="AI Icon" className="w-4 h-4 mr-2" />
                                <ReactMarkdown>{message.aiResponse}</ReactMarkdown>
                            </span>
                        </p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Type your message..."
                    className="flex-grow mr-2 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647zm10-10.582A7.965 7.965 0 0120 12h4c0-6.627-5.373-12-12-12v4zm2 5.291l3 1.647C22.865 17.824 24 15.042 24 12h-4a7.962 7.962 0 01-2 5.291zM12 20c3.042 0 5.824-1.135 7.938-3l-1.647-3A7.965 7.965 0 0012 20zm-5.291-10H3.062A7.965 7.965 0 004 12h4.647a8 8 0 01-1.938-2.709zM12 4c-3.042 0-5.824 1.135-7.938 3l1.647 3A7.965 7.965 0 0012 4zm5.291 10h4.647A7.965 7.965 0 0020 12h-4.647a8 8 0 01-1.938 2.709z"
                            />
                        </svg>
                    ) : (
                        'Send'
                    )}
                </button>
            </form>
        </div>
    </Modal>
);
};

export default ChatOverlay;