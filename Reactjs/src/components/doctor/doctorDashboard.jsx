import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get, post } from '../../security/axios.js';
import { toastMessage } from '../helpers/Toast.jsx';
import { API_URL } from '../../services/config.js';
import { fetchData } from '../common/handleMethods.jsx';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { ActionCreators } from '../../store/action/action';

const DoctorDashboard = () => {
  // const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [tommorowappointment, setTommorowAppintment] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const doctorData = useSelector((state) => state.doctorProfile);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchData('/getDoctorData', (data) => {console.log("--------------data-------", data);
     dispatch(ActionCreators.GET_DOCTOR(data.existingDoctor)); })// setDoctor(data.existingDoctor)
    await fetchData('/upcomingAppointment', (data) => { setAppointments(data.upcomingAppointments) })
    await fetchData('/allcountAppointment', (data) => {
      setTotalAppointments(data.totalAppointments);
      setTodaysAppointments(data.todayAppointments);
      setTommorowAppintment(data.tomorrowAppointments);
    })
  }

  const handleAppointmentAction = async (action, appointmentId) => {
    const url = action === 1
      ? `/approveAppointment?id=${appointmentId}`
      : `/rejectAppointment?id=${appointmentId}`;
    post(url)
      .then((response) => {
        toastMessage('success', `Appointment ${action === 1 ? 'Approved' : 'Rejected'} Successfully.`);
      })
      .catch((error) => {
        console.error('Error:', error);
        toastMessage('error', Object.values(error.response.data).toString());

      })
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-2xl font-semibold">{doctorData.fullName || 'Dr. John Doe'}</h2>
          <div className="mt-4">
            <img src={doctorData.profilePhoto ? `${API_URL}/uploads/${doctorData.profilePhoto}` : 'DoctorProfile'} alt="Profile" className="rounded-full w-20 h-20" />
          </div>
        </div>
        <nav className="mt-10">
          <Link to="/doctor/appointments" ><a href="/doctor/appointments" className="block py-2 px-4 hover:bg-gray-700"> Appointments</a> </Link>
          <Link to="/doctor/myProfile" > <a href="/doctor/myProfile" className="block py-2 px-4 hover:bg-gray-700"> My Profile </a> </Link>
          <Link to="/doctor/changePassword" > <a href="/doctor/changePassword" className="block py-2 px-4 hover:bg-gray-700"> Change Password </a> </Link>
          <Link to="/login" ><a href="/login" className="block py-2 px-4 hover:bg-gray-700" onClick={logout}>Logout</a> </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome to Doctor Dashboard</h1>
          <div>
            <p className="text-lg">{doctorData.fullName || 'Dr. John Doe'}</p>
            <p className="text-sm font-bold item-center">{doctorData.designation || 'MBBS'}</p>
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
                  <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
                  <td className="py-2 px-4 border-b">
                    {appointment.status === 0 ? "Pending" : appointment.status === 1 ? "Approved" : "Rejected"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {appointment.status === 0 ? (
                      <>
                        <button
                          onClick={() => handleAppointmentAction(1, appointment._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(2, appointment._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>
                        {appointment.status === 1 ? (
                          <span className="bg-green-200 px-2 py-1 rounded">Approved</span>
                        ) : (
                          <span className="bg-red-200 px-2 py-1 rounded">Rejected</span>
                        )}
                      </span>
                    )}
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
              <ProfileField label="Full Name" value={doctorData.fullName} />
              <ProfileField label="Email" value={doctorData.email} />
              <ProfileField label="Contact Number" value={doctorData.phone} />
              <ProfileField label="Gender" value={doctorData.gender} />
              <ProfileField label="Designation" value={doctorData.designation} />
              <ProfileField label="expertise" value={doctorData.expertise} />
              <ProfileField label="shiftStartTime" value={doctorData.shiftStartTime} />
              <ProfileField label="shiftEndTime" value={doctorData.shiftEndTime} />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />

    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div className="border-b py-4">
    <h3 className="font-bold">{label}:</h3>
    <p>{value || 'Not Provided'}</p>
  </div>
);

export default DoctorDashboard;