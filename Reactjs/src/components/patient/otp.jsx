import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';

const Otp = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const token = localStorage.getItem('token');

    const api = axios.create({
      baseURL: `${API_URL}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });



    try {
      const response = await api.post('/forgotPatientPassword', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      console.log("Forget password : ", response);
      toastMessage('success',"password Change Successfully.")
      setMessage(response.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-xl font-bold text-gray-700 mb-6">
          Verify OTP and Change Password
        </h2>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">OTP</label>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Otp;