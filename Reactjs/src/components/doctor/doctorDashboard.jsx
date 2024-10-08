import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get, post } from '../../security/axios.js';
import { toastMessage } from '../helpers/Toast.jsx';
import { API_URL } from '../../services/config.js';
import { fetchData } from '../common/handleMethods.jsx';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [tommorowappointment, setTommorowAppintment] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
    // fetchDoctorInfo();
    // fetchUpcomingAppointment();
    // fetchallcountAppointment();
  }, []);

  const fetchAllData = async () => {
    await fetchData('/getDoctorData', (data) => { setDoctor(data.existingDoctor) })
    await fetchData('/upcomingAppointment', (data) => { setAppointments(data.upcomingAppointments) })
    await fetchData('/allcountAppointment', (data) => {
      setTotalAppointments(data.totalAppointments);
      setTodaysAppointments(data.todayAppointments);
      setTommorowAppintment(data.tomorrowAppointments);
    })
  }

  // const fetchDoctorInfo = async () => {
  //   return new Promise((resolve, reject) => {
  //     get(`/getDoctorData`)
  //       .then((response) => {
  //         setDoctor(response.data.existingDoctor);
  //         resolve(response);
  //       })
  //       .catch((error) => {
  //         console.error('getDoctor Data error:', error);
  //         reject(error);
  //       });
  //   });
  // }


  // const fetchUpcomingAppointment = async () => {
  //   return new Promise((resolve, reject) => {
  //     get(`/upcomingAppointment`)
  //       .then((response) => {
  //         setAppointments(response.data.upcomingAppointments || [])
  //         resolve(response);
  //       })
  //       .catch((error) => {
  //         console.error('Upcomming Appointment error:', error);
  //         reject(error);
  //       });
  //   });
  // };

  // const fetchallcountAppointment = async () => {
  //   return new Promise((resolve, reject) => {
  //     get(`/allcountAppointment`)
  //       .then((response) => {
  //         setTotalAppointments(response.data.totalAppointments);
  //         setTodaysAppointments(response.data.todayAppointments);
  //         setTommorowAppintment(response.data.tomorrowAppointments);
  //         resolve(response);
  //       })
  //       .catch((error) => {
  //         console.error('getDoctor Data error:', error);
  //         reject(error);
  //       });
  //   });
  // };

  const handleAppointmentAction = async (action, appointmentId) => {
    const url = action === 1
      ? `/approveAppointment?id=${appointmentId}`
      : `/rejectAppointment?id=${appointmentId}`;
    return new Promise((resolve, reject) => {
      post(url)
        .then((response) => {
          alert(`Appointment ${action === 1 ? 'Approved' : 'Rejected'} Successfully.`);
          resolve(response);
        })
        .catch((error) => {
          console.error('Error:', error);
          toastMessage('error', Object.values(error.response.data).toString());
          reject(error);
        })
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-2xl font-semibold">{doctor.fullName || 'Dr. John Doe'}</h2>
          <div className="mt-4">
            <img src={doctor.profilePhoto ? `${API_URL}/uploads/${doctor.profilePhoto}` : 'DoctorProfile'} alt="Profile" className="rounded-full w-20 h-20" />
          </div>
        </div>
        <nav className="mt-10">
          <Link to="/doctor/appointments" ><a href="/doctor/appointments" className="block py-2 px-4 hover:bg-gray-700"> Appointments</a> </Link>
          <Link to="/doctor/myProfile" > <a href="/doctor/myProfile" className="block py-2 px-4 hover:bg-gray-700"> My Profile </a> </Link>
          <Link to="/doctor/changePassword" > <a href="/doctor/changePassword" className="block py-2 px-4 hover:bg-gray-700"> Change Password </a> </Link>
          <Link to="/login" ><a href="/login" className="block py-2 px-4 hover:bg-gray-700" onClick={logout}>Logout</a> </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome to Doctor Dashboard</h1>
          <div>
            <p className="text-lg">{doctor.fullName || 'Dr. John Doe'}</p>
            <p className="text-sm font-bold item-center">{doctor.designation || 'MBBS'}</p>
            <Link to="/login" ><button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button> </Link>
          </div>
        </header>

        {/* Cards Section */}
        <div className="grid grid-cols-1 items-center md:items-center grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Today's Appointments</h3>
            <p className="text-2xl">{todaysAppointments}</p>
          </div>
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-2xl">{totalAppointments}</p>
          </div>
          <div className="card p-4 bg-white shadow-md rounded">
            <h3 className="text-lg font-semibold">Tommorrow Appointments</h3>
            <p className="text-2xl">{tommorowappointment}</p>
          </div>
        </div>

        {/* Appointment List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
          <table className="min-w-full mt-4 bg-white shadow-md rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-blue-100">Patient Name</th>
                <th className="py-2 px-4 border-b bg-blue-100 ">Date</th>
                <th className="py-2 px-4 border-b bg-blue-100">Time</th>
                <th className="py-2 px-4 border-b bg-blue-100">Status</th>
                <th className="py-2 px-4 border-b bg-blue-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{appointment.patientId.fullName}</td>
                  <td className="py-2 px-4 border-b">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
                  <td className="py-2 px-4 border-b">
                    {appointment.status === 0 ? "Pending" : appointment.status === 1 ? "Approved" : "Rejected"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {appointment.status === 0 ? (
                      <>
                        <button
                          onClick={() => handleAppointmentAction(1, appointment._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(2, appointment._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>
                        {appointment.status === 1 ? (
                          <span className="bg-green-200 px-2 py-1 rounded">Approved</span>
                        ) : (
                          <span className="bg-red-200 px-2 py-1 rounded">Rejected</span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Profile Details */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold items-center">Doctor Details</h2>
          <div className="w-half p-6 bg-white rounded-lg shadow-lg item-center">
            <div className="grid grid-cols-1 gap-5">
              <ProfileField label="Full Name" value={doctor.fullName} />
              <ProfileField label="Email" value={doctor.email} />
              <ProfileField label="Contact Number" value={doctor.phone} />
              <ProfileField label="Gender" value={doctor.gender} />
              <ProfileField label="Designation" value={doctor.designation} />
              <ProfileField label="expertise" value={doctor.expertise} />
              <ProfileField label="shiftStartTime" value={doctor.shiftStartTime} />
              <ProfileField label="shiftEndTime" value={doctor.shiftEndTime} />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />

    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div className="border-b py-4">
    <h3 className="font-bold">{label}:</h3>
    <p>{value || 'Not Provided'}</p>
  </div>
);

export default DoctorDashboard;



// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Link, useNavigate } from "react-router-dom";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { post } from '../../security/axios.js';
// import { toastMessage } from '../helpers/Toast.jsx';
// import { API_URL } from '../../services/config.js';
// import { fetchData } from '../common/handleMethods.jsx';

// const DoctorDashboard = () => {
//   const [doctor, setDoctor] = useState({});
//   const [appointments, setAppointments] = useState([]);
//   const [totalAppointments, setTotalAppointments] = useState(0);
//   const [todaysAppointments, setTodaysAppointments] = useState(0);
//   const [tomorrowAppointments, setTomorrowAppointments] = useState(0);
//   const navigate = useNavigate();

// useEffect(() => {
//   fetchDoctorInfo();
//   fetchUpcomingAppointment();
//   fetchAllCountAppointment();
// }, []);

//   const fetchDoctorInfo = useCallback(async () => {
//     fetchData(`/getDoctorData`, (data) => {
//       setDoctor(data.existingDoctor || {});
//     });
//   }, []);

//   const fetchUpcomingAppointment = useCallback(async () => {
//     fetchData(`/upcomingAppointment`, (data) => {
//       setAppointments(data.upcomingAppointments || []);
//     });
//   }, []);

//   const fetchAllCountAppointment = useCallback(async () => {
//     fetchData(`/allcountAppointment`, (data) => {
//       setTotalAppointments(data.totalAppointments || 0);
//       setTodaysAppointments(data.todayAppointments || 0);
//       setTomorrowAppointments(data.tomorrowAppointments || 0);
//     });
//   }, []);

//   const handleAppointmentAction = async (action, appointmentId) => {
//     const url = action === 1
//       ? `/approveAppointment?id=${appointmentId}`
//       : `/rejectAppointment?id=${appointmentId}`;

//     try {
//       const response = await post(url);
//       alert(`Appointment ${action === 1 ? 'Approved' : 'Rejected'} Successfully.`);
//       return response;
//     } catch (error) {
//       console.error('Error:', error);
//       toastMessage('error', Object.values(error.response.data).toString());
//       throw error;
//     }
//   };

//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     navigate("/login");
//   }, [navigate]);

//   const doctorInfo = useMemo(() => ({
//     fullName: doctor.fullName || 'Dr. John Doe',
//     profilePhoto: doctor.profilePhoto ? `${API_URL}/uploads/${doctor.profilePhoto}` : 'DoctorProfile',
//     designation: doctor.designation || 'MBBS'
//   }), [doctor]);

//   // return (
//     <div className="flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white min-h-screen">
//         <div className="p-4">
//           <h2 className="text-2xl font-semibold">{doctorInfo.fullName}</h2>
//           <div className="mt-4">
//             <img src={doctorInfo.profilePhoto} alt="Profile" className="rounded-full w-20 h-20" />
//           </div>
//         </div>
//         <nav className="mt-10">
//           <Link to="/doctor/appointments" className="block py-2 px-4 hover:bg-gray-700">Appointments</Link>
//           <Link to="/doctor/myProfile" className="block py-2 px-4 hover:bg-gray-700">My Profile</Link>
//           <Link to="/doctor/changePassword" className="block py-2 px-4 hover:bg-gray-700">Change Password</Link>
//           <a href="/login" className="block py-2 px-4 hover:bg-gray-700" onClick={logout}>Logout</a>
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6 bg-gray-100">
//         {/* Header */}
//         <header className="flex justify-between items-center">
//           <h1 className="text-3xl font-bold">Welcome to Doctor Dashboard</h1>
//           <div>
//             <p className="text-lg">{doctorInfo.fullName}</p>
//             <p className="text-sm font-bold item-center">{doctorInfo.designation}</p>
//             <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
//           </div>
//         </header>

//         {/* Cards Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//           <div className="card p-4 bg-white shadow-md rounded">
//             <h3 className="text-lg font-semibold">Today's Appointments</h3>
//             <p className="text-2xl">{todaysAppointments}</p>
//           </div>
//           <div className="card p-4 bg-white shadow-md rounded">
//             <h3 className="text-lg font-semibold">Total Appointments</h3>
//             <p className="text-2xl">{totalAppointments}</p>
//           </div>
//           <div className="card p-4 bg-white shadow-md rounded">
//             <h3 className="text-lg font-semibold">Tomorrow's Appointments</h3>
//             <p className="text-2xl">{tomorrowAppointments}</p>
//           </div>
//         </div>

//         {/* Appointment List */}
//         <div className="mt-10">
//           <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
//           <table className="min-w-full mt-4 bg-white shadow-md rounded">
//             <thead>
//               <tr>
//                 <th className="py-2 px-4 border-b bg-blue-100">Patient Name</th>
//                 <th className="py-2 px-4 border-b bg-blue-100">Date</th>
//                 <th className="py-2 px-4 border-b bg-blue-100">Time</th>
//                 <th className="py-2 px-4 border-b bg-blue-100">Status</th>
//                 <th className="py-2 px-4 border-b bg-blue-100">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((appointment, index) => (
//                 <tr key={index}>
//                   <td className="py-2 px-4 border-b">{appointment.patientId.fullName}</td>
//                   <td className="py-2 px-4 border-b">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
//                   <td className="py-2 px-4 border-b">{appointment.appointmentTime}</td>
//                   <td className="py-2 px-4 border-b">
//                     {appointment.status === 0 ? "Pending" : appointment.status === 1 ? "Approved" : "Rejected"}
//                   </td>
//                   <td className="py-2 px-4 border-b">
//                     {appointment.status === 0 ? (
//                       <>
//                         <button
//                           onClick={() => handleAppointmentAction(1, appointment._id)}
//                           className="bg-green-500 text-white px-2 py-1 rounded"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleAppointmentAction(2, appointment._id)}
//                           className="bg-red-500 text-white px-2 py-1 rounded ml-2"
//                         >
//                           Reject
//                         </button>
//                       </>
//                     ) : (
//                       <span>
//                         {appointment.status === 1 ? (
//                           <span className="bg-green-200 px-2 py-1 rounded">Approved</span>
//                         ) : (
//                           <span className="bg-red-200 px-2 py-1 rounded">Rejected</span>
//                         )}
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* {/ Profile Details /} */}
//         {/* <div className="mt-10">
//           <h2 className="text-2xl font-bold items-center">Doctor Details</h2>
//           <div className="w-half p-6 bg-white rounded-lg shadow-lg item-center">
//             <div className="grid grid-cols-1 gap-5">
//               <ProfileField label="Full Name" value={doctor.fullName} />
//               <ProfileField label="Email" value={doctor.email} />
//               <ProfileField label="Contact Number" value={doctor.phone} />
//               <ProfileField label="Gender" value={doctor.gender} />
//               <ProfileField label="Designation" value={doctor.designation} />
//               <ProfileField label="Consultation Fee" value={doctor.consultationFee} />
//               <ProfileField label="Specialty" value={doctor.specialty} />
//               <ProfileField label="Experience" value={doctor.experience} />
//             </div>
//           </div>
//         </div>
//       </div> */}

//       <ToastContainer />
//     </div>
//   );
// };

// // const ProfileField = ({ label, value }) => (
// //   <div className="border-b py-4">
// //     <h3 className="font-bold">{label}:</h3>
// //     <p>{value || 'Not Provided'}</p>
// //   </div>
// // );

// // export default DoctorDashboard;