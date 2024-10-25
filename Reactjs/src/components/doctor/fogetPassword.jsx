import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config.js';
import PasswordShowHide from '../common/PasswordShowHide.jsx';
import { ToastContainer } from 'react-toastify';
import { post } from '../../security/axios.js';
import { toastMessage } from '../helpers/Toast.jsx';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const validationSchemaEmail = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
  });

  const validationSchemaOTP = Yup.object({
    otp: Yup.string().required('OTP is required'),
    newPassword: Yup.string().min(8, 'Password must be at least 8 characters long').required('New password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match').required('Confirm password is required'),
  });

  const handleSendOTP = async (values, { setSubmitting }) => {
    post("/sendOTPForgotPassword", { email: values.email })
      .then((response) => {
        toastMessage('success', 'OTP sent successfully.');
        setEmail(values.email);
        setSubmitting(false);
        setStep(2);
      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error);
        toastMessage('error', Object.values(error.response.data).toString());
        setSubmitting(false);
      })
  };

  const handleVerifyOTP = async (values, { setSubmitting }) => {
    post("/forgotPassword", {
      email,
      otp: values.otp,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    })
      .then((response) => {
        toastMessage('success', 'Password changed successfully.');
        setSubmitting(false);
        navigate('/login');
      })
      .catch((error) => {
        console.log("error Verify OTP ", error.response ? error.response.data : error);
        toastMessage('error', error.response?.data?.message || 'Error verifying OTP.');
        setSubmitting(false);
      })
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">Forgot Password</h2>

        {step === 1 && (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchemaEmail}
            onSubmit={handleSendOTP}
          >
            {() => (
              <Form className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">Email</label>
                  <Field
                    type="email"
                    name="email"
                    className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>
                <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2">
                  Send OTP
                </button>
              </Form>
            )}
          </Formik>
        )}

        {step === 2 && (
          <Formik
            initialValues={{ otp: '', newPassword: '', confirmPassword: '' }}
            validationSchema={validationSchemaOTP}
            onSubmit={handleVerifyOTP}
          >
            {() => (
              <Form className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">OTP</label>
                  <Field
                    type="text"
                    name="otp"
                    className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter OTP"
                  />
                  <ErrorMessage name="otp" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">New Password</label>
                  <PasswordShowHide name="newPassword" placeholder="Entre new password" />
                  <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">Confirm Password</label>
                  <PasswordShowHide name="confirmPassword" placeholder="Entre confirm password" />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
                </div>

                <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2">
                  Reset Password
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;