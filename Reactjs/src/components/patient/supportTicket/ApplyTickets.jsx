import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toastMessage } from '../../helpers/Toast';
import { post } from '../../../security/axios';
import { fetchData } from '../../common/handleMethods';

const ApplyTicket = () => {
    const [activeSection, setActiveSection] = useState('supportTiket');
    const [supportTickets, setSupportTickets] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    
    const validationSchema = Yup.object({
        message: Yup.string().required('Message is required'),
    });

    useEffect(() => {
        fetchData('/getSupportTickets', (data) => {
            setSupportTickets(data.supportTickets || []);
        });
    }, []);

    const handleApplyClick = (ticketId) => {
        setSelectedTicketId(ticketId);
        setActiveSection('applyTicket');
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const uploadImage = async () => {
        if (!selectedFile) return null;
        const formData = new FormData();
        formData.append('images', selectedFile);
        
        try {
            const response = await post('/uploadPhoto', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toastMessage('success', "Image uploaded successfully.");
            return response;
        } catch (error) {
            console.log("error", error);
            toastMessage('error', error.response?.data?.message || "Error uploading image.");
            return null;
        }
    };

    const applyTicket = async (message, uploadedFilenames) => {
        post('/applyTickets', { suppotTicketId: selectedTicketId, message, attachment: uploadedFilenames })
            .then((response) => {
                toastMessage('success', response.message);
                setActiveSection('supportTiket');
            })
            .catch((error) => {
                console.log("error", error);
                toastMessage('error', error.response?.data?.message || 'Error applying for ticket.');
            });
    }

    const handleSubmit = async (values, { resetForm }) => {
        const { message } = values;
        try {
            if (selectedFile) {
                const uploadedFilenames = await uploadImage();
                console.log("Upload Files With namess", uploadedFilenames);

                await applyTicket(message, uploadedFilenames);
            } else {
                await applyTicket(message);
            }
            resetForm();
            setActiveSection('supportTiket');
        } catch (error) {
            console.log("error", error);
            toastMessage('error', error.response?.data?.message || 'Error applying for ticket.');
        }


    };

    return (
        <>
            <div className="container mx-auto shadow-lg rounded-lg">
                {activeSection === 'supportTiket' && (
                    <div className="flex-1 p-16 bg-gray-100">
                        <h2 className="text-2xl font-bold">Support Tickets</h2>
                        <div className="grid grid-cols-1 items-center md:items-center grid-cols-2 lg:grid-cols-3 gap-6 mt-6" >
                            {supportTickets.map((supportTicket, index) => (
                                <div key={index} className="card h-full p-10 bg-white shadow-md rounded ">
                                    <center>
                                        <h3 className="text-lg font-bold">{supportTicket.subject}</h3>
                                        <p className="text-1xl">{supportTicket.description}</p>
                                        <br></br>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                                            onClick={() => handleApplyClick(supportTicket._id)}
                                        >
                                            Apply Ticket
                                        </button>
                                    </center>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'applyTicket' && (
                    <div className="flex-1 p-16 bg-gray-100">
                        <h2 className="text-2xl font-bold">Apply Tickets</h2>
                        <div className="grid grid-cols-1 items-center md:items-center grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            <Formik
                                initialValues={{ message: '' }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ setFieldValue }) => (
                                    <Form>
                                        {/* Message Input */}
                                        <div className="mb-4">
                                            <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Message</label>
                                            <Field name="message" type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter your message" />
                                            <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* File Upload */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Select Attachment (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="mt-2 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div>
                                            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
                                                Submit
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ApplyTicket;
