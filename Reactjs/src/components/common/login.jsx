import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import "../../assets/css/login.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DecryptionProcess from './decrypt';
import { API_URL } from '../../services/config';

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('doctor');

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required')
    });

    console.log("API ", `${API_URL}`);
    const handleSubmit = async (values) => {
        console.log('Form data', values);
        if (userType === 'patient') {
            try {
                const response = await axios.post(`${API_URL}/loginPatient`, values);
                console.log("Login Patient", response.data);

                const decrypt = await DecryptionProcess(response);
                console.log("decrypt for Patient Login ", decrypt);

                if (decrypt) {
                    localStorage.setItem("token", decrypt.token);
                    alert('Login Successfully.');
                    navigate("/patientDashboard");
                } else {
                    console.error('Unexpected data format after decryption:', decrypt);
                    alert('Login Failed.');
                    navigate("/login");
                }

            } catch (error) {
                console.error('Error:', error);
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Something went wrong');
                } else {
                    toast.error('Network error. Please try again.');
                }
            }
        } else {
            try {
                const response = await axios.post(`${API_URL}/loginDoctor`, values);
                console.log("Login Doctor", response.data);

                const decrypt = await DecryptionProcess(response);
                console.log("decrypt for Doctor Login ", decrypt);

                if (decrypt) {
                    localStorage.setItem("token", decrypt.token);
                    alert('Login Successfully.');
                    navigate("/doctorDashboard");
                } else {
                    console.error('Unexpected data format after decryption:', decrypt);
                    alert('Login Failed.');
                    navigate("/login");
                }

            } catch (error) {
                console.error('Error:', error);
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Something went wrong');
                } else {
                    toast.error('Network error. Please try again.');
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login as {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>

                {/* Toggle between doctor and patient */}
                <div className="mb-4 text-center">
                    <button
                        className={`px-4 py-2 mx-2 rounded ${userType === 'doctor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setUserType('doctor')}
                    >
                        Doctor
                    </button>
                    <button
                        className={`px-4 py-2 mx-2 rounded ${userType === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setUserType('patient')}
                    >
                        Patient
                    </button>
                </div>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form>
                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                                <Field name="email" type="email" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your email" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Password */}
                            <div className="mb-4">
                                <label type={
                                    values.password
                                        ? "text"
                                        : "password"
                                } htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                                <Field name="password" type="password" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your password" />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 w-full">
                                    Login as {userType === 'doctor' ? 'Doctor' : 'Patient'}
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">Don't have an account?</p>
                                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                                    Sign Up
                                </Link>
                            </div>

                            {/* Conditional Forget Password Link */}
                            <div className="mt-6 text-center">
                                <Link
                                    to={userType === 'doctor' ? "/forgetPassword" : "/forgotPatientPassword"}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Forget Password
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;