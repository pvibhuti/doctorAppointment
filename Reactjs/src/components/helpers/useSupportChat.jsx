import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { registerSocket, removeSocket } from '../../services/socketService';
import { get } from '../../security/axios';


const useSupportChat = (ticketId, userId, userType) => {
    const [messageReceived, setMessageReceived] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages(ticketId, userType);

        registerSocket(ticketId, userId, setMessageReceived);

        const socket = registerSocket(ticketId, userId, (newMessage) => {
            setMessageReceived(prevMessages => [...prevMessages, newMessage]);
        });

        return () => {
            removeSocket(socket);
        };
    }, [ticketId, userId]);

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageReceived]);

    const fetchMessages = async (ticket, userType) => {
        get(`/getMessagesByTicket?id=${ticket._id}&userType=${1}`)
            .then((response) => {
                console.log("messagess", response);
                setMessageReceived(response.messages);
            })
            .catch((error) => {
                console.error('Error fetching message info:', error);
            })
    };

    return { messageReceived, setMessageReceived, messagesEndRef };
};

export default useSupportChat;