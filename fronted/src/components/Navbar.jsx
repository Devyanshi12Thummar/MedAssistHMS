import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registration';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-300 to-blue-500 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-0">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <div className="flex ml-4 md:ml-20 items-center flex-1">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span className="font-bold text-xl">MedAssist</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 flex-1 justify-center">
            <>
              <Link 
                to="/about" 
                className="hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link 
                to="/login" 
                className="hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Sign In / Sign Up
              </Link>
            </>
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center mr-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8h16M4 16h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden bg-gradient-to-r from-blue-300 to-blue-500 px-4 pb-4 pt-2">
            <Link
              to="/about"
              className="block py-2 font-semibold hover:text-blue-200 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="block py-2 font-semibold hover:text-blue-200 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link
              to="/login"
              className="block py-2 font-semibold hover:text-blue-200 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Sign In / Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;