import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { FaImage, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import { API_URL } from '../../../services/config';
import { fetchData } from '../../common/handleMethods';
import { toastMessage } from '../../helpers/Toast';
import { post } from '../../../security/axios';


const socket = io(API_URL);

const SupportChat = () => {
    const [message, setMessage] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [selectedTicket, setSelectedTicket] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [applyTickets, setApplyTicket] = useState(null);
    const userId = useSelector((state) => state.patientProfile?._id);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchData('/getPatientTicket', (data) => {
            console.log("Data", data);

            if (Array.isArray(data.selectedTicket)) {
                console.log("Selected Ticket Id", data.selectedTicket);
                setSelectedTicket(data.selectedTicket);
            }
        });

        const shouldDisplayMessage = (msg) =>
            msg.senderId !== userId;
        // msg.applyTicketId === applyTickets && 

        socket.on('receive_message', (data) => {
            if (shouldDisplayMessage(data.message)) {
                setMessage((prevMessages) => [...prevMessages, data.message]);
            }
        });


        return () => {
            socket.off('receive_message');
        };
    }, [selectedTicket._id]);

    const handleSelectTicket = async (ticket) => {
        setActiveTicket(ticket.applyTicket);
        setMessage([]);

        fetchData(`/getMessagesByTicket?id=${ticket.applyTicket._id}`, (response) => {
            setMessage(response.messages);
        });
    };

    const sendMessage = async () => {
        if (!isChatDisabled && (messageInput.trim() || selectedImage)) {
            const messageData = {
                senderId: userId,
                applyTicketId: activeTicket._id,
                receiverId: activeTicket.suppotTicketId.adminId,
                type: 2,
                message: messageInput.trim(),
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
                setMessage((prevMessages) => [
                    ...prevMessages,
                    { ...imageMessage, senderId: userId, createdAt: new Date() },
                ]);
                setMessageInput("");
            }

            setMessage((prevMessages) => [
                ...prevMessages,
                { ...textMessage, senderId: userId, createdAt: new Date() },
            ]);
            setMessageInput("");
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const renderMessages = () => {
        return message.map((msg, index) => {
            const isPatient = msg.senderId === userId;

            const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            return (
                <div key={index} className={`mb-2 ${isPatient ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded ${isPatient ? 'bg-blue-200 text-black' : 'bg-gray-300'}`}>
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

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [message]);

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

    const handleCancelImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const openImageModal = (image) => {
        setSelectedImage(image);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    return (
        <div className="container mx-auto mt-5">
            <div className="flex justify-between items-center py-2 px-6 bg-blue-600 text-white rounded-t-lg">
                <h2 className="text-2xl font-semibold">Support Ticket Details</h2>
                <div className="h-9 w-9 bg-yellow-500 flex items-center justify-center rounded-full text-white">VP</div>
            </div>
            <div className="flex flex-row">
                {/* Ticket List Section */}
                <div className="w-1/4 bg-white p-5 border-r">
                    <h3 className="text-xl font-semibold mb-4">Your Tickets</h3>
                    <div className="overflow-y-auto h-[600px]">
                        {selectedTicket.length > 0 ? (
                            selectedTicket.map((applyTicket, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border-b cursor-pointer hover:bg-gray-100">
                                    <div>
                                        <div className="font-semibold">{applyTicket.userId.fullName}</div>
                                        <div className="text-sm text-gray-500"><strong>User Message:</strong> {applyTicket.message}</div>
                                        <div className="text-sm text-gray-500"><strong>Support TicketTitle:</strong> {applyTicket.suppotTicketId.subject}</div>
                                        {applyTicket.status === 1 ? (
                                            <p className="text-green-600 font-bold mt-2">This ticket is approved.</p>
                                        ) : applyTicket.status === 2 ? (
                                            <p className="text-red-600 font-bold mt-2">This ticket is rejected.</p>
                                        ) : (
                                            applyTicket.status === 0 && (
                                                <p className="text-red-600 font-bold mt-2"></p>
                                            )
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleSelectTicket({
                                            applyTicket
                                        })}
                                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                    >
                                        Chat
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No tickets available</p>
                        )}
                    </div>
                </div>

                {/* Chat Section */}
                <>
                    {activeTicket ? (
                        <div className="w-3/4 p-2">
                            <div className="overflow-y-auto h-[500px] border p-2 rounded mb-4">
                                <h3 className="text-xl font-semibold mb-4 text-center">{activeTicket.message}</h3>
                                <div>{renderMessages()}</div>
                                <div ref={messagesEndRef} />
                            </div>

                            {activeTicket.status === 0 && (
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
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
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

                                        <label htmlFor="image-upload" className="cursor-pointer mx-2">
                                            <FaImage size={24} />
                                        </label>

                                        <button
                                            onClick={sendMessage}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="w-3/4 p-2 text-center mt-2 font-semibold">No active ticket selected</p>
                    )}
                </>
            </div>

            {
                isImageModalOpen && (
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
                )
            }
        </div >
    );
};

export default SupportChat;