import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../Dashbord/Sidebar';
import { API_BASE_URL } from '../../../config/config';


const ManageAvailability = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const [availabilityData, setAvailabilityData] = useState({
    date: '',
    timeSlots: [{ startTime: '', endTime: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTimeSlot = () => {
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '', endTime: '' }]
    }));
  };

  const removeTimeSlot = (index) => {
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (index, field, value) => {
    const newTimeSlots = [...availabilityData.timeSlots];
    newTimeSlots[index][field] = value;
    setAvailabilityData(prev => ({
      ...prev,
      timeSlots: newTimeSlots
    }));
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(  // Changed from patch to post
        `${API_BASE_URL}/doctors/availability`,
        {
          date: availabilityData.date,
          time_slots: availabilityData.timeSlots.map(slot => ({
            start_time: `${availabilityData.date} ${slot.startTime}`,
            end_time: `${availabilityData.date} ${slot.endTime}`
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        alert('Availability set successfully!');
        setAvailabilityData({
          date: '',
          timeSlots: [{ startTime: '', endTime: '' }]
        });
      }
    } catch (err) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to set availability. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white shadow-lg transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
        <div className="max-w-3xl mx-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                  title="Go back"
                >
                  <FaArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">Manage Availability</h2>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Date Selection */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors duration-200">
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" />
                    Select Date
                  </span>
                </label>
                <input
                  type="date"
                  value={availabilityData.date}
                  onChange={(e) => setAvailabilityData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time Slots Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    Time Slots
                  </label>
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                  >
                    <FaPlus size={12} />
                    Add Time Slot
                  </button>
                </div>

                <div className="space-y-4">
                  {availabilityData.timeSlots.map((slot, index) => (
                    <div key={index} 
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 px-2">to</span>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        </div>
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Remove time slot"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base font-medium flex items-center justify-center gap-2 mt-8 shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Setting Availability...</span>
                  </>
                ) : (
                  'Set Availability'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAvailability;