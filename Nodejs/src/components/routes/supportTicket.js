const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authToken.js');
const decryptionProcess = require('../middlewares/decryption.js');
const { createSupportTicket, getSupportTickets, applyTickets, getApplyTickets, getSelectedApplyTicket, getPatientTicket,
    approveTickets, rejectTickets, uploadMultipleImage, getMessagesByTicket } = require("../supportTickit/model/supportTicketController.js");
const { validateSupportChat, validateSupportTicket, validateApplyTicket } = require("../supportTickit/model/validation.js");

router.post('/createSupportTicket', verifyToken, validateSupportTicket, createSupportTicket);
router.get('/getSupportTickets', getSupportTickets);

router.post('/applyTickets', decryptionProcess, verifyToken, validateApplyTicket, applyTickets);
router.post('/uploadPhoto', uploadMultipleImage);
router.get('/getApplyTickets', verifyToken, getApplyTickets);
router.get('/getSelectedApplyTicket', verifyToken, getSelectedApplyTicket);
router.get('/getPatientTicket', verifyToken, getPatientTicket);
router.get('/getMessagesByTicket', verifyToken, getMessagesByTicket);

router.post('/approveTickets', decryptionProcess, verifyToken, approveTickets);
router.post('/rejectTickets', decryptionProcess, verifyToken, rejectTickets);


module.exports = router;