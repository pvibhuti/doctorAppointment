import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import decryptionProcess from '../common/decrypt.jsx';
import { IoHome } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../services/config.js';

const MyProfile = () => {
  const [profile, setProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDocumentEditing, setIsDocumentEditing] = useState(false);

  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/getDoctorData');
      const decryption = await decryptionProcess(response);
      setProfile(decryption.existingDoctor);
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);
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
      const response = await api.post('/updateProfilePhoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);      
      alert("Upload Successfully.");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (selectedFile.length === 0) {
      alert("Please select files first!");
      return;
    }

    const formData = new FormData();
    Array.from(selectedFile).forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await api.post('/uploadDocuments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("Upload Document", response.data);
      const decryption = await decryptionProcess(response);
      console.log("Decrypt Data", decryption.data);

      toast.success(decryption.data);
      alert("Documents Uploaded Successfully.")
      setIsDocumentEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error("Error uploading document.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-700">Profile</h1>
          <Link to="/updateProfile">
            <FaEdit className="text-gray-500 hover:text-gray-800" size={20} />
          </Link>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 mb-4">
            {profile.profilePhoto ? (
              <img
                src={`${API_URL}/uploads/${profile.profilePhoto}`}
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

        {/* Upload Profile Photo Form */}
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

        {/* Document Upload Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Uploaded Documents</h2>
          {/* {profile.degreeCertificate &&
            profile.degreeCertificate.map((doc, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <span>{doc}</span>
                <a
                  href={`${API_URL}/uploads/${doc}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View
                </a>
              </div>
            ))} */}
          <button
            className="flex items-center space-x-2 px-3 py-1 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
            onClick={() => setIsDocumentEditing(!isDocumentEditing)}
          >
            <FaEdit className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {isDocumentEditing && (
          <form onSubmit={handleDocumentUpload} className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Select Documents</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-2 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Upload Documents
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
            <label className="text-gray-600 text-sm">Expertise
            </label>
            <input
              type="text"
              value={profile.expertise}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm">Designation
            </label>
            <input
              type="text"
              value={profile.designation}
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Link to="/" className="text-blue-500 hover:underline">
            <IoHome className="inline-block mr-1" />
            Home
          </Link>
          <Link to="/doctorDashboard" className="text-blue-500 hover:underline">
            Back
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MyProfile;