import React, { useState } from 'react';
import axios from 'axios';

const AyurvedicChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        const userMessage = input;
        setInput('');

        try {
            const response = await axios.post('https://medassist1-1.onrender.com/chat', {
                user_input: userMessage
            });

            setMessages(prev => [...prev, {
                user: userMessage,
                bot: response.data.response,
                timestamp: new Date().toLocaleString()
            }]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chat Icon */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-5 right-5 w-16 h-16 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full flex items-center justify-center shadow-lg hover:from-blue-400 hover:to-blue-600 transition-transform hover:scale-110 z-50 ${isOpen ? 'hidden' : ''}`}
            >
                <span className="text-white text-3xl">🤖</span>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-5 w-96 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 ${
                isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}>
                <div className="bg-gradient-to-r from-blue-300 to-blue-500 rounded-t-lg p-4 flex justify-between items-center">
                    <h3 className="text-white font-semibold">MedAssist Chat</h3>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:text-blue-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                    {messages.map((message, index) => (
                        <div key={index} className="mb-4">
                            <div className="text-xs text-blue-500 mb-1">
                                {message.timestamp}
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg mb-2 text-right">
                                <span>You: {message.user}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                                <span>Assistant: {message.bot}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-blue-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your symptoms..."
                            className="flex-1 p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg text-white ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600'
                            }`}
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AyurvedicChat;