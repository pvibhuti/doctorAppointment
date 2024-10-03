const { createHash, sendSuccess, sendError, generateOTP, sendEmail } = require("../../Utils/CommonUtils.js");
const { Message } = require("twilio/lib/twiml/MessagingResponse.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const config = require('config');
const jwtSecret = config.get('JWTSECRET');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const client = require("../../Utils/redisClient.js");
const patient = require("./patient.js");
const appointment = require("../../appointment/model/appointment.js");
const { verifyToken } = require('../../Utils/authToken.js');


exports.registerPatient = async (req, res, next) => {
    try {
        const { fullName, email, phone, password, gender, address } = req.body;
        console.log("req.body", req.body);

        const formattedEmail = email.toLowerCase();

        const secret = speakeasy.generateSecret({ name: formattedEmail });

        const newDoctor = await patient.create({
            fullName,
            email: formattedEmail,
            phone,
            password: await createHash(password),
            gender,
            address,
            secret: secret.base32
        });

        qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) {
                return sendError(req, res, {
                    message: "Error generating QR code.",
                    error: err.message,
                }, 500);
            }
            return sendSuccess(req, res, {
                message: "Patient registered successfully.",
                secret: secret.base32,
                qrCodeUrl: dataUrl
            });
        });

    } catch (error) {
        console.error('Error registering patient:', error);
        return sendError(req, res, {
            message: "Patient not created.",
            error: error.message,
        }, 500);
    }
}

exports.loginPatient = async (req, res, next) => {
    const { email, password, otp } = req.body;

    try {
        if (!email || !password) {
            return sendError(req, res, {
                message: "Email and password are required."
            });
        }

        const formattedEmail = email.toLowerCase();
        const mainPatient = await patient.findOne({ email: formattedEmail });

        if (!mainPatient) {
            return sendError(req, res, { message: "User not found." }, 404);
        }

        if (mainPatient.authStatus === 1) {
            if (!otp) {
                return sendError(req, res, {
                    message: "OTP is required.",
                });
            }

            const verified = speakeasy.totp.verify({
                secret: mainPatient.secret,
                encoding: "base32",
                token: otp
            });

            if (!verified) {
                return sendError(req, res, {
                    message: "Google 2FA Failed.",
                }, 401);
            }
        } else {
            if (otp) {
                return sendError(req, res, {
                    message: "OTP is not required.",
                });
            }
        }

        const isMatch = await bcrypt.compare(password, mainPatient.password);
        if (!isMatch) {
            return sendError(req, res, { message: 'Invalid credentials.' }, 401);
        }

        const token = jwt.sign({
            patientId: mainPatient._id,
            fullName: mainPatient.fullName,
            email: mainPatient.email,
            phone: mainPatient.phone,
            password: mainPatient.password,
            secret: mainPatient.secret,
            profilePhoto: mainPatient.profilePhoto,
            type: "patient",
            createdAt: mainPatient.createdAt
        }, jwtSecret, { expiresIn: '5d' });

        console.log(token);

        const keys = await client.sMembers("patientToken");
        for (let key of keys) {
            if (key.startsWith(`${formattedEmail}_`)) {
                await client.sRem("patientToken", key);
            }
        }

        await client.sAdd("patientToken", `${formattedEmail}_${token}`);

        res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });

        return sendSuccess(req, res, { message: "Login successfully.", token });
        // return res.status(200).json({token})

    } catch (error) {
        console.error('Error logging in:', error);
        return sendError(req, res, {
            message: "An error occurred during login.",
            error: error.message,
        }, 500);
    }
};

exports.editPatient = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const { updt } = req.body;

        const patientExist = await patient.findById({ _id: decoded.patientId });
        if (!patientExist) {
            return sendError(req, res, {
                message: "Patient Not found.",
            }, 404);
        }

        const updatePatient = await patient.findByIdAndUpdate(patientExist._id, req.body, { new: true });
        return sendSuccess(req, res, {
            message: "Patient Details Updated.",
        });
    } catch (error) {
        console.error('Error registering User:', error);
        return sendError(req, res, {
            message: "User not Updated.",
            error: error.message,
        }, 500);
    }
}

