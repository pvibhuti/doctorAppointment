import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import decryptionProcess from '../../common/decrypt.jsx';
import { IoHome } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../../services/config.js';
import { get, post } from '../../../security/axios.js';
import { toastMessage } from '../../helpers/Toast.jsx';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

const MyProfile = () => {
  const [profile, setProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDocumentEditing, setIsDocumentEditing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  const doctorData = useSelector((state) => state.doctorProfile); 

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    return new Promise((resolve, reject) => {
      get('/getDoctorData')
        .then((response) => {
          setProfile(response.data.existingDoctor);
          resolve(response);
        })
        .catch((error) => {
          console.error('Error fetching doctor info:', error);
          reject(error);
        })
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDocumentChange = (event) => {
    setSelectedDocuments(event.target.files);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toastMessage('error',"Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    return new Promise((resolve, reject) => {
      post('/updateProfilePhoto', formData)
        .then((response) => {
          toastMessage('success',"Profile Photo Upload Successfully.");
          setIsEditing(false);
          fetchProfile();
          resolve(response);
        })
        .catch((error) => {
          console.error('Error:', error);
          toastMessage('error', error.response.data.message || "error Upload Image");
          reject(error);
        })
    })
  };


  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedDocuments || selectedDocuments.length === 0) {
      toastMessage('error',"Please select documents first!");
      return;
    }

    const formData = new FormData();
    Array.from(selectedDocuments).forEach((file) => {
      formData.append('file', file);
    });

    return new Promise((resolve, reject) => {
      post("/uploadDocuments", formData)
        .then((response) => {
          toastMessage('success',"Documents Uploaded Successfully.")
          setIsDocumentEditing(false);
          fetchProfile();
          resolve(response);
        })
        .catch((error) => {
          console.error('Error uploading document:', error);
          toastMessage('error', error.response.data.message || "Error uploading document.");
          reject(error)
        })
    })
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-700">Profile</h1>
          <Link to="/doctor/updateProfile">
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
              onChange={handleDocumentChange}
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
          <Link to="/doctor/dashboard" className="text-blue-500 hover:underline">
            Back
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MyProfile;