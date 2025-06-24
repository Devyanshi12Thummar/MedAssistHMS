import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from '../Dashbord/PatientSidebar';
import { API_BASE_URL } from '../../../config/config';


const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDoctor = location.state?.selectedDoctor;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Initialize formData with the correct date format
  // Update the initial formData state to include availability_id
  const [formData, setFormData] = useState({
    doctor_id: selectedDoctor?.user_id || '',
    appointment_date: selectedDoctor?.availabilities?.[0]?.date || '',
    start_time: '',
    end_time: '',
    notes: '',
    availability_id: '' // Add this field
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('Please log in to book an appointment');
          navigate('/login');
          return;
        }

        if (selectedDoctor && selectedDoctor.availabilities) {
          const availableDate = selectedDoctor.availabilities[0]?.date;
          
          const slots = selectedDoctor.availabilities
            .filter(slot => !slot.is_booked)
            .map(slot => ({
              start_time: slot.start_time,
              end_time: slot.end_time,
              doctor_name: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialization || 'General'}`,
              doctor_id: selectedDoctor.user_id,
              date: slot.date,
              id: slot.id // Add availability_id here
            }));
          
          setAvailableSlots(slots);
          
          if (slots.length > 0) {
            setFormData(prev => ({
              ...prev,
              doctor_id: selectedDoctor.user_id,
              appointment_date: slots[0].date,
              start_time: slots[0].start_time,
              end_time: slots[0].end_time,
              availability_id: slots[0].id // Set initial availability_id
            }));
          }
          return;
        }

        // Fallback to fetching all available doctors if no specific doctor is selected
        const date = formData.appointment_date;
        const response = await axios.get(`${API_BASE_URL}/doctors/available/${date}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        if (response.data.status === 'success') {
          setDoctors(response.data.data);
          const slots = response.data.data
            .filter(doctor => doctor.availabilities && Array.isArray(doctor.availabilities) && doctor.availabilities.length > 0)
            .flatMap(doctor =>
              doctor.availabilities
                .filter(slot => !slot.is_booked) // Only unbooked slots
                .map(slot => ({
                  start_time: slot.start_time,
                  end_time: slot.end_time,
                  doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization || 'General'}`,
                  doctor_id: doctor.user_id,
                }))
            );
          setAvailableSlots(slots);
          console.log('Available Slots:', slots);

          if (selectedDoctor && slots.length > 0) {
            const doctorSlot = slots.find(slot => slot.doctor_id === selectedDoctor.user_id);
            if (doctorSlot) {
              setFormData(prev => ({
                ...prev,
                doctor_id: doctorSlot.doctor_id,
                appointment_date: date,
                start_time: doctorSlot.start_time,
                end_time: doctorSlot.end_time,
              }));
              console.log('Set formData for selected doctor:', doctorSlot);
            } else {
              console.log('No slot found for selected doctor:', selectedDoctor);
            }
          }
        } else {
          setError('No available doctors found for the selected date');
          console.log('API Success but no data:', response.data);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch doctors';
        setError(errorMessage);
        console.error('Fetch Doctors Error:', err.response?.data || err);
      }
    };

    fetchDoctors();
  }, [selectedDoctor, navigate]);

  const formatTimeString = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'start_time') {
      const selectedSlot = availableSlots.find(slot => slot.start_time === value);
      if (selectedSlot) {
        setFormData(prev => ({
          ...prev,
          start_time: value,
          end_time: selectedSlot.end_time,
          doctor_id: selectedSlot.doctor_id,
          availability_id: selectedSlot.id
        }));
        console.log('Selected slot:', selectedSlot);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update the slots mapping to include the availability_id
  const slots = selectedDoctor.availabilities
    .filter(slot => !slot.is_booked)
    .map(slot => ({
      start_time: slot.start_time,
      end_time: slot.end_time,
      doctor_name: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialization || 'General'}`,
      doctor_id: selectedDoctor.user_id,
      date: slot.date,
      id: slot.id // Add this line to include the availability ID
    }));

  // Update the handleSubmit function to include availability_id
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to book an appointment');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/appointments/book`,
        {
          doctor_id: formData.doctor_id,
          appointment_date: formData.appointment_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes,
          availability_id: formData.availability_id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.status === 'success') {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/patient/dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to book appointment');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Please ensure all required fields are filled correctly.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to book appointments. Please ensure you are logged in as a patient.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to book appointment');
      }
      console.error('Book Appointment Error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <PatientSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Book Appointments</h1>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {selectedDoctor && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Selected Doctor</h2>
                    <p className="font-medium text-gray-900">
                      Dr. {selectedDoctor.first_name} {selectedDoctor.last_name} - {selectedDoctor.specialization || 'General'}
                    </p>
                  </div>
                )}

                 {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  type="text"
                  name="appointment_date"
                  value={formData.appointment_date ? formData.appointment_date.split('T')[0] : ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <select
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${!formData.start_time ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                >
                  <option value="">Select a time slot</option>
                  {availableSlots.map((slot, index) => (
                    <option key={index} value={slot.start_time} data-availability-id={slot.id}>
                      {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)} ({slot.doctor_name})
                    </option>
                  ))}
                </select>
                {!formData.start_time && (
                  <p className="mt-1 text-sm text-red-600">Please select a time slot</p>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.doctor_id || !formData.appointment_date || !formData.start_time}
                    className={`w-full py-3 px-4 text-white rounded-md font-medium ${
                      loading || !formData.doctor_id || !formData.appointment_date || !formData.start_time
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors duration-200`}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      
    
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 relative z-50">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Appointment Booked Successfully!
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to your appointments...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default BookAppointment;