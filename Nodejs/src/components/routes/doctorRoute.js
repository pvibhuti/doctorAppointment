const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authToken.js');
const { upload } = require('../Utils/CommonUtils.js');
const decryptionProcess = require('../middlewares/decryption.js');
const { validateDoctorInput } = require('../doctor/model/doctorValidation.js');
const { registerDoctor, loginDoctor, login, uploadDocuments, updateProfilePhoto, getDoctorData, changesPassword, sendOTPForgotPassword, forgotPassword , editDoctorDetails, getDoctors} = require("../doctor/model/doctorController.js");

router.post("/registerDoctor", decryptionProcess, validateDoctorInput, registerDoctor);
router.post("/loginDoctor", decryptionProcess, loginDoctor);
router.post("/login", decryptionProcess, login);
router.post("/uploadDocuments", verifyToken, upload.array("file", 3), uploadDocuments);
router.post("/updateProfilePhoto", verifyToken, upload.single("file"), updateProfilePhoto);
router.get("/getDoctorData", verifyToken, getDoctorData);
router.get("/getDoctors", getDoctors);
router.patch("/editDoctorDetails", decryptionProcess, verifyToken, editDoctorDetails);
router.post("/changesPassword", decryptionProcess, verifyToken, changesPassword);
router.post("/sendOTPForgotPassword", decryptionProcess, sendOTPForgotPassword);
router.post("/forgotPassword", decryptionProcess, forgotPassword);

module.exports = router;