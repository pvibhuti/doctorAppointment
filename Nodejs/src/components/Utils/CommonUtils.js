const bcrypt = require('bcrypt');
const { model } = require('mongoose');
const { check } = require('express-validator')
// const crypto = require('crypto');
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const randomstring = require("randomstring");
const templatePath = path.resolve(__dirname, 'file.ejs');
const tempPath = path.resolve(__dirname, '..','..','..','views','appointment.ejs');

const { EncryptData } = require("../Utils/encyptData");
const multer = require("multer");
const crypto = require("crypto");

async function createHash(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

const sendSuccess = async (req, res, message) => {
    if (req.headers.env && req.headers.env === "test") {
        res.json(message);
    } else {
        const responseData = await EncryptData(req, res, message);
        res.json(responseData);
    }
    // res.send(message).json();
};

const sendError = async (req, res, message, status = 422) => {
    res.status(status).send(message).json();
};

// Generate OTP function
async function generateOTP() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric'
    });
}

//send Email 
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "patelvibhooti1408@gmail.com",
        pass: "itlu sbwm wikr evku",
    },
});

async function sendEmail(to, subject, templateData) {
    try {
        const html = await ejs.renderFile(templatePath, templateData);
        const mailOptions = {
            from: "patelvibhooti1408@gmail.com",
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

async function sendAppointmentEmail(to, subject, templateData) {
    try {
        const html = await ejs.renderFile(tempPath, templateData);
        const mailOptions = {
            from: "patelvibhooti1408@gmail.com",
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

function generateHash(filename) {
    return crypto.createHash('md5').update(filename).digest('hex');
}

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const hash = generateHash(file.originalname);
        cb(null, hash + path.extname(file.originalname));
    },
    
});

const fileFilterConfig = (req, file, cb) => {
    const isPhoto = file.mimetype.startsWith('image/');
    // const isvideo = file.mimetype.startsWith('video/');
    if (isPhoto) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storageConfig,
    fileFilter: fileFilterConfig,
});

//audio Upload
const storageConfigforAudio = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio');
    },
    filename: (req, file, cb) => {
        const hash = generateHash(file.originalname);
        cb(null, hash + path.extname(file.originalname));
    },
});

const fileFilterConfigAudio = (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio/');
    if (isAudio) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

const uploadAudio = multer({
    storage: storageConfigforAudio,
    fileFilter: fileFilterConfigAudio,
});

function createReferralCode(email, username) {
    const referralCode = `${email}/referid=${username}`;
    return referralCode;
}


module.exports = { createHash, sendSuccess, sendError, generateOTP, sendEmail, upload, uploadAudio, createReferralCode , sendAppointmentEmail}