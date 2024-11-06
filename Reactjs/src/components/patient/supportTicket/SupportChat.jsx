import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
// import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { FaImage, FaTimes } from 'react-icons/fa';
import { API_URL } from '../../../services/config';
import { toastMessage } from '../../helpers/Toast';
import { get, patch, post } from '../../../security/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowDropleftCircle } from "react-icons/io";
import socket from '../../../constants/socket';
import { FaRegCopy } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const SupportChat = () => {
    const [message, setMessage] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const userId = useSelector((state) => state.patientProfile?._id);
    const nevigate = useNavigate();
    const location = useLocation();
    const applySelectedTicket = location.state;
    const messagesEndRef = useRef(null);

    const [selectedMessages, setSelectedMessages] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);

    useEffect(() => {
        fetchMessages(applySelectedTicket);

        const shouldDisplayMessage = (msg) =>
            msg.applyTicketId === applySelectedTicket._id && msg.senderId !== userId

        socket.on('receive_message', (data) => {
            if (shouldDisplayMessage(data.message)) {
                setMessage((prevMessages) => [...prevMessages, data.message]);
            }
        });

        socket.on("message_deleted", ({ messageId }) => {
            setMessage((prevMessages) =>
                prevMessages.filter((message) => message._id !== messageId)
            );
        });

        socket.on("message_deleted_for_everyone", ({ messageId }) => {
            setMessage(prevMessages =>
                prevMessages.filter(msg => msg._id !== messageId)
            );
        });

        return () => {
            socket.off('receive_message');
            socket.off("message_deleted");
            socket.off("message_deleted_for_everyone");
        };
    }, [applySelectedTicket._id]);


    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [message]);

    const fetchMessages = async (ticket) => {
        get(`/getMessagesByTicket?id=${ticket._id}`)
            .then((response) => {
                setMessage(response.messages);
            })
            .catch((error) => {
                console.error('Error fetching message info:', error);
            })
    };

    const editMessage = (messageId, newText) => {
        patch(`/editMessage?id=${messageId}&text=${newText}`)
            .then((response) => {
                console.log("response", response);
                toastMessage('success', 'Message Edited Successfully.');
                handleClose();
                setMessage(prevMessages =>
                    prevMessages.map(msg =>
                        msg._id === messageId ? { ...msg, message: newText } : msg
                    )
                );
            })
            .catch((error) => {
                console.log("error", error);
                toastMessage('error', error.response?.data?.message);
            });

        socket.emit("edit_message", { messageId, newText });
    };

    const deleteMessage = (messageId) => {
        post(`/deleteMessages`, { id: messageId })
            .then((response) => {
                console.log("response", response);
                toastMessage('success', 'Message Deleted Successfully.');
                handleClose();
            })
            .catch((error) => {
                console.log("error", error);
                toastMessage('error', error.response?.data?.message);
            });

        socket.emit("delete_message", { messageId });
    };

    const deleteMessageforEveryone = (messageId) => {
        post(`/deleteforEveryOne?id=${messageId}`, { id: messageId })
            .then(response => {
                toastMessage('success', 'Message deleted for everyone.');
                handleClose();
            })
            .catch(error => {
                toastMessage('error', error.response?.data?.message);
            });

        socket.emit('delete_message_for_Everyone', { messageId });
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

    const openImageModal = (image) => {
        setSelectedImage(image);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
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

    const handleBackToRequests = () => {
        nevigate("/patient/supportRequest")
    };

    const handleRightClick = (event, msg) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            messageId: msg._id,
            messageText: msg.message,
        });
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const toggleSelectMessage = (messageId) => {
        setSelectedMessages((prevSelected) => {
            const newSelected = prevSelected.includes(messageId)
                ? prevSelected.filter((id) => id !== messageId)
                : [...prevSelected, messageId];

            if (newSelected.length === 0) {
                setSelectionMode(false);
            }
            return newSelected;
        });
    };

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedMessages([]);
    };

    const deleteSelectedMessages = () => {
        if (selectedMessages.length === 0) return;

        post(`/deleteMessages`, { id: selectedMessages, userType: 1 })
            .then((response) => {
                console.log("response", response);
                toastMessage('success', 'Selected Messages Deleted Successfully.');
                handleClose();

                setMessage((prevMessages) =>
                    prevMessages.filter((msg) => !selectedMessages.includes(msg._id))
                );

                socket.emit("delete_message", { messageId: selectedMessages });

                cancelSelection();
            })
            .catch((error) => {
                console.log("error", error);
                toastMessage('error', error.response?.data?.message || "Error deleting messages");
            });
    };

    const handleKeyPress = (e) => {

        if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
            e.preventDefault();
            setMessageInput((prevInput) => prevInput + '\n');
        } else if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = async () => {
        if (!isChatDisabled && (messageInput.trim() || selectedImage)) {
            const messageData = {
                senderId: userId,
                applyTicketId: applySelectedTicket._id,
                receiverId: applySelectedTicket.suppotTicketId.adminId,
                type: 2,
                message: messageInput.trim(),
            };

            let uploadedImageName = null;

            if (selectedImage) {
                uploadedImageName = await uploadImage();
            }

            if (messageInput.trim()) {
                const textMessage = { ...messageData, image: null };
                socket.emit('send_message', { messageData: textMessage });

                setMessage((prevMessages) => [
                    ...prevMessages,
                    { ...textMessage, senderId: userId, createdAt: new Date() },
                ]);
            }

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
            }

            setMessageInput("");
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const renderMessages = () => {
        return message.map((msg, index) => {
            const isPatient = msg.senderId === userId;
            const isSender = msg.senderId === userId;

            const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            const isSelected = selectedMessages.includes(msg._id);

            return (
                <div>
                    <div key={index} className={`mb-2 ${isPatient ? 'text-right' : 'text-left'}`}>
                        {selectionMode && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMessage(msg._id)}
                                className="mr-2"
                            />
                        )}
                        <div
                            onContextMenu={(e) => handleRightClick(e, msg)}
                            onClick={() => setSelectionMode(true)}
                            className={`inline-block p-2 rounded ${isPatient ? 'bg-blue-200 text-black' : 'bg-gray-300'
                                } ${isSelected ? 'border border-blue-500' : ''}`}
                            style={{
                                maxWidth: "75%",
                                borderRadius: "12px",
                                padding: "8px 12px",
                                position: "relative",
                            }}
                        >
                            {msg.message ? (
                                <div>
                                    <div className='flex flex-cols text-left'>
                                        <span dangerouslySetInnerHTML={{ __html: msg.message.replace(/\n/g, '<br />') }}></span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={`${API_URL}/uploads/${msg.image}`}
                                        alt="Sent Image"
                                        className="w-32 h-32 object-cover"
                                        onClick={() => openImageModal(`${API_URL}/uploads/${msg.image}`)}
                                    />
                                </>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 mb-5 ml-1 mr-1">{messageTime}</div>
                        {contextMenu && contextMenu.messageId === msg._id && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: contextMenu.mouseY,
                                    left: contextMenu.mouseX,
                                    backgroundColor: "white",
                                    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                                    padding: "3px",
                                    zIndex: 10,
                                    borderRadius: "8px",
                                }}
                                onClick={handleClose}
                            >
                                <div className="text-left space-y-2">

                                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => deleteMessage(msg._id)}>
                                        <span><MdDelete /></span>
                                        <button className="hover:font-bold text-red-600">Delete</button>
                                    </div>

                                    {isSender && (
                                        <>
                                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => editMessage(msg._id, prompt("Edit your message:", msg.message))}>
                                                <span>✏️</span>
                                                <button className="hover:font-bold text-blue-600">Edit Message</button>
                                            </div>
                                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => deleteMessageforEveryone(msg._id)}>
                                                <span>🚫</span>
                                                <button className="hover:font-bold text-purple-600">Delete for Everyone</button>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
                                        navigator.clipboard.writeText(msg.message);
                                    }} >
                                        <span><FaRegCopy /> </span>
                                        <button className="hover:font-bold text-red-600">Copy</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="container mx-auto mt-5" onClick={handleClose} onScroll={handleClose} >
            <div className="flex justify-between items-center py-2 px-6 bg-blue-600 text-white rounded-t-lg mb-4">
                <IoIosArrowDropleftCircle onClick={handleBackToRequests} className="text-4xl text-white font-semibold cursor-pointer" > Back </IoIosArrowDropleftCircle>
                <h2 className="text-2xl font-semibold">Support Ticket Details</h2>
                <div className="h-9 w-9 bg-yellow-500 flex items-center justify-center rounded-full text-white">VP</div>
            </div>
            <div className="flex flex-row">
                {/* Ticket List Section */}
                <div className="w-1/4 bg-white p-5 border-r">
                    <div className="bg-white p-4 h-[400px] overflow-y-auto border">
                        {applySelectedTicket ? (
                            <div>
                                <div className="font-semibold mt-2 p-1">{applySelectedTicket.userId.fullName}</div>
                                <div className="text-sm text-gray-500 mt-2"><strong>User Message:</strong> {applySelectedTicket.message}</div>
                                <div className="text-sm text-gray-500 mt-2"><strong>Support TicketTitle:</strong> {applySelectedTicket.suppotTicketId.subject}</div>
                                {applySelectedTicket.status === 1 ? (
                                    <div className='mt-2 p-1'>
                                        <p className="text-green-600 font-bold mt-2">This ticket is approved.</p>
                                        <p className="text-sm text-gray-500 font-bold mt-2"><strong> Approve Reason : </strong>{applySelectedTicket.reason}</p>
                                    </div>

                                ) : applySelectedTicket.status === 2 ? (
                                    <div className='mt-2 p-1'>
                                        <p className="text-red-600 font-bold mt-2">This ticket is rejected.</p>
                                        <p className="text-sm text-gray-500 font-bold mt-2"><strong> Rejected Reason : </strong>{applySelectedTicket.reason}</p>
                                    </div>
                                ) : (
                                    applySelectedTicket.status === 0 && (
                                        <div className='mt-2 p-1'>
                                            <p className="text-red-600 font-bold mt-2"></p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p>No tickets available</p>
                        )}
                    </div>
                </div>

                {/* Chat Section */}
                <>
                    {applySelectedTicket ? (
                        <div className="w-3/4 p-2" onScroll={handleClose}>
                            <div className="overflow-y-auto h-[500px] border p-2 rounded mb-4">
                                <h3 className="text-xl font-semibold mb-4 text-center" style={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: "2px",
                                    margin: "2px",
                                }}
                                >{applySelectedTicket.message}</h3>
                                <div>{renderMessages()}</div>
                                <div ref={messagesEndRef} />
                            </div>

                            {applySelectedTicket.status === 0 && (
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
                                        {selectionMode && selectedMessages.length > 0 ? (
                                            <button
                                                onClick={deleteSelectedMessages}
                                                className="bg-red-500 text-white py-2 px-4 rounded-md transition duration-300 hover:bg-red-600"
                                            >
                                                Delete Selected Messages
                                            </button>
                                        ) : (
                                            <div className="flex items-center w-full">
                                                <textarea
                                                    type="text"
                                                    placeholder="Type your message..."
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    className="flex-grow p-2 border rounded-md focus:outline-none"
                                                    disabled={isChatDisabled}
                                                    onKeyPress={handleKeyPress}
                                                    rows={1}
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
                                                    className={`bg-blue-500 text-white px-4 py-2 ml-2 rounded ${(!message && !selectedImage) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    disabled={!message && !selectedImage}
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        )}
                                        {selectionMode && (
                                            <button
                                                onClick={cancelSelection}
                                                className="text-gray-500 ml-4 hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        )}
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