import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import decryptionProcess from '../common/decrypt.jsx';
import { IoHome } from "react-icons/io5";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../services/config.js';

const PatientProfile = () => {
  const [profile, setProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
      console.log('Decryption Patient Response', decryption);
      setProfile(decryption.existingPatient);
    } catch (error) {
      console.error('Error fetching User info:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/updateProfilePic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile photo upload response:', response.data);
      const decryption = await decryptionProcess(response);
      console.log('Decryption Patient Profile', decryption);
      alert("Upload Successfully.", decryption.filePaths);
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
    }
  };


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-700">Profile</h1>
          <Link to="/updatePatientProfile">
            <FaEdit className="text-gray-500 hover:text-gray-800" size={20} />
          </Link>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 mb-4">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto ? `${API_URL}/uploads/${profile.profilePhoto}` : 'patientProfile'}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <div className="rounded-full w-full h-full bg-gray-300" />
            )}
          </div>

          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700" onClick={() => setIsEditing(!isEditing)}>
            <FaEdit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Show the form for uploading a new profile photo if editing mode is enabled */}
        {isEditing && (
          <form onSubmit={handleFileUpload} className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Select Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Upload Photo
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">First Name</label>
            <input
              type="text"
              value={profile.fullName?.split(' ')[0]}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">Last Name</label>
            <input
              type="text"
              value={profile.fullName?.split(' ')[1]}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-gray-600 text-sm">Email</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-gray-600 text-sm">Contact Number</label>
            <input
              type="text"
              value={profile.phone}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-gray-600 text-sm">Address</label>
            <input
              type="text"
              value={profile.address}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">Gender</label>
            <input
              type="text"
              value={profile.gender}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">Age</label>
            <input
              type="text"
              value={profile.age}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <Link to="/patientDashboard"> <button className="flex items-center space-x-2 px-2 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <IoHome className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </button></Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PatientProfile;