exports.updateProfilePic = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const patientId = decoded.patientId;

        const existingUser = await patient.findOne({ _id:patientId });
        if (!existingUser) {
            return sendError(req, res, { message: "User not found" }, 404);
        }

        if (existingUser.status === 1) {
            return sendError(req, res, {
                message: "Account Deleted, please enter an active account.",
            });
        }

        if (!req.file) {
            return sendError(req, res, { message: "No file uploaded" }, 400);
        }

        const filePaths = req.file.filename;
        console.log(filePaths);

        await patient.findByIdAndUpdate(existingUser._id, { profilePhoto: filePaths }, { new: true });

        return sendSuccess(req, res, { message: "Profile Photo updated successfully." });
    } catch (error) {
        console.log(error);
        return sendError(req, res, { error: error.message }, 500);
    }
};

exports.getPatientData = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingPatient = await patient.findOne({ _id: decoded.patientId });
        if (!existingPatient) {
            return sendError(req, res, { message: "Invalid token or User not found." });
        }
        return sendSuccess(req, res, { message: "Patient Detsilas here", existingPatient });
    } catch (error) {
        return sendError(req, res, { message: error.message }, 500);
    }
}

exports.getPatientAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const patientAppointment = await appointment.find({ patientId: decoded.patientId }).populate('doctorId patientId', 'fullName');
        if (!patientAppointment) {
            return sendError(req, res, { message: "Invalid token or User not found." });
        }
        return sendSuccess(req, res, { message: "Patient Appointment here", patientAppointment });
    } catch (error) {
        return sendError(req, res, { message: error.message }, 500);
    }
}

exports.changePatientPassword = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const patientId = decoded.patientId;

        const { password, newPassword, confirmPassword } = req.body;
        console.log("req.body ", req.body);

        const userData = await patient.findById({ _id: patientId });

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return sendError(req, res, { message: "Incorrect password" });
        }

        if (newPassword !== confirmPassword) {
            return sendError(req, res, {
                message: "New Password and Confirm Password do not match",
            });
        }

        userData.password = await createHash(confirmPassword);
        await userData.save();

        console.log("password changes successfully.");

        return sendSuccess(req, res, { message: "Password changed successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        return sendError(req, res, {
            error: error.message,
        });
    }
}

exports.sendOTP = async (req, res, next) => {
    try {
        // const decoded = await verifyToken(req, res);
        // if (!decoded) {
        //     return sendError(req, res, { message: "Token is invalid." }, 403);
        // }

        // const patientId = decoded.patientId;

        const { email } = req.body;
        const formattedEmail = email.toLowerCase();

        const userData = await patient.findOne({ email: formattedEmail});

        if (userData.email !== formattedEmail) {
            return sendError(req, res, { message: "Wrong Email Id." });
        }

        const fullName = userData.fullName;
        const otpCode = await generateOTP();

        const templateData = {
            fullName: userData.fullName,
            otp: otpCode,
        };

        await sendEmail(formattedEmail, "Account Verification", templateData);
        const updateOTP = await patient.findByIdAndUpdate(
            userData._id,
            { otp: otpCode },
            { new: true }
        );
        console.log("OTP Send Succesfully");

        return sendSuccess(req, res, { message: "OTP Send Succesfully" });
    } catch (error) {
        console.error("Error:", error.message);
        return sendError(req, res, {
            error: error.message,
        });
    }

};

exports.forgotPatientPassword = async (req, res, next) => {
    try {
        // const decoded = await verifyToken(req, res);
        // if (!decoded) {
        //     return sendError(req, res, { message: "Token is invalid." }, 403);
        // }

        // const patientId = decoded.patientId;

        const { email , otp, newPassword, confirmPassword } = req.body;
        const formattedEmail = email.toLowerCase();
        const userData = await patient.findOne({ email: formattedEmail });
        
        if (!userData) {
            return sendError(req, res, { message: "User Not Found" });
        }

        if (userData.otp !== Number(otp)) {
            return sendError(req, res, { message: "Invalid OTP" });
        }

        if (newPassword !== confirmPassword) {
            return sendError(req, res, {
                message: "Password and Confirm Password do not match",
            });
        }

        userData.password = await createHash(confirmPassword);
        userData.otp = undefined;
        await userData.save();

        console.log("Password changed successfully");
        return sendSuccess(req, res, { message: "Password changed successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        return sendError(req, res, {
            error: error.message,
        });
    }
};