import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import { API_BASE_URL } from '../../config/config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, 
        {
          email: formData.email,
          password: formData.password,
          role: formData.role
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (loginResponse.data.status === 'success') {
        const { token, user } = loginResponse.data.data;

        if (user.role !== formData.role) {
          setError(`Access denied. You are registered as a ${user.role}`);
          setIsLoading(false);
          return;
        }

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_data', JSON.stringify(user));

        try {
          let profileEndpoint = '';
          switch (user.role) {
            case 'doctor':
              profileEndpoint = `${API_BASE_URL}/doctors/profile`;
              break;
            case 'patient':
              profileEndpoint = `${API_BASE_URL}/patients/profile`;
              break;
            default:
              throw new Error('Invalid role');
          }

          const profileResponse = await axios.get(profileEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.data.status === 'success') {
            localStorage.setItem(`${user.role}_data`, JSON.stringify(profileResponse.data.data));

            switch (user.role) {
              case 'doctor':
                navigate('/doctor/dashboard', { replace: true });
                break;
              case 'patient':
                navigate('/patient/dashboard', { replace: true });
                break;
              case 'admin':
                navigate('/admin/dashboard', { replace: true });
                break;
              default:
                throw new Error('Invalid role for navigation');
            }
          }
        } catch (profileError) {
          console.error('Profile Error:', profileError);
          handleAuthError(profileError);
        }
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    localStorage.clear();

    if (error.response) {
      switch (error.response.status) {
        case 401:
          setError('Invalid email or password');
          break;
        case 403:
          setError('Access denied. Please verify your role and credentials.');
          break;
        case 422:
          const validationErrors = error.response.data.errors;
          setError(Object.values(validationErrors).flat().join('\n'));
          break;
        case 429:
          setError('Too many login attempts. Please try again later.');
          break;
        default:
          setError(error.response.data.message || 'Authentication failed');
      }
    } else if (error.request) {
      setError('Network error. Please check your connection.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-2 sm:px-6 md:px-8 lg:px-12 xl:px-0 mt-16">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">MedAssist</h2>
          <h3 className="text-center text-lg sm:text-xl text-gray-600">Sign in to your account</h3>
        </div>

        <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
          <div className="bg-white py-6 px-3 sm:px-6 md:px-8 shadow-lg rounded-lg">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form className="space-y-6 w-full mx-auto" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 bg-white shadow-sm text-gray-700 text-base"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 shadow-sm text-base"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 shadow-sm text-base"
                  placeholder="Enter your password"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-150 ease-in-out"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 hover:text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm mt-2 sm:mt-0">
                  <Link 
                    to="/forgotpassword" 
                    className="font-semibold text-blue-600 hover:text-blue-700 transition duration-150 ease-in-out"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out shadow-md ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg active:bg-blue-800'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base">Signing in...</span>
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Registration link section - Hide for admin role */}
            {formData.role !== 'admin' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/registration"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Create a new account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;