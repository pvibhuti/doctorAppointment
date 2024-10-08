import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../../services/config';
import AxiosMiddleware, { get } from '../../../security/axios';
import { toastMessage } from '../../helpers/Toast';

const AppointmentLists = () => {
    const [profile, setProfile] = useState({});
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchAppointments();
    }, []);

    const fetchProfile = async () => {
        return new Promise((resolve, reject) => {
            get("/getPatientData")
                .then((response) => {
                    setProfile(response.data.existingPatient);
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error fetching data :', error);
                    reject(error)
                })
        })
    };

    const fetchAppointments = async () => {
        return new Promise((resolve, reject) => {
            get("/getPatientAppointment")
                .then((response) => {
                    setAppointments(response.data.patientAppointment || []);
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    reject(error)
                })
        })
    };

    const deleteAppointment = async (id) => {
        return new Promise((resolve, reject) => {
            AxiosMiddleware('delete', `${API_URL}/deleteAppointment?id=${id}`)
                .then((response) => {
                    toastMessage('success', 'Appointment Deleted Successfully');
                    fetchAppointments();
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error Deleting Appointment:', error);
                    toastMessage('error', 'Error Deleting Appointment');
                    reject(error)
                })
        })
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    const backtoHome = () => {
        navigate("/patient/dashboard");
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