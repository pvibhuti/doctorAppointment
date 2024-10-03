import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import decryptionProcess from '../common/decrypt.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../services/config.js';

const DoctorDashboard = () => {
  const [profile, setProfile] = useState({});

  const fetchProfile = async () => {
    try {
      const response = await api.get('/getDoctorData');
      const decryption = await decryptionProcess(response);
      console.log('Decryption Response', decryption);
      setProfile(decryption.existingDoctor);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [tommorowappointment, setTommorowAppintment] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchDoctorInfo = async () => {
    try {
      const response = await api.get('/getDoctorData');
      const decryption = await decryptionProcess(response);
      setDoctor(decryption.existingDoctor);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/upcomingAppointment');
      console.log("Appointments data : ", response);

      const decryption = await decryptionProcess(response);
      setAppointments(decryption.upcomingAppointments || []);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTotalAppointments = async () => {
    try {
      const response = await api.get('/totalAppointment');
      const decryption = await decryptionProcess(response);

      setTotalAppointments(decryption.totalAppointments);

    } catch (error) {
      console.error('Error:', error);
    }
  };


  const fetchTodaysAppointments = async () => {
    try {
      const response = await api.get('/todaysAppointment');
      const decryption = await decryptionProcess(response);

      setTodaysAppointments(decryption.todayAppointments);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTommorowAppointments = async () => {
    try {
      const response = await api.get('/tomorrowsAppointment');
      const decryption = await decryptionProcess(response);

      setTommorowAppintment(decryption.tomorrowAppointments);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchDoctorInfo();
    fetchAppointments();
    fetchTotalAppointments();
    fetchTodaysAppointments();
    fetchTommorowAppointments();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate("/login");
    // window.location.href = '/login';
  };

  const handleAppointmentAction = async (action, appointmentId) => {
    if (action === 'Approve') {
      try {
        let id = appointmentId;
        const response = await api.post(`/approveAppointment?id=${id}`);
        alert('Appointment Approved Successfully.');
        console.log(response);
        console.log(`${action} appointment ${appointmentId}`);
      } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.data) {
          toast.error(Object.values(error.response.data).toString());
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
        // alert(' Failed Appointment Approved.');
      }
    } else {
      try {
        let id = appointmentId;
        const response = await api.post(`/rejectAppointment?id=${id}`);
        alert('Appointment Rejected.');
        console.log(response);
        console.log(`${action} appointment ${appointmentId}`);

      } catch (error) {
        // alert('Failed Appointment Rejection.');
        console.error('Error:', error);
        if (error.response && error.response.data) {
          toast.error(Object.values(error.response.data).toString());
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-2xl font-semibold">{doctor.fullName || 'Dr. John Doe'}</h2>
          <div className="mt-4">
            <img src={doctor.profilePhoto ? `${API_URL}/uploads/${doctor.profilePhoto}` : 'DoctorProfile'} alt="Profile" className="rounded-full w-20 h-20" />
          </div>
        </div>
        <nav className="mt-10">
          <Link to="/appointment" ><a href="/" className="block py-2 px-4 hover:bg-gray-700"> Appointments</a> </Link>
          <Link to="/myProfile" > <a href="/" className="block py-2 px-4 hover:bg-gray-700"> My Profile </a> </Link>
          <Link to="/changePassword" > <a href="/" className="block py-2 px-4 hover:bg-gray-700"> Change Password </a> </Link>
          <Link to="/login" ><a href="/" className="block py-2 px-4 hover:bg-gray-700" onClick={logout}>Logout</a> </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome to Doctor Dashboard</h1>
          <div>
            <p className="text-lg">{doctor.fullName || 'Dr. John Doe'}</p>
            <p className="text-sm font-bold item-center">{doctor.designation || 'MBBS'}</p>
            <Link to="/login" ><button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button> </Link>
          </div>
        </header>

        {/* Cards Section */}
        <div className="grid grid-cols-1 items-center md:items-center grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Today's Appointments</h3>
            <p className="text-2xl">{todaysAppointments}</p>
          </div>
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-2xl">{totalAppointments}</p>
          </div>
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Tommorrow Appointments</h3>
            <p className="text-2xl">{tommorowappointment}</p>
          </div>
        </div>

        {/* Appointment List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
          <table className="min-w-full mt-4 bg-white shadow-md rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-blue-100">Patient Name</th>
                <th className="py-2 px-4 border-b bg-blue-100 ">Date</th>
                <th className="py-2 px-4 border-b bg-blue-100">Time</th>
                <th className="py-2 px-4 border-b bg-blue-100">Status</th>
                <th className="py-2 px-4 border-b bg-blue-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{appointment.patientId.fullName}</td>
                  <td className="py-2 px-4 border-b">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                  {/* <td className="py-2 px-4 border-b">{appointment.appointmentDate}</td> */}
                  <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
                  <td className="py-2 px-4 border-b">{appointment.status}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleAppointmentAction('Approve', appointment._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAppointmentAction('Reject', appointment._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Profile Details */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold items-center">Doctor Details</h2>
          <div className="w-half p-6 bg-white rounded-lg shadow-lg item-center">
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Contact Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Expertise</label>
                <input
                  type="text"
                  value={profile.expertise}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Shift Start Time</label>
                <input
                  type="text"
                  value={profile.shiftStartTime}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-gray-600 text-sm">Shift End Time</label>
                <input
                  type="text"
                  value={profile.shiftEndTime}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                />
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default DoctorDashboard;