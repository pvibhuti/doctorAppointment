import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import decryptionProcess from "../../components/common/decrypt.jsx";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config.js';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const api = axios.create({
    baseURL: `${API_URL}`,
  });

  const formikSendOTP = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email format').required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await api.post('/sendOTPForgotPassword', { email: values.email });
        const decryption = await decryptionProcess(response);
        setMessage(decryption);
        alert("OTP sent successfully.");
        setEmail(values.email); 
        setStep(2);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Error sending OTP.');
      }
    },
  });

  const formikVerifyOTP = useFormik({
    initialValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string().required('OTP is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters long')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await api.post('/forgotPassword', {
          email,
          otp: values.otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        alert("Password changed successfully.");
        setMessage(response.data.message);
        navigate("/login");
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Error verifying OTP.');
      }
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">Forgot Password</h2>
        
        {step === 1 && (
          <form onSubmit={formikSendOTP.handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formikSendOTP.values.email}
                onChange={formikSendOTP.handleChange}
                onBlur={formikSendOTP.handleBlur}
                className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                required
              />
              {formikSendOTP.touched.email && formikSendOTP.errors.email ? (
                <div className="text-red-500 text-sm">{formikSendOTP.errors.email}</div>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={formikVerifyOTP.handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm">OTP</label>
              <input
                type="text"
                name="otp"
                value={formikVerifyOTP.values.otp}
                onChange={formikVerifyOTP.handleChange}
                onBlur={formikVerifyOTP.handleBlur}
                className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                required
              />
              {formikVerifyOTP.touched.otp && formikVerifyOTP.errors.otp ? (
                <div className="text-red-500 text-sm">{formikVerifyOTP.errors.otp}</div>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-600 text-sm">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formikVerifyOTP.values.newPassword}
                onChange={formikVerifyOTP.handleChange}
                onBlur={formikVerifyOTP.handleBlur}
                className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                required
              />
              {formikVerifyOTP.touched.newPassword && formikVerifyOTP.errors.newPassword ? (
                <div className="text-red-500 text-sm">{formikVerifyOTP.errors.newPassword}</div>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-600 text-sm">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formikVerifyOTP.values.confirmPassword}
                onChange={formikVerifyOTP.handleChange}
                onBlur={formikVerifyOTP.handleBlur}
                className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                required
              />
              {formikVerifyOTP.touched.confirmPassword && formikVerifyOTP.errors.confirmPassword ? (
                <div className="text-red-500 text-sm">{formikVerifyOTP.errors.confirmPassword}</div>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;