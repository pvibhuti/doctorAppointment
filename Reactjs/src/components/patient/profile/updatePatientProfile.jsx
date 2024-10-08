import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; 
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { get, patch } from '../../../security/axios.js';
import { toastMessage } from '../../helpers/Toast.jsx';

const UpdatePatientProfile = () => {
  const [profile, setProfile] = useState({});

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters')
      .required('Full name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required'),
    gender: Yup.string()
      .oneOf(['male', 'female', 'other'], 'Invalid gender option')
      .required('Gender is required'),
    address: Yup.string()
      .min(2, 'address must be at least 2 characters')
      .max(50, 'address must not exceed 50 characters')
      .required('address is required'),
    age: Yup.string()
      .required('age is required'),
  });

  useEffect(() => {
    fetchProfile();
  });

  const fetchProfile = async () => {
    return new Promise((resolve, reject) => {
      get("/getPatientData")
        .then((response) => {
          setProfile(response.data.existingPatient);
          resolve(response);
        })
        .catch((error) => {
          console.error('Error fatching patient:', error);
          reject(error)
        })
    })
  };

  const handleSubmit = async (values) => {
    return new Promise((resolve, reject) => {
      patch("/editPatient", values)
        .then((response) => {
          alert('Profile updated successfully!');
          resolve(response);
        })
        .catch((error) => {
          console.error('Error update detsils:', error);
          toastMessage('error', error.response.data.message || "Error update details.");
          reject(error)
        })
    })
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Profile</h1>

      <Formik
        initialValues={{
          fullName: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
          address: profile.address || '',
          age: profile.age || '',
        }}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <Field
              name="fullName"
              type="text"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            <ErrorMessage name="fullName" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <Field
              name="email"
              type="email"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <Field
              name="phone"
              type="text"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            <ErrorMessage name="phone" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Gender</label>
            <Field
              name="gender"
              as="select"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Field>
            <ErrorMessage name="gender" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <Field
              name="address"
              type="text"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            <ErrorMessage name="address" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Age</label>
            <Field
              name="age"
              type="text"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            <ErrorMessage name="age" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Update Profile
            </button>
          </div>
          <div>
            <Link to="/patient/dashboard">
              <button
                type="button"
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
            </Link>
          </div>
        </Form>
      </Formik>
      <ToastContainer />
    </div>
  );
};

export default UpdatePatientProfile;