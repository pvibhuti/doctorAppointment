import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { FaImage, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../services/config';
import { toastMessage } from '../../helpers/Toast';
import { get, post } from '../../../security/axios';
import Modal from 'react-modal';
import { IoIosArrowDropleftCircle } from "react-icons/io";

const socket = io(API_URL);

const SupportAdminChat = () => {
    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("");
    const [messageReceived, setMessageReceived] = useState([]);
    console.log("message ----------Recevived", messageReceived);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [actionType, setActionType] = useState(null);
    const doctorData = useSelector((state) => state.doctorProfile);
    const nevigate = useNavigate();
    const location = useLocation();
    const [selectedTickets, setSelectedTickets] = useState(null);
    const messagesEndRef = useRef(null);
    const selectedTicket = location.state;
    const receiverId = selectedTicket.userId;

    useEffect(() => {
        fetchMessages(selectedTicket);
        fetchSeletedTicket(selectedTicket)

        socket.on("receive_message", (data) => {
            if (data.message.applyTicketId === selectedTicket?._id && data.message.senderId !== doctorData._id) {
                setMessageReceived((prevMessages) => [...prevMessages, data.message]);
            }
        });

        return () => {
            socket.off('receive_message');
        };

    }, [selectedTicket._id]);

    const fetchSeletedTicket = async (selectedTicket) => {
        get(`/getSelectedApplyTicket?id=${selectedTicket._id}`)
            .then((response) => {
                setSelectedTickets(response.selectedTickets);
            })
            .catch((error) => {
                console.error('Error fetching User info:', error);
            })
    };

    const fetchMessages = async (ticket) => {
        get(`/getMessagesByTicket?id=${ticket._id}`)
            .then((response) => {
                setMessageReceived(response.messages);
            })
            .catch((error) => {
                console.error('Error fetching message info:', error);
            })
    };

    const handleAction = async (action) => {
        if (!reason.trim()) {
            toastMessage('error', 'Reason is required.');
            return;
        }

        const values = { id: selectedTicket._id, reason };
        const endpoint = action === 'approve' ? '/approveTickets' : '/rejectTickets';

        post(endpoint, values)
            .then(() => {
                toastMessage('success', `Support Chat ${action === 'approve' ? 'Approved' : 'Rejected'} Successfully.`);
                setReason("");
                setIsChatDisabled(true);
                closeModal();
            })
            .catch((error) => {
                toastMessage('error', Object.values(error.response.data).toString());
            });
    };

    const uploadImage = async () => {
        if (!selectedImage) return null;
        const formData = new FormData();
        formData.append('images', selectedImage);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const handleApproveAction = () => {
        setActionType('approve');
        setIsModalOpen(true);
    };

    const handleRejectAction = () => {
        setActionType('reject');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setReason("");
    };

    const handleBackToRequests = () => {
        nevigate("/doctor/dashboard#/supportRequest")
    };

    const openImageModal = (image) => {
        setSelectedImage(image);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    const handleCancelImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const sendMessage = async () => {
        if (!isChatDisabled && (message.trim() || selectedImage)) {
            const messageData = {
                senderId: doctorData._id,
                applyTicketId: selectedTicket ? selectedTicket._id : '',
                type: 1,
                receiverId: receiverId || '',
                message: message.trim(),
            };


            let uploadedImageName = null;
            if (selectedImage) {
                uploadedImageName = await uploadImage();
            }

            const textMessage = { ...messageData, image: null };
            socket.emit('send_message', { messageData: textMessage });

            if (uploadedImageName) {

                const imageMessage = {
                    ...messageData,
                    message: null,
                    image: uploadedImageName,
                };

                socket.emit('send_message', { messageData: imageMessage });
                setMessageReceived((prevMessages) => [
                    ...prevMessages,
                    { ...imageMessage, senderId: doctorData._id, createdAt: new Date() },
                ]);

            }

            setMessageReceived((prevMessages) => [
                ...prevMessages,
                { ...textMessage, senderId: doctorData._id, createdAt: new Date() },
            ]);
            setMessage("");
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [message]);

    const renderMessages = () => {
        return messageReceived.map((msg, index) => {
            const isDoctor = msg.senderId === doctorData._id;

            const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            return (
                <div key={index} className={`mb-2 ${isDoctor ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded ${isDoctor ? 'bg-blue-200 text-black' : 'bg-gray-300'}`}>

                        {msg.message ? (
                            <div className='flex flex-cols'>
                                {msg.message}
                                <div className="text-xs text-gray-500 mt-1 ml-2">{messageTime}</div>
                            </div>
                        ) : (
                            <>
                                <img
                                    src={`${API_URL}/uploads/${msg.image}`}
                                    alt="Sent Image"
                                    className="w-32 h-32 object-cover"
                                    onClick={() => openImageModal(`${API_URL}/uploads/${msg.image}`)}
                                />
                                <div className="text-xs text-gray-500 mt-1">{messageTime}</div>
                            </>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            <div className="container mx-auto mt-5">
                <div className="flex justify-between items-center py-4 px-6 bg-blue-600 text-white rounded-t-lg">
                    <h2 className="text-2xl font-semibold">Support Ticket Details </h2>
                    <div className="h-12 w-12 bg-yellow-500 flex items-center justify-center rounded-full text-white">VP</div>
                </div>
                <>
                    <div className="flex justify-between items-center py-1 px-6 bg-gray-200 text-white ">
                        <IoIosArrowDropleftCircle onClick={handleBackToRequests} className="text-4xl text-black font-semibold cursor-pointer" > Back </IoIosArrowDropleftCircle>
                        <div className='flex-col'>
                            {selectedTicket.status === 0 ? <div className="mt-3">
                                <button
                                    onClick={handleApproveAction}
                                    className="bg-green-500 text-white px-3 py-2 rounded mr-2"
                                    disabled={isChatDisabled}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={handleRejectAction}
                                    className="bg-red-500 text-white px-3 py-2 rounded"
                                    disabled={isChatDisabled}
                                >
                                    Reject
                                </button>
                            </div>
                                :
                                <div> {selectedTicket.status === 1 ? (
                                    <p className="text-green-600 font-bold mt-2 text-center">Approved</p>
                                ) : (
                                    <p className="text-red-600 font-bold mt-2 text-center">Rejected.</p>
                                )}
                                </div>
                            }

                        </div>
                    </div>
                    <div className="flex flex-row bg-gray-100 shadow-lg rounded-b-lg">
                        <div className="w-2/4 bg-white border-r p-4">
                            <div className="bg-white p-4 h-[400px] overflow-y-auto border">
                                {selectedTickets ? (
                                    <p>
                                        <p><strong>User Name:</strong> {selectedTickets.userId.fullName}</p>
                                        <p><strong>email:</strong> {selectedTickets.userId.email}</p>
                                        <p><strong>email:</strong> {selectedTickets.userId.phone}</p>
                                        <p><strong>User Message:</strong> {selectedTickets.message}</p>
                                        {/* <br /> */}
                                        {/* <p><strong>Support Ticket Title:</strong> {selectedTickets.suppotTicketId.subject}</p> */}
                                        <p><strong>Support Ticket Description:</strong> {selectedTickets.suppotTicketId.description}</p>
                                        <p><strong>Status:</strong> {selectedTickets.status === 0 ? "Pending" : selectedTickets.status === 1 ? "Approve" : "Reject"}</p>
                                        <p><strong>Request Date :</strong> {new Date(selectedTickets.createdAt).toLocaleDateString()}</p>

                                        {selectedTickets.attachment && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold">Attachment:</h4>
                                                <img
                                                    src={`${API_URL}/uploads/${selectedTickets.attachment}`}
                                                    alt="Attachment"
                                                    className="w-32 h-32 object-cover cursor-pointer"
                                                    onClick={() => openImageModal(`${API_URL}/uploads/${selectedTickets.attachment}`)}
                                                />
                                            </div>
                                        )}

                                        {selectedTickets.status === 1 ? (
                                            <p className="text-green-600 font-bold mt-2 text-center">This ticket is approved.</p>
                                        ) : selectedTickets.status === 2 ? (
                                            <p className="text-red-600 font-bold mt-2 text-center">This ticket is rejected.</p>
                                        ) : (
                                            selectedTickets.status === 0 && (
                                                <p className="text-red-600 font-bold mt-2 text-center"></p>
                                            )
                                        )}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {/* Chat Section */}
                        {selectedTickets && (
                            <div className="w-3/4 p-2"> <div ref={messagesEndRef}></div>
                                <div className="bg-white p-4 h-[500px] overflow-y-auto border">
                                    <h5 className="text-xl font-semibold mb-2 text-center">{selectedTickets.message}</h5>
                                    <div>{renderMessages()}</div>
                                    <div ref={messagesEndRef} />
                                </div>
                                {!isChatDisabled && selectedTickets.status === 0 && (
                                    <div className="mt-4">
                                        {/* Image Preview Section */}
                                        {imagePreview && (
                                            <div className="mb-4 flex items-center">
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Selected Preview"
                                                        className="w-20 h-20 object-cover border rounded-md"
                                                    />
                                                    {/* Cancel icon */}
                                                    <button
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                                        onClick={handleCancelImage}
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                placeholder="Enter your message..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="flex-grow p-2 border rounded-md focus:outline-none"
                                                disabled={isChatDisabled}
                                            />

                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="image-upload"
                                                style={{ display: 'none' }}
                                                onChange={handleImageChange}
                                            />

                                            <label htmlFor="image-upload" className="ml-3 cursor-pointer text-gray-500">
                                                <FaImage className="text-2xl" />
                                            </label>

                                            <button
                                                onClick={sendMessage}
                                                className={`bg-blue-500 text-white px-4 py-2 ml-2 rounded ${(!message && !selectedImage) ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                disabled={!message && !selectedImage}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isChatDisabled && <p className="mt-4 text-red-600 font-semibold">Chat is closed.</p>}
                            </div>
                        )}
                    </div>
                </>

                {/* Reason Model */}
                {isModalOpen && (
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Reason Modal"
                        className="modal"
                        overlayClassName="overlay"
                    >
                        <div className="bg-white p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Provide a reason for {actionType === 'approve' ? 'Approval' : 'Rejection'}</h2>
                            <input
                                className="w-full p-2 border rounded-md focus:outline-none"
                                placeholder="Enter your reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleAction(actionType)}
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                    isOpen={isModalOpen}
                                    onRequestClose={closeModal}
                                    contentLabel="Reason Modal"
                                    overlayClassName="overlay"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    isOpen={isModalOpen}
                                    onRequestClose={closeModal}
                                    contentLabel="Reason Modal"
                                    overlayClassName="overlay"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Image Modal */}
                {isImageModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg">
                            <img src={selectedImage} alt="Enlarged Attachment" className="max-w-full max-h-[80vh]" />
                            <button
                                onClick={closeImageModal}
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SupportAdminChat;