import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../../services/config';
import { toastMessage } from '../helpers/Toast';
import { useSelector } from 'react-redux';

const socket = io.connect(API_URL);

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const patientData = useSelector((state) => state.patientProfile);
  const patientId = patientData._id;

  useEffect(() => {
    if (patientId) {
      
      socket.emit('registerPatient', patientId);
      
      socket.on('appointmentNotification', (data) => {
        showToastNotification(data);
        setNotifications((prevNotifications) => [...prevNotifications, data]);
      });
    }

    return () => {
      socket.off('appointmentNotification');
    };
  }, [patientId]);

  const showToastNotification = (data) => {
    if (data.status === 1) {
      toastMessage('success', data.message);
    } else if (data.status === 2) {
      toastMessage('error', data.message);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
