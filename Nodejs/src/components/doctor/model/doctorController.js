const { createHash, sendSuccess, sendError, generateOTP, sendEmail } = require("../../Utils/CommonUtils.js");
const { Message } = require("twilio/lib/twiml/MessagingResponse.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const config = require('config');
const jwtSecret = config.get('JWTSECRET');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const client = require("../../Utils/redisClient.js");
const doctor = require("./doctor.js");
const patient = require("../../patient/model/patient.js");
const { decryptedDataResponse } = require("../../Utils/decryptData.js");
const { verifyToken } = require('../../Utils/authToken.js');
const { json } = require("body-parser");

exports.registerDoctor = async (req, res, next) => {
    try {
        const { fullName, email, phone, password, gender, address } = req.body;
        console.log("req.body", req.body);

        const formattedEmail = email.toLowerCase();

        const secret = speakeasy.generateSecret({ name: formattedEmail });

        const newDoctor = await doctor.create({
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
                message: "Doctor registered successfully.",
                secret: secret.base32,
                qrCodeUrl: dataUrl
            });
            // res.send({message:"Doctor Register Successfully."});
        });

    } catch (error) {
        console.error('Error registering Doctor:', error);
        return sendError(req, res, {
            message: "Doctor not created.",
            error: error.message,
        }, 500);
    }
}

exports.loginDoctor = async (req, res, next) => {
    const { email, password, otp } = req.body;

    try {
        if (!email || !password) {
            return sendError(req, res, {
                message: "Email and password are required."
            });
        }

        const formattedEmail = email.toLowerCase();
        const mainDoctor = await doctor.findOne({ email: formattedEmail });

        if (!mainDoctor) {
            return sendError(req, res, { message: "User not found." }, 404);
        }

        if (mainDoctor.authStatus === 1) {
            if (!otp) {
                return sendError(req, res, {
                    message: "OTP is required.",
                });
            }

            const verified = speakeasy.totp.verify({
                secret: mainDoctor.secret,
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

        const isMatch = await bcrypt.compare(password, mainDoctor.password);
        if (!isMatch) {
            return sendError(req, res, { message: 'Invalid credentials.' }, 401);
        }

        const token = jwt.sign({
            doctorId: mainDoctor._id,
            type: "doctor",
            createdAt: mainDoctor.createdAt
        }, jwtSecret, { expiresIn: '5d' });

        console.log(token);

        const keys = await client.sMembers("doctorToken");
        for (let key of keys) {
            if (key.startsWith(`${formattedEmail}_`)) {
                await client.sRem("doctorToken", key);
            }
        }

        await client.sAdd("doctorToken", `${formattedEmail}_${token}`);

        res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });

        return sendSuccess(req, res, { message: "Login successfully.", token });

    } catch (error) {
        console.error('Error logging in:', error);
        return sendError(req, res, {
            message: "An error occurred during login.",
            error: error.message,
        }, 500);
    }
};

exports.login = async (req, res, next) => {
    const { email, password, otp } = req.body;

    try {
        if (!email || !password) {
            return sendError(req, res, {
                message: "Email and password are required."
            });
        }

        const formattedEmail = email.toLowerCase();
        const mainDoctor = await doctor.findOne({ email: formattedEmail });
        console.log("Main Doctor", mainDoctor);

        const mainPatient = await patient.findOne({ email: formattedEmail });
        console.log("mainPatient ", mainPatient);

        if (mainDoctor) {
            if (!mainDoctor) {
                return sendError(req, res, { message: "User not found." }, 404);
            }

            if (mainDoctor.authStatus === 1) {
                if (!otp) {
                    return sendError(req, res, {
                        message: "OTP is required.",
                    });
                }

                const verified = speakeasy.totp.verify({
                    secret: mainDoctor.secret,
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

            const isMatch = await bcrypt.compare(password, mainDoctor.password);
            if (!isMatch) {
                return sendError(req, res, { message: 'Invalid credentials.' }, 401);
            }

            const token = jwt.sign({
                doctorId: mainDoctor._id,
                fullName: mainDoctor.fullName,
                email: mainDoctor.email,
                phone: mainDoctor.phone,
                password: mainDoctor.password,
                degreeCertificate: mainDoctor.degreeCertificate,
                secret: mainDoctor.secret,
                type: "doctor",
                createdAt: mainDoctor.createdAt
            }, jwtSecret, { expiresIn: '5d' });

            console.log(token);

            const keys = await client.sMembers("doctorToken");
            for (let key of keys) {
                if (key.startsWith(`${formattedEmail}_`)) {
                    await client.sRem("doctorToken", key);
                }
            }

            await client.sAdd("doctorToken", `${formattedEmail}_${token}`);

            res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });
        } else {

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
        }
        return sendSuccess(req, res, { message: "Login successfully." }, token);

    } catch (error) {
        console.error('Error logging in:', error);
        return sendError(req, res, {
            message: "An error occurred during login.",
            error: error.message,
        }, 500);
    }
};

exports.uploadDocuments = async (req, res, next) => {
    try {

        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: decoded.doctorId });
        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account Deleted, please enter an active account."
            });
        }

        const filePaths = req.files.map(file => file.filename);

        const updateImage = await doctor.findByIdAndUpdate(
            existingDoctor._id,
            { degreeCertificate: filePaths },
            { new: true }
        );

        const data = {
            msg: "Documents Uploaded Successfully.",
            filePaths
        };

        return sendSuccess(req, res, data);
    } catch (error) {
        console.error(error);
        return sendError(req, res, { error: error.message }, 500);
    }
};

