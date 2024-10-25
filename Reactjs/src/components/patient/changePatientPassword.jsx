import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import PasswordShowHide from '../common/PasswordShowHide';
import { post } from '../../security/axios';
import { toastMessage } from '../helpers/Toast';

const ChangePatientPassword = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm new password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    return new Promise((resolve, reject) => {
      post("/changePatientPassword", values)
        .then((response) => {
          toastMessage('success',"password Change Successfully.")
          setStatus({ message: response.message, error: '' });
          navigate("/patient/dashboard");
          resolve(response);
          setSubmitting(false);
        })
        .catch((error) => {
          setStatus({
            message: '',
            error: error.response?.data?.message || 'Error occurred while changing password',
          });
          setSubmitting(false);
        })
    })
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-xl font-bold text-gray-700 mb-6">
          Change Password
        </h2>

        <Formik
          initialValues={{ password: '', newPassword: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-4">
              {status?.message && <p className="text-green-600 text-center">{status.message}</p>}
              {status?.error && <p className="text-red-600 text-center">{status.error}</p>}

              <div className="flex flex-col">
                <label className="text-gray-600 text-sm">Current Password</label>
                <PasswordShowHide name="password" placeholder="Entre current password" />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600 text-sm">New Password</label>
                <PasswordShowHide name="newPassword" placeholder="Entre new password" />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600 text-sm">Confirm New Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Entre confirm password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePatientPassword;