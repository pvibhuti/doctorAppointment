import './App.css';
import Home from './components/layout/doctor/home';
import Login from './components/common/login';
import RegisterForm from './components/common/register';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Appointment from './components/doctor/appointment/appointment';
import MyProfile from './components/doctor/doctorProfile';
import UpdateProfile from './components/doctor/updateProfile';
import ChangePassword from './components/doctor/changePassword';
import PatientProfile from './components/patient/patientProfile';
import UpdatePatientProfile from './components/patient/updatePatientProfile';
import ChangePatientPassword from './components/patient/changePatientPassword';
import Otp from './components/patient/otp';
import DoctorDashboard from './components/doctor/doctorDashboard';
import PatientDashboard from './components/patient/patientDashboard';
import ForgotPassword from './components/doctor/fogetPassword';
import OtpForm from './components/doctor/otpForm';
import BookAppointment from './components/patient/appointment/bookAppintment';
import AppointmentLists from './components/patient/appointment/appointmentList';
import ForgotPatientPassword from './components/patient/forgotPatientPassword';
import EditAppointment from './components/patient/appointment/EditAppointment';

function App() {
  return (
    <div>
      {/* <Home /> */}
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/bookApointment' element={<Login />} />
          <Route path='/register' element={<RegisterForm />} />

          <Route path='/doctorDashboard' element={<DoctorDashboard />} />
          <Route path='/patientDashboard' element={<PatientDashboard />} />

          <Route path='/appointment' element={<Appointment />} />
          <Route path='/appointmentlists' element={<AppointmentLists />} />

          <Route path='/myProfile' element={<MyProfile />} />
          <Route path='/patientProfile' element={<PatientProfile />} />

          <Route path='/updateProfile' element={<UpdateProfile />} />
          <Route path='/updatePatientProfile' element={<UpdatePatientProfile />} />

          <Route path='/changePassword' element={<ChangePassword />} />
          <Route path='/changePatientPassword' element={<ChangePatientPassword />} />

          <Route path='/forgetPassword' element={<ForgotPassword />} />
          <Route path='/forgotPatientPassword' element={<ForgotPatientPassword />} />

          <Route path='/otpForm' element={<OtpForm />} />
          <Route path='/otp' element={<Otp />} />

          <Route path='/bookAppointment' element={<BookAppointment />} />
          <Route path='/editAppointment' element={<EditAppointment />} />
          
          {/* <RegisterForm /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
