import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import decryptionProcess from '../../common/decrypt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../../services/config';

const validationSchema = Yup.object({
    doctorId: Yup.string().required('Please select a doctor'),
    appointmentFor: Yup.string().required('Please provide an appointment reason'),
    appointmentDate: Yup.date()
        .required('Please provide a date')
        .test('is-future-date', 'Appointment date must be in the future', value => moment(value).isAfter(moment())),
    appointmentTime: Yup.string().required('Please provide a time'),
    disease: Yup.string().required('Please provide details of the disease')
});

const EditAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointment, setAppointments] = useState([]);
    const { _id } = useParams();

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const api = axios.create({
        baseURL: `${API_URL}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(`${API_URL}/getDoctors`);
            const decryption = await decryptionProcess(response);
            console.log('Decryption Response', decryption);
            setDoctors(decryption.existingDoctor);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchAppointment = async () => {
        try {
            const response = await api.get('/getPatientAppointment');
            const decryption = await decryptionProcess(response);
            setAppointments(decryption.patientAppointment || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchAppointment();
    }, []);

    const handleSubmit = async (values) => {
        try {
            await api.patch(`/editAppointment?id=${_id}`, values);
            toast.success('Appointment updated successfully!');
            navigate('/appointmentlists');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Error updating appointment.');
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <div className="appointment-form">
                    <h1 className="text-3xl font-bold mb-4">Edit Appointment</h1>
                    <Formik
                        initialValues={{
                            doctorId: '',
                            appointmentFor: '',
                            appointmentDate: '',
                            appointmentTime: appointment.appointmentTime || '',
                            disease: appointment.disease || ''
                        }}
                        enableReinitialize 
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="bg-white p-6 shadow-md rounded">
                                {/* Doctor Selection */}
                                <div className="mb-4">
                                    <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">Doctor</label>
                                    <Field as="select" name="doctorId" className="mt-1 block w-full px-3 py-2 border rounded">
                                        <option value="">Select a doctor</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.fullName}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="doctorId" component="div" className="text-red-600 text-sm" />
                                </div>

                                {/* Appointment For */}
                                <div className="mb-4">
                                    <label htmlFor="appointmentFor" className="block text-sm font-medium text-gray-700">Appointment For</label>
                                    <Field as="select" name="appointmentFor" className="mt-1 block w-full px-3 py-2 border rounded">
                                        <option value="">Select the reason</option>
                                        <option value="Checkup">Checkup</option>
                                        <option value="Take Medicine">Take Medicine</option>
                                        <option value="Show Reports">Show Reports</option>
                                    </Field>
                                    <ErrorMessage name="appointmentFor" component="div" className="text-red-600 text-sm" />
                                </div>

                                {/* Appointment Date */}
                                <div className="mb-4">
                                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">Appointment Date</label>
                                    <Field
                                        name="appointmentDate"
                                        type="date"
                                        className="mt-1 block w-full px-3 py-2 border rounded"
                                    />
                                    <ErrorMessage name="appointmentDate" component="div" className="text-red-600 text-sm" />
                                </div>

                                {/* Appointment Time */}
                                <div className="mb-4">
                                    <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">Appointment Time (24 Hours)</label>
                                    <Field
                                        name="appointmentTime"
                                        type="text"
                                        className="mt-1 block w-full px-3 py-2 border rounded"
                                    />
                                    <ErrorMessage name="appointmentTime" component="div" className="text-red-600 text-sm" />
                                </div>

                                {/* Disease */}
                                <div className="mb-4">
                                    <label htmlFor="disease" className="block text-sm font-medium text-gray-700">Disease</label>
                                    <Field
                                        name="disease"
                                        type="text"
                                        placeholder="Provide details of the disease"
                                        className="mt-1 block w-full px-3 py-2 border rounded"
                                    />
                                    <ErrorMessage name="disease" component="div" className="text-red-600 text-sm" />
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Appointment'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default EditAppointment;