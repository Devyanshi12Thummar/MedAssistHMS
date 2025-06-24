//Appointment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Dashbord/Sidebar';
import { API_BASE_URL } from '../../../config/config';


const Appointment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_BASE_URL}/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('API Response:', response.data);

        if (response.data.status === 'success') {
          const appointmentsData = response.data.data.data || [];
          setAppointments(appointmentsData);
          console.log('Appointments set:', appointmentsData);
        } else {
          setError('Failed to fetch appointments');
          setAppointments([]);
        }
      } catch (error) {
        console.error('Full error:', error);
        setError('Error fetching appointments: ' + (error.response?.data?.message || error.message));
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const currentAppointment = appointments.find(apt => apt.id === appointmentId);
      
      const payload = {
        status: newStatus,
        notes: currentAppointment.notes || `Appointment ${newStatus}`
      };

      // Only add time fields if accepting the appointment
      if (newStatus === 'accepted') {
        payload.start_time = currentAppointment.start_time;
        payload.end_time = currentAppointment.end_time;
      }

      const response = await axios.put(
        `${API_BASE_URL}/appointments/respond/${appointmentId}`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        // Update the local state with the new appointment data
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, request_status: newStatus }
            : appointment
        ));
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    console.log('Filtering appointment:', appointment);
    const patientName = `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim();
    return patientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-8 h-full">
          {/* Header and Search Bar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Appointments Management
            </h1>

          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-240px)]">
            <div className="overflow-auto h-full">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patient?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(appointment.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(appointment.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                            value={appointment.request_status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                            className={`rounded-full px-3 py-1 text-sm font-semibold cursor-pointer transition-colors duration-150 ${getStatusClass(appointment.request_status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accept</option>
                            <option value="rejected">Reject</option>
                          </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;