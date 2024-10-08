import { Route, Routes } from "react-router-dom";
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

let routes = [
    {
        path: '/doctor/dashboard',
        layout: 'doctor',
        auth: false,
        component: <DoctorDashboard />,
    },
    {
        path: '/doctor/appointments',
        layout: 'doctor',
        auth: false,
        component: <Appointments />,
    },
    {
        path: '/doctor/changePassword',
        layout: 'doctor',
        auth: true,
        component: <ChangePassword />,
    },
    {
        path: '/doctor/forgotPassword',
        layout: 'doctor',
        auth: false,
        component: <ForgotPassword />,
    },
    {
        path: '/doctor/updateProfile',
        layout: 'doctor',
        auth: false,
        component: <UpdateProfile />,
    },
    {
        path: '/doctor/myProfile',
        layout: 'doctor',
        auth: false,
        component: <MyProfile />,
    },


    //   Patient
    {
        path: '/patient/dashboard',
        layout: 'patient',
        auth: false,
        component: <PatientDashboard />,
    },
    {
        path: '/patient/appointments',
        layout: 'patient',
        auth: false,
        component: <AppointmentLists />,
    },
    {
        path: '/patient/changePassword',
        layout: 'patient',
        auth: true,
        component: <ChangePatientPassword />,
    },
    {
        path: '/patient/forgotPassword',
        layout: 'patient',
        auth: false,
        component: <ForgotPatientPassword />,
    },
    {
        path: '/patient/myProfile',
        layout: 'patient',
        auth: false,
        component: <PatientProfile />,
    },
    {
        path: '/patient/updateProfile',
        layout: 'patient',
        auth: false,
        component: <UpdatePatientProfile />,
    },
    {
        path: '/patient/bookAppointment',
        layout: 'patient',
        auth: false,
        component: <BookAppointment />,
    },

    //Common for all 
    {
        path: '/',
        auth: false,
        component: <Home />,
    },
    {
        path: '/login',
        auth: true,
        component: <Login />,
    },
    {
        path: '/register',
        auth: false,
        component: <RegisterForm />,
    },

];

const RouterPage = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />
            {routes.map((route, index) => {              
                if (route.layout === 'doctor') {                    
                    if (route.auth) {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <AuthRoute>
                                        {route.component}
                                    </AuthRoute>
                                }
                            />
                        );
                    } else {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={route.component}
                            />
                        );
                    }
                } else {
                    if (route.auth) {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <AuthRoute>
                                        {route.component}
                                    </AuthRoute>
                                }
                            />
                        );
                    } else {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={route.component}
                            />
                        );
                    }

                }
            }
            )}
        </Routes>
    );
};

export default RouterPage;