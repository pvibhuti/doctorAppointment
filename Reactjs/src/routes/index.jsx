import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from 'react-router-dom';
import AuthRoute from "../components/auth/AuthRoute";
import DoctorDashboard from "../components/doctor/DoctorDashboard";
import Appointments from "../components/doctor/appointment/Appointment";
import ChangePassword from "../components/doctor/ChangePassword";
import ForgotPassword from "../components/doctor/fogetPassword";
import UpdateProfile from "../components/doctor/profile/UpdateProfile";
import MyProfile from "../components/doctor/profile/doctorProfile";
import PatientDashboard from "../components/patient/patientDashboard";
import AppointmentLists from "../components/patient/appointment/appointmentList";
import ChangePatientPassword from "../components/patient/changePatientPassword";
import ForgotPatientPassword from "../components/patient/forgotPatientPassword";
import PatientProfile from "../components/patient/profile/patientProfile";
import UpdatePatientProfile from "../components/patient/profile/updatePatientProfile";
import BookAppointment from "../components/patient/appointment/bookAppintment";
import RegisterForm from "../components/auth/register";
import Login from "../components/auth/login";
import Home from "../components/layout/home";
import { NotificationProvider } from "../components/common/NotificationContext";
import SupportRequest from "../components/doctor/supportTicket/SupportRequest";
import SupportAdminChat from "../components/doctor/supportTicket/SupportChat";
import SupportChat from "../components/patient/supportTicket/SupportChat";
import SupportPatientRequest from "../components/patient/supportTicket/SupportRequest";

const routes = [
    {
        path: 'dashboard',
        layout: 'doctor',
        auth: true,
        component: <DoctorDashboard />
    },
    {
        path: 'appointments',
        layout: 'doctor',
        auth: true,
        component: <Appointments />
    },
    {
        path: 'changePassword',
        layout: 'doctor',
        auth: true,
        component: <ChangePassword />
    },
    {
        path: 'updateProfile',
        layout: 'doctor',
        auth: true,
        component: <UpdateProfile />
    },
    {
        path: 'supportRequest',
        layout: 'doctor',
        auth: true,
        component: <SupportRequest />
    },
    {
        path: 'supportChat',
        layout: 'doctor',
        auth: true,
        component: <SupportAdminChat />
    },
    {
        path: 'myProfile',
        layout: 'doctor',
        auth: true,
        component: <MyProfile />
    },
    {
        path: 'forgotPassword',
        layout: "doctor",
        auth: false,
        component: <ForgotPassword />
    },

    // Patient Routes
    {
        path: 'dashboard',
        layout: 'patient',
        auth: true,
        component: <PatientDashboard />
    },
    {
        path: 'appointments',
        layout: 'patient',
        auth: true,
        component: <AppointmentLists />
    },
    {
        path: 'changePassword',
        layout: 'patient',
        auth: true,
        component: <ChangePatientPassword />
    },
    {
        path: 'updateProfile',
        layout: 'patient',
        auth: true,
        component: <UpdatePatientProfile />
    },
    {
        path: 'myProfile',
        layout: 'patient',
        auth: true,
        component: <PatientProfile />
    },
    {
        path: 'forgotPassword',
        layout: "patient",
        auth: false,
        component: <ForgotPatientPassword />
    },
    {
        path: 'bookAppointment',
        layout: 'patient',
        auth: true,
        component: <BookAppointment />,
    },
    {
        path: 'supportChat',
        layout: 'patient',
        auth: true,
        component: <SupportChat />
    },
    {
        path: 'supportRequest',
        layout: 'patient',
        auth: true,
        component: < SupportPatientRequest />
    },

    // Common Routes
    {
        path: '/',
        auth: false,
        component: <Home />
    },
    {
        path: '/login',
        auth: false,
        component: <Login />
    },
    {
        path: '/register',
        auth: false,
        component: <RegisterForm />
    },
];

const RouterPage = () => {
    return (
        <NotificationProvider >
            <BrowserRouter>
                <Routes>
                    {routes.map((route, index) => {
                        if (route.layout === 'doctor') {
                            return (
                                <Route key={index} path="/doctor">
                                    {route.auth ? (
                                        <Route element={<AuthRoute />} >
                                            <Route path={route.path} element={route.component} />
                                        </Route>
                                    ) : (
                                        <Route path={route.path} element={route.component} />
                                    )}
                                </Route>
                            );
                        } else if (route.layout === 'patient') {
                            return (
                                <Route key={index} path="/patient">
                                    {route.auth ? (
                                        <Route element={<AuthRoute />}>
                                            <Route path={route.path} element={route.component} />
                                        </Route>
                                    ) : (
                                        <Route path={route.path} element={route.component} />
                                    )}
                                </Route>
                            );
                        } else {
                            return <Route key={index} path={route.path} element={route.component} />;
                        }
                    })}
                </Routes>
            </BrowserRouter >
        </NotificationProvider>
    );
};

export default RouterPage;