exports.updateProfilePhoto = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingUser = await doctor.findOne({ _id: decoded.doctorId });
        if (!existingUser) {
            return sendError(req, res, { message: "Doctor not found" }, 404);
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

        await doctor.findByIdAndUpdate(existingUser._id, { profilePhoto: filePaths }, { new: true });

        return sendSuccess(req, res, { message: "Profile Photo updated successfully.", filePaths });
    } catch (error) {
        console.log(error);
        return sendError(req, res, { error: error.message }, 500);
    }
};

exports.getDoctorData = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: decoded.doctorId });
        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." });
        }

        return sendSuccess(req, res, { message: "All the Details", existingDoctor });

    } catch (error) {
        return sendError(req, res, { message: error.message }, 500);
    }
}

exports.getDoctors = async (req, res, next) => {
    try {
        const existingDoctor = await doctor.find();
        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." });
        }

        return sendSuccess(req, res, { message: "All the Details", existingDoctor });

    } catch (error) {
        return sendError(req, res, { message: error.message }, 500);
    }
}

exports.editDoctorDetails = async (req, res, next) => {
    try {
        const { updt } = req.body;

        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: decoded.doctorId });
        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." });
        }


        const updateDoctor = await doctor.findByIdAndUpdate(existingDoctor._id, req.body, { new: true });
        return sendSuccess(req, res, {
            message: "Doctor Details Updated.",
        });
    } catch (error) {
        console.error('Error registering User:', error);
        return sendError(req, res, {
            message: "User not Updated.",
            error: error.message,
        }, 500);
    }
}

exports.decryptionProcess = async (req, res, next) => {
    try {
        const { mac, value } = req.body;
        const decypt = await decryptedDataResponse(mac, value);

        return res.send(decypt);
    } catch (error) {
        console.log(error);
        return sendError(req, res, { message: "Data not encypt.", error: error.message, });
    }
};


exports.changesPassword = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const doctorId = decoded.doctorId;

        const { password, newPassword, confirmPassword } = req.body;
        console.log("req.body ", req.body);

        const userData = await doctor.findById({ _id: doctorId });

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return sendError(req, res, { message: "Incorrect password" });
        }

        if (password === newPassword ) {
            return sendError(req, res, { message: "New Password must be different from current." });
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

exports.sendOTPForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const formattedEmail = email.toLowerCase();

        const userData = await doctor.findOne({email:formattedEmail });

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
        const updateOTP = await doctor.findByIdAndUpdate(
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

exports.forgotPassword = async (req, res, next) => {
    try {
        
        const { email , otp, newPassword, confirmPassword } = req.body;
        const formattedEmail = email.toLowerCase();
                
        const userData = await doctor.findOne({ email: formattedEmail });
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