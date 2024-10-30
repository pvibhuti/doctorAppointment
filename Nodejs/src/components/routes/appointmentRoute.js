const express = require('express');
const router = express.Router();
const verifyToken = require('../Utils/middlewares/authToken.js');
const { upload } = require('../Utils/CommonUtils.js');
const decryptionProcess = require('../Utils/middlewares/decryption.js');
const { validateAppointmentInput } = require('../appointment/model/appointmentValidation.js');
const { bookAppointment, upcomingAppointment, getAppointment, deleteAppointment,remainAppointment, approveAppointment, editAppointment, allcountAppointment, getAppointmentForPatient, rejectAppointment } = require("../appointment/model/appointmentController.js");

// Routes for Appointments
router.post("/bookAppointment", decryptionProcess, verifyToken, validateAppointmentInput, bookAppointment);
router.get("/getAppointment", verifyToken, getAppointment);
router.get("/getAppointmentForPatient", verifyToken, getAppointmentForPatient);
// router.get("/totalAppointment", verifyToken, totalAppointment);
// router.get("/todaysAppointment", verifyToken, todaysAppointment);
// router.get("/tomorrowsAppointment", verifyToken, tomorrowsAppointment);
router.get("/upcomingAppointment", verifyToken, upcomingAppointment);
router.post("/approveAppointment", approveAppointment);
router.post("/rejectAppointment", rejectAppointment);
router.patch("/editAppointment", verifyToken, editAppointment);
router.delete("/deleteAppointment", verifyToken, deleteAppointment);
router.get("/allcountAppointment", verifyToken, allcountAppointment);
router.get("/remainAppointment", verifyToken, remainAppointment);

module.exports = router;
