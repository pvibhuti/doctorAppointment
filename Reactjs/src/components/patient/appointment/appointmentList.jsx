import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import decryptionProcess from '../../common/decrypt';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../../services/config';

const AppointmentLists = () => {
    const [profile, setProfile] = useState({});
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

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/getPatientAppointment');
            const decryption = await decryptionProcess(response);
            setAppointments(decryption.patientAppointment || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteAppointment = async (id) => {
        try {
            await api.delete(`/deleteAppointment?id=${id}`);
            toast.success('Appointment Deleted Successfully');
            fetchAppointments();
        } catch (error) {
            toast.error('Error Deleting Appointment');
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchAppointments();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    const backtoHome = () => {
        navigate("/patientDashboard");
    };

    return (
        <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{profile.fullName}'s Appointments Lists </h1>
                    <div>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                        <button onClick={backtoHome} className="bg-blue-500 text-white px-4 py-2 rounded">Back</button>
                    </div>
                </header>

                {/* Appointment List */}
                <div className="mt-10">
                    <table className="min-w-full mt-4 bg-white shadow-md rounded">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b bg-blue-100">Doctor Name</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Appointment Date</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Appointment Time</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Disease</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Status</th>
                                <th className="py-2 px-4 border-b bg-blue-100">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b">{appointment.doctorId.fullName}</td>
                                    <td className="py-2 px-4 border-b">{moment(appointment.appointmentDate).format('DD-MMM-YYYY')}</td>
                                    <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
                                    <td className="py-2 px-4 border-b">{appointment.disease}</td>
                                    <td className="py-2 px-4 border-b">
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
                                    <td className="py-2 px-4 border-b">
                                        {/* Delete Button */}
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => deleteAppointment(appointment._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default AppointmentLists;