import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import "../../assets/css/register.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';
import PasswordShowHide from '../common/PasswordShowHide';
import AuthService from '../../services/AuthServices';
import { toastMessage } from '../helpers/Toast';

const RegisterForm = () => {
    const [userType, setUserType] = React.useState('patient');
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        fullName: Yup.string().required('Full Name is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        address: Yup.string().required('Address is required'),
        phone: Yup.number().required('Phone number is required'),
        gender: Yup.string().required('Gender is required'),
    });

    const handleSubmit = async (values, { resetForm }) => {
        console.log('Form data', values);
        debugger;
    
        const url = userType === "patient" 
            ? `${API_URL}/registerPatient` 
            : `${API_URL}/registerDoctor`;
    
        const registrationData = {
            ...values,
            userType,
        };
    
        AuthService.registration(registrationData, url) 
            .then((response) => {
                console.log('Registration successful:', response);
                alert("Registration Successfully.")
                navigate("/login");
                resetForm();
            })
            .catch((error) => {
                console.error('Registration error:', error);
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Register as {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>

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
                    initialValues={{ fullName: '', email: '', phone: '', password: '', gender: '', address: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ setFieldValue }) => (
                        <Form>
                            {/* Full Name */}
                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">Full Name</label>
                                <Field name="fullName" type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your full name" />
                                <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                                <Field name="email" type="email" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your email" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Phone */}
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone</label>
                                <Field name="phone" type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your phone number" />
                                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Password */}
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                                {/* <Field name="password" type="password" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your password" /> */}
                                <PasswordShowHide name="password" placeholder="Entre your password"/>
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Gender */}
                            <div className="mb-4">
                                <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">Gender</label>
                                <Field as="select" name="gender" className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="" label="Select gender" />
                                    <option value="male" label="Male" />
                                    <option value="female" label="Female" />
                                </Field>
                                <ErrorMessage name="gender" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Address */}
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-gray-700 font-medium mb-1">Address</label>
                                <Field name="address" as="textarea" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your address" rows="3" />
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
                                    Register
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <ToastContainer />
        </div>
    );
};

export default RegisterForm;