//use node modules
const config = require('config');
const PORT = config.get('PORT');
const url = config.get('MONGO_URL');
const mongoose = require('mongoose');
const express = require("express");
const path = require('path');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' })
const { upload } = require("./components/Utils/CommonUtils.js");

const app = express();
app.use(express.json());

app.use("/uploads",express.static(path.join(__dirname,'..','uploads')));

const cors = require('cors');
 
app.use(cors({ origin: '*' }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Server create
app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));

//DB Connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//Controller
const adminController = require("./components/admin/model/adminController.js")
const doctorController = require("./components/doctor/model/doctorController.js");
const patientController = require("./components/patient/model/patientController.js");
const appointmentController = require("./components/appointment/model/appointmentController.js");

//Validation Files
const adminValidation = require("./components/admin/model/adminValidation.js");
const doctorValidation = require("./components/doctor/model/doctorValidation.js");
const patientValidation = require("./components/patient/model/patientValidation.js");
const appointmentValidation = require("./components/appointment/model/appointmentValidation.js");
        
//admin
app.post("/registerAdmin", adminValidation.validateadminInput ,adminController.register);
app.post("/loginAdmin", adminController.loginAdmin);

//Doctor
app.post("/registerDoctor", doctorValidation.validateDoctorInput, doctorController.registerDoctor);
app.post("/loginDoctor", doctorController.loginDoctor);
app.post("/login", doctorController.login);
app.post("/uploadDocuments", upload.array("file", 3),doctorController.uploadDocuments);
app.post("/updateProfilePhoto", upload.single("file"), doctorController.updateProfilePhoto);
app.get("/getDoctorData", doctorController.getDoctorData);
app.get("/getDoctors", doctorController.getDoctors);
app.patch("/editDoctorDetails", doctorController.editDoctorDetails);
app.post("/changesPassword", doctorController.changesPassword);
app.post("/sendOTPForgotPassword", doctorController.sendOTPForgotPassword);
app.post("/forgotPassword", doctorController.forgotPassword);

//patient
app.post("/registerPatient", patientValidation.validatePatientInput, patientController.registerPatient);
app.post("/loginPatient", patientController.loginPatient)
app.post("/updateProfilePic", upload.single("file"), patientController.updateProfilePic);
app.get("/getPatientData", patientController.getPatientData)
app.get("/getPatientAppointment", patientController.getPatientAppointment)
app.patch("/editPatient", patientController.editPatient);
app.post("/changePatientPassword", patientController.changePatientPassword);
app.post("/sendOTP", patientController.sendOTP);
app.post("/forgotPatientPassword", patientController.forgotPatientPassword);

//Appoinment 
app.post("/bookAppointment", appointmentValidation.validateAppointmentInput, appointmentController.bookAppointment)
app.get("/getAppointment", appointmentController.getAppointment); //For Doctor with filter
app.get("/getAppointmentForPatient", appointmentController.getAppointmentForPatient); //For Patient with filter
app.get("/totalAppointment", appointmentController.totalAppointment);
app.get("/todaysAppointment", appointmentController.todaysAppointment);
app.get("/tomorrowsAppointment", appointmentController.tomorrowsAppointment);
app.get("/upcomingAppointment", appointmentController.upcomingAppointment);
app.post("/approveAppointment", appointmentController.approveAppointment);
app.post("/rejectAppointment", appointmentController.rejectAppointment);
app.patch("/editAppointment", appointmentController.editAppointment);
app.delete("/deleteAppointment", appointmentController.deleteAppointment)
app.get("/allcountAppointment", appointmentController.allcountAppointment);

//Decrypt
app.post("/decryptionProcess", doctorController.decryptionProcess);