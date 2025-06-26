import { useState, useEffect } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';

const ChatBoard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatFormData = (data) => {
    if (typeof data === 'string') return data;
    
    return Object.entries(data)
      .map(([key, value]) => {
        const formattedKey = key.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return `${formattedKey}: ${value}`;
      })
      .join('\n');  
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('https://medassist1-1.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: message }),
      });
      const data = await res.json();
      const newMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      const newResponse = {
        type: 'bot',
        content: formatFormData(data.response),
        timestamp: new Date().toISOString(),
        isFormData: typeof data.response === 'object'
      };
      const updatedHistory = [...chatHistory, newMessage, newResponse];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 group"
      >
        <FaRobot size={24} className="animate-bounce" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        <span className="absolute hidden group-hover:block -top-10 -left-16 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap">AI Health Assistant</span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Ayurvedic Health Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  {msg.type === 'bot' && (
                    <div className="flex items-center mb-1">
                      <FaRobot className="text-blue-500 mr-1" size={16} />
                      <span className="text-sm text-gray-600 font-medium">AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg ${msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'} 
                      transform transition-all duration-200 hover:scale-[1.02]
                      ${msg.isFormData ? 'whitespace-pre font-mono text-sm' : ''}`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your symptoms..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBoard;