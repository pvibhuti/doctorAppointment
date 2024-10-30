const express = require('express');
const router = express.Router();
const verifyToken = require('../Utils/middlewares/authToken.js');
const { registerPatient, loginPatient, updateProfilePic, editPatient, getPatientData, getPatientAppointment, changePatientPassword, sendOTP, forgotPatientPassword } = require('../patient/model/patientController.js');
const { validatePatientInput } = require('../patient/model/patientValidation.js');
const { upload } = require('../Utils/CommonUtils.js');
const decryptionProcess = require('../Utils/middlewares/decryption.js');

router.post('/registerPatient', decryptionProcess, validatePatientInput, registerPatient);
router.post('/loginPatient', decryptionProcess, loginPatient);
router.post('/updateProfilePic', verifyToken, upload.single("file"), updateProfilePic);
router.get('/getPatientData', verifyToken, getPatientData);
router.get('/getPatientAppointment', verifyToken, getPatientAppointment);
router.patch('/editPatient', decryptionProcess, verifyToken, editPatient);
router.post('/changePatientPassword', decryptionProcess, verifyToken, changePatientPassword);
router.post('/sendOTP', decryptionProcess, sendOTP);
router.post('/forgotPatientPassword', decryptionProcess, forgotPatientPassword);

module.exports = router;