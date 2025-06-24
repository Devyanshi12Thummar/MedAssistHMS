import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import { API_BASE_URL } from '../../config/config';

const Registration = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: '',
    alpha: '',
    special: '',
    number: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'firstName' || name === 'lastName') {
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) {
        return;
      }
      const capitalizedValue = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setFormData(prev => ({
        ...prev,
        [name]: capitalizedValue
      }));
      return;
    }
    if (name === 'contactNumber') {
      const numberRegex = /^[0-9]*$/;
      if (!numberRegex.test(value)) {
        return;
      }
      if (value.length > 10) {
        return;
      }
    }
    if (name === 'emailAddress') {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const lowerCaseValue = value.toLowerCase().trim();
      setFormData(prev => ({
        ...prev,
        [name]: lowerCaseValue
      }));
      if (!emailRegex.test(lowerCaseValue) && lowerCaseValue !== '') {
        console.log('Invalid email format');
      }
    }
    if (name === 'password' || name === 'confirmPassword') {
      validatePassword(value);
    }
    if (type === 'checkbox') {
      if (name.startsWith('medicalConditions.')) {
        const condition = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          medicalConditions: {
            ...prev.medicalConditions,
            [condition]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (type === 'file') {
      const fileType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [fileType]: e.target.files[0]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validatePassword = (password) => {
    let lengthMsg = password.length >= 6 && password.length <= 8 ? '✓ Password length is valid' : '✗ Password length should be between 6 and 8 characters';
    let alphaMsg = /[A-Za-z]/.test(password) ? '✓ Contains alphabets' : '✗ Should contain alphabets';
    let specialMsg = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password) ? '✓ Contains special symbols' : '✗ Should contain special symbols';
    let numberMsg = /\d/.test(password) ? '✓ Contains numbers' : '✗ Should contain numbers';

    setPasswordValidation({
      length: lengthMsg,
      alpha: alphaMsg,
      special: specialMsg,
      number: numberMsg,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    const userData = {
      email: formData.emailAddress.trim(),
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role: formData.role,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      contact_number: formData.contactNumber.trim(),
    };
    try {
      console.log('Sending registration data:', userData);
      const response = await axios.post(`${API_BASE_URL}/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (response.data.status === 'success') {
        setVerificationSent(true);
        setMessage("Registration successful! Please verify your email.");
        if (response.data.data?.token) {
          localStorage.setItem('auth_token', response.data.data.token);
        }
        navigate('/login');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      console.error('Registration error:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/email/resend`, { email: formData.email });
      setMessage('Verification email resent. Please check your inbox.');
    } catch (error) {
      setMessage('Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4 md:px-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#a4cbe3] p-4 rounded-t-lg">
            <h2 className="text-lg sm:text-xl font-semibold">Create Account</h2>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-b-lg shadow-md">
            {!verificationSent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Select Role Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-blue-800 font-medium mb-4 text-base sm:text-lg">Select Role</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Role:
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Basic Information Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-blue-800 font-medium mb-4 text-base sm:text-lg">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> First Name:
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                        pattern="[A-Za-z\s]+"
                        title="Only letters and spaces are allowed"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Last Name:
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                        pattern="[A-Za-z\s]+"
                        title="Only letters and spaces are allowed"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Date of Birth:
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Contact:
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                        placeholder="Enter 10-digit number"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Email:
                      </label>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                        placeholder="example@gmail.com"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <label className="text-sm w-full sm:w-32 mb-1 sm:mb-0">
                        <span className="text-red-500">*</span> Gender:
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Security Information Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-blue-800 font-medium mb-4 text-base sm:text-lg">Security Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm mb-1">
                        <span className="text-red-500">*</span> Password:
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`border rounded px-2 py-1 ${
                          formData.password && 
                          passwordValidation.length.startsWith('✓') && 
                          passwordValidation.alpha.startsWith('✓') && 
                          passwordValidation.special.startsWith('✓') && 
                          passwordValidation.number.startsWith('✓') 
                            ? 'border-green-500' 
                            : 'border-gray-300'
                        }`}
                        required
                        minLength="6"
                        maxLength="8"
                      />
                      <div className="mt-2 text-sm space-y-1">
                        {Object.values(passwordValidation).map((validation, index) => (
                          <p
                            key={index}
                            className={`flex items-center ${
                              !formData.password ? 'text-gray-600' : 
                              validation.startsWith('✓') ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {validation}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm mb-1">
                        <span className="text-red-500">*</span> Confirm Password:
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`border rounded px-2 py-1 ${
                          formData.confirmPassword && formData.password === formData.confirmPassword 
                            ? 'border-green-500' 
                            : 'border-gray-300'
                        }`}
                        required
                        maxLength="8"
                        minLength="6"
                      />
                      {formData.confirmPassword && (
                        <p className={`text-sm mt-2 ${
                          formData.password === formData.confirmPassword 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formData.password === formData.confirmPassword 
                            ? '✓ Passwords match' 
                            : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Submit Button */}
                <div className="flex justify-start">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-colors duration-200 w-full sm:w-auto"
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
                {/* Sign In Link */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                      Sign in to your account
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <p className="mb-4 text-center text-base sm:text-lg">A verification link has been sent to your email.</p>
                <div className="flex justify-center">
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-colors duration-200"
                  >
                    {resendLoading ? 'Resending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;