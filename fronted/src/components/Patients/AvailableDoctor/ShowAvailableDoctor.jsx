import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientSidebar from '../Dashbord/PatientSidebar';
import { API_BASE_URL } from '../../../config/config';
const ShowAvailableDoctor = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState({
    today: [],
    tomorrow: [],
    dayAfterTomorrow: []
  });
  const [selectedDay, setSelectedDay] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const dates = Array.from({length: 3}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return date.toLocaleDateString('en-CA');
        });

        const responses = await Promise.all(
          dates.map(date => 
            axios.get(`${API_BASE_URL}/doctors/available/${date}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
          )
        );

        setDoctors({
          today: responses[0].data.status === 'success' ? responses[0].data.data : [],
          tomorrow: responses[1].data.status === 'success' ? responses[1].data.data : [],
          dayAfterTomorrow: responses[2].data.status === 'success' ? responses[2].data.data : []
        });
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getFilteredDoctors = () => {
    switch(selectedDay) {
      case 'today':
        return { today: doctors.today };
      case 'tomorrow':
        return { tomorrow: doctors.tomorrow };
      case 'dayAfterTomorrow':
        return { dayAfterTomorrow: doctors.dayAfterTomorrow };
      default:
        return doctors;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <PatientSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header Section */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Available Doctors</h1>
            <div className="flex items-center space-x-4">
              {/* Day Filter Dropdown */}
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Days</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="dayAfterTomorrow">Day After Tomorrow</option>
              </select>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedDay === 'all' && [...doctors.today, ...doctors.tomorrow, ...doctors.dayAfterTomorrow].map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} navigate={navigate} />
            ))}
            {selectedDay === 'today' && doctors.today.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} navigate={navigate} />
            ))}
            {selectedDay === 'tomorrow' && doctors.tomorrow.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} navigate={navigate} />
            ))}
            {selectedDay === 'dayAfterTomorrow' && doctors.dayAfterTomorrow.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} navigate={navigate} />
            ))}
            {((selectedDay === 'all' && [...doctors.today, ...doctors.tomorrow, ...doctors.dayAfterTomorrow].length === 0) ||
              (selectedDay === 'today' && doctors.today.length === 0) ||
              (selectedDay === 'tomorrow' && doctors.tomorrow.length === 0) ||
              (selectedDay === 'dayAfterTomorrow' && doctors.dayAfterTomorrow.length === 0)) && (
              <p className="text-gray-500 col-span-full text-center py-4 bg-white rounded-lg shadow-sm">
                No doctors available {selectedDay !== 'all' ? `for ${selectedDay}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor, navigate }) => {
  const [imageError, setImageError] = useState(false);

  // Get the correct date based on selected day
  const getAppointmentDate = () => {
    if (doctor.availabilities && doctor.availabilities.length > 0) {
      return doctor.availabilities[0].date;
    }
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300">
      <div className="p-4">
        <div className="relative mb-3">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-gray-50">
            <img
              src={!imageError && doctor.profile_photo 
                ? `http://127.0.0.1:8000/storage/${doctor.profile_photo}`
                : "https://via.placeholder.com/80"}
              alt={`Dr. ${doctor.first_name}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="absolute top-0 right-1/3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Dr. {doctor.first_name} {doctor.last_name}
          </h3>
          <p className="text-sm text-red-600 font-medium">{doctor.specialization || 'General'}</p>
          <p className="text-sm text-gray-600 mt-1">Experience: {doctor.experience || 'N/A'} years</p>
          <p className="text-sm text-gray-600">Fee: ₹{doctor.consultation_fees || 'N/A'}</p>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => navigate('/patient/appointments', { 
              state: { 
                selectedDoctor: {
                  ...doctor,
                  availabilities: doctor.availabilities,
                  appointmentDate: getAppointmentDate()
                }
              } 
            })}
            className="w-full py-1.5 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment 
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowAvailableDoctor;
