To create a two-sided chat system for doctors (users) and admins using the same `SupportTicket` structure, you need to ensure that both sides handle message sending, receiving, and displaying correctly. Here is the modified code that includes separate logic for doctors and admins. This code is based on your existing structure, where the doctor can see the tickets and chat with an admin, and now it will include the admin's ability to see the chat and respond.

### Doctor Side: `SupportTicketDoctor.js`
jsx
import React, { useEffect, useState } from 'react';
import { fetchData } from '../common/handleMethods';
import { post } from '../../security/axios';
import { toastMessage } from '../helpers/Toast';
import { io } from 'socket.io-client';
import { API_URL } from '../../services/config';
import { useSelector } from 'react-redux';

const socket = io(API_URL);

const SupportTicketDoctor = () => {
  const [applyTickets, setApplyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const doctorData = useSelector((state) => state.doctorProfile);

  useEffect(() => {
    fetchData('/getApplyTickets', (data) => {
      setApplyTickets(data.allTickets);
    });

    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessages) => [...prevMessages, data.message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        senderId: doctorData._id,
        applyTicketId: selectedTicket ? selectedTicket._id : '',
        type: 1,
        receiverId: receiverId || '',
        message: message.trim(),
      };

      socket.emit('send_message', { messageData: messageData });
      setMessageReceived((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage("");
    }
  };

  const handleViewTicket = (ticket) => {
    fetchData(`/getSelectedApplyTicket?id=${ticket._id}`, (data) => {
      setSelectedTicket(data.selectedTickets);
    });
    setReceiverId(ticket.userId._id);
  };

  return (
    <div className="container mx-auto mt-5">
      <h2 className="text-2xl font-semibold">Doctor Support Tickets</h2>

      <div className="flex flex-row bg-gray-100 shadow-lg rounded-lg">
        <div className="w-1/4 bg-white border-r p-4">
          <h3 className="text-xl font-semibold mb-4">Request List</h3>
          <div className="overflow-y-auto h-[600px]">
            {applyTickets.map((applyTicket, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-b">
                <div>
                  <div className="font-semibold">{applyTicket.userId.fullName}</div>
                  <div className="text-sm text-gray-500 mb-3">{applyTicket.message}</div>
                </div>
                <button
                  onClick={() => handleViewTicket(applyTicket)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/4 bg-white p-6">
          {selectedTicket ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Ticket Details</h3>
              <p><strong>User:</strong> {selectedTicket.userId.fullName}</p>
              <p><strong>Message:</strong> {selectedTicket.message}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>

              {selectedTicket.status === 1 && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Chat</h3>
                  <div className="overflow-y-auto h-[400px] border p-2 rounded mb-4">
                    {messageReceived.map((msg, index) => (
                      <div key={index} className="mb-2">{msg}</div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 border rounded"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    onClick={sendMessage}
                    className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Send
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a ticket to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDoctor;


### Admin Side: `SupportTicketAdmin.js`
jsx
import React, { useEffect, useState } from 'react';
import { fetchData } from '../common/handleMethods';
import { post } from '../../security/axios';
import { toastMessage } from '../helpers/Toast';
import { io } from 'socket.io-client';
import { API_URL } from '../../services/config';

const socket = io(API_URL);

const SupportTicketAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);

  useEffect(() => {
    fetchData('/getAdminTickets', (data) => {
      setTickets(data.allTickets);
    });

    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessages) => [...prevMessages, data.message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        senderId: "adminId",
        applyTicketId: selectedTicket ? selectedTicket._id : '',
        type: 1,
        receiverId: selectedTicket.userId._id,
        message: message.trim(),
      };

      socket.emit('send_message', { messageData: messageData });
      setMessageReceived((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage("");
    }
  };

  const handleViewTicket = (ticket) => {
    fetchData(`/getSelectedApplyTicket?id=${ticket._id}`, (data) => {
      setSelectedTicket(data.selectedTickets);
    });
  };

  return (
    <div className="container mx-auto mt-5">
      <h2 className="text-2xl font-semibold">Admin Support Tickets</h2>

      <div className="flex flex-row bg-gray-100 shadow-lg rounded-lg">
        <div className="w-1/4 bg-white border-r p-4">
          <h3 className="text-xl font-semibold mb-4">Request List</h3>
          <div className="overflow-y-auto h-[600px]">
            {tickets.map((ticket, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-b">
                <div>
                  <div className="font-semibold">{ticket.userId.fullName}</div>
                  <div className="text-sm text-gray-500 mb-3">{ticket.message}</div>
                </div>
                <button
                  onClick={() => handleViewTicket(ticket)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/4 bg-white p-6">
          {selectedTicket ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Ticket Details</h3>
              <p><strong>User:</strong> {selectedTicket.userId.fullName}</p>
              <p><strong>Message:</strong> {selectedTicket.message}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>

              <h3 className="text-xl font-semibold mb-4">Chat</h3>
              <div className="overflow-y-auto h-[400px] border p-2 rounded mb-4">
                {messageReceived.map((msg, index) => (
                  <div key={index} className="mb-2">{msg}</div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full p-2 border rounded"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a ticket to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketAdmin;


###

 Explanation:
- *Doctor & Admin Views:* Both doctors and admins have their respective views where they can select a ticket and chat in real-time. The key difference is that admins can see all tickets and respond to the user.
- *Sockets:* Sockets are used to send and receive messages in real-time. Both the doctor and admin receive messages when sent from the other side.
- *Ticket Selection:* Selecting a ticket displays details and the chat messages. Both can send messages related to that specific ticket.
- *Message Handling:* Messages are appended to the conversation as they are sent, providing a real-time chat experience.

Let me know if you need further adjustments!