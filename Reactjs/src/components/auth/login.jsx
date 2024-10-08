import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import "../../assets/css/login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';
import PasswordShowHide from '../common/PasswordShowHide';
import AuthService from '../../services/AuthServices';

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('doctor');

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required').min(8, "Minimum 8 characters").max(15, "Maximum 15 characters")
    });

    const handleSubmit = async (values) => {
        debugger;

        const url = userType === 'patient'
            ? `${API_URL}/loginPatient`
            : `${API_URL}/loginDoctor`;

        const nevigate = userType === 'patient'
            ? `/patient/dashboard`
            : `/doctor/dashboard`;

        const loginData = {
            ...values,
            userType,
        }

        AuthService.login(loginData, url, navigate)
            .then((response) => {
                alert('Login Successfully!');
                navigate(userType === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
            })
            .catch((error) => {
                console.error('Login error:', error);
            });
    }

    const handleForgetPassword = () => {
        navigate(userType === 'doctor' ? '/doctor/forgotPassword' : '/patient/forgotPassword');
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

                            {/* Password with Show/Hide functionality */}
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                                <PasswordShowHide name="password" placeholder="Entre your password" />
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
                                    to={userType === 'doctor' ? "/doctor/forgotPassword" : "/patient/forgotPassword"}
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