import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import decryptionProcess from '../../components/common/decrypt.jsx';
import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../services/config.js';

const PatientDashboard = () => {
    const [profile, setProfile] = useState({});
    const [patient, setPatient] = useState({});
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const api = axios.create({
        baseURL: `${API_URL}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const fetchProfile = async () => {
        try {
            const response = await api.get('/getPatientData');
            const decryption = await decryptionProcess(response);
            setProfile(decryption.existingPatient);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPatientInfo = async () => {
        try {
            const response = await api.get('/getPatientData');
            const decryption = await decryptionProcess(response);
            setPatient(decryption.existingPatient);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/getPatientAppointment');
            const decryption = await decryptionProcess(response);
            setAppointments(decryption.patientAppointment || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchPatientInfo();
        fetchAppointments();
    },[]);

    const logout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white min-h-screen">
                <div className="p-4">
                    <h2 className="text-2xl font-semibold">{patient.fullName || 'John Doe'}</h2>
                    <div className="mt-4">
                        <img
                            src={patient.profilePhoto ? `${API_URL}/uploads/${patient.profilePhoto}` : 'patientPhoto'}
                            alt="Profile"
                            className="rounded-full w-20 h-20"
                        />
                    </div>
                </div>
                <nav className="mt-10">
                    <Link to="/patientProfile" className="block py-2 px-4 hover:bg-gray-700">My Profile</Link>
                    <Link to="/bookAppointment" className="block py-2 px-4 hover:bg-gray-700">Book Appointments</Link>
                    <Link to="/appointmentlists" className="block py-2 px-4 hover:bg-gray-700">Appointments Lists</Link>
                    <Link to="/changePatientPassword" className="block py-2 px-4 hover:bg-gray-700">Change Password</Link>
                    <span
                        className="block py-2 px-4 hover:bg-gray-700 cursor-pointer"
                        onClick={logout}
                    >
                        Logout
                    </span>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Welcome {patient.fullName} to your Dashboard</h1>
                    <div>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                    </div>
                </header>

                {/* Appointment List */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold">Appointments Lists</h2>
                    <table className="min-w-full mt-4 bg-white shadow-md rounded">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b bg-blue-100">Doctor Name</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Appointment Date</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Appointment Time</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Disease</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b">{appointment.doctorId.fullName}</td>
                                    <td className="py-2 px-4 border-b">{moment(appointment.appointmentDate).format('DD-MMM-YYYY')}</td>
                                    {/* <td className="py-2 px-4 border-b">{appointment.appointmentDate}</td> */}
                                    <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
                                    <td className="py-2 px-4 border-b">{appointment.disease}</td>
                                    <td className="py-2 px-4 border-b">
                                        {/* {appointment.status === 0 ? "Pending" : appointment.status === 1 ? "Approved" : "Rejected"} */}
                                        {appointment.status === 0 ? (
                                            <span className="bg-gray-500 text-white px-2 py-1 rounded"> Pending  </span>
                                        ) : (
                                            <span>
                                                {appointment.status === 1 ? (
                                                    <span className="bg-green-400 text-white px-1 py-1 rounded"> Approved </span>
                                                ) : (
                                                    <span className="bg-red-400 text-white px-2 py-1 rounded"> Rejected </span>
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
                    <h2 className="text-2xl font-bold">Profile Details</h2>
                    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.fullName || ''}
                                    readOnly
                                    className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm">Email</label>
                                <input
                                    type="email"
                                    value={profile.email || ''}
                                    readOnly
                                    className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm">Contact Number</label>
                                <input
                                    type="text"
                                    value={profile.phone || ''}
                                    readOnly
                                    className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-gray-600 text-sm">Address</label>
                                <input
                                    type="text"
                                    value={profile.address || ''}
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

export default PatientDashboard;