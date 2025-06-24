import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { 
      path: '/doctor/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    
    { 
      path: '/doctor/appointments', 
      label: 'Appointments', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      path: '/doctor/availability', 
      label: 'Availability', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    
  ];

  return (
    <div className={`bg-white h-screen fixed left-0 top-0 border-r border-gray-200 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Toggle Button */}
      <div className="p-4">
        <button 
          onClick={toggleSidebar}
          className="w-10 absolute right-0 flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </button>
      </div>

      {/* App Logo */}
      <div className="px-4 mb-6 p-4">
        <div className="flex items-center justify-center py-2">
          <span className="text-blue-500 text-2xl">⚕️</span>
          {isOpen && <span className="ml-2 text-xl font-semibold text-[#1B2559]">MedAssist</span>}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 relative ${
                location.pathname === item.path 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={!isOpen ? item.label : ''}
            >
              {item.icon}
              {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
              {item.hasNotification && (
                <span className="absolute right-4 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-4 right-4">
        <button
          className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          onClick={handleLogout}
          title={!isOpen ? 'Logout' : ''}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;