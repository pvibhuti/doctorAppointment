import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// import DoctorRouter from './routes/doctor/DoctorRoute';
// import PatientRouter from './routes/patient/PatientRoute';
// import CommonRouter from './routes/CommonRoute';
import RouterPage from './routes';

function App() {
  return (
    <BrowserRouter>
      <RouterPage />
    </BrowserRouter>
  );
}

export default App;