import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHome } from "react-icons/io5";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get, post } from '../../../security/axios.js';
import { toastMessage } from '../../helpers/Toast.jsx';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState({ day: 'today', time: '', status: '', search: '' });

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        return new Promise((resolve, reject) => {
            get(`/getAppointment`, { params: filter })
                .then((response) => {
                    setAppointments(response.data.allAppointments || []);
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error fetching appointments:', error);
                    toastMessage('error', Object.values(error.response.data).toString());
                });
        });
    };

    const handleAppointmentAction = async (action, appointmentId) => {
        const url = action === 1
            ? `/approveAppointment?id=${appointmentId}`
            : `/rejectAppointment?id=${appointmentId}`;
        return new Promise((resolve, reject) => {
            post(url)
                .then((response) => {
                    toastMessage('success',`Appointment ${action === 1 ? 'Approved' : 'Rejected'} Successfully.`);
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    toastMessage('error', Object.values(error.response.data).toString());
                })
        });
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">Appointments</h1>

            {/* Filters */}
            <div className="flex mb-6 space-between">
                <div className="mr-4">
                    <label className="block text-sm font-medium">Filter by Day</label>
                    <select
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        value={filter.day}
                        onChange={(e) => setFilter({ ...filter, day: e.target.value })}
                    >
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="before">Before Today</option>
                        <option value="under_week">Under a Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Filter by Time</label>
                    <input
                        type="time"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        value={filter.time}
                        onChange={(e) => setFilter({ ...filter, time: e.target.value })}
                    />
                </div>
                <div className="mr-4 ml-4">
                    <label className="block text-sm font-medium">Filter by Status</label>
                    <select
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <Link to="/doctor/dashboard">
                    <button className="flex items-center space-x-2 px-5 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <IoHome className="w-3 h-3" />
                        <span>Back to Dashboard</span>
                    </button>
                </Link>
            </div>

            {/* Appointment List */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold">All Appointments</h2>
                <table className="min-w-full mt-4 bg-white shadow-md rounded">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Patient Name</th>
                            <th className="py-2 px-4 border-b">Date</th>
                            <th className="py-2 px-4 border-b">Time</th>
                            <th className="py-2 px-4 border-b">Status</th>
                            <th className="py-2 px-4 border-b">Actions</th>
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
            <ToastContainer />
        </div>
    );
};

export default Appointments;