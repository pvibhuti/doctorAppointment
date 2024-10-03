const admin = require("./admin.js");
const { createHash, sendSuccess, sendError } = require("../../Utils/CommonUtils.js");
const { Message } = require("twilio/lib/twiml/MessagingResponse.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const config = require('config');
const jwtSecret = config.get('JWTSECRET');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const client = require("../../Utils/redisClient.js");

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const formattedEmail = email.toLowerCase();

        // const adminExist = await admin.find();
        // if (adminExist) {
        //     return sendError(req, res, {
        //         message: "Admin already registered, please login.",
        //     });
        // }

        const secret = speakeasy.generateSecret({ name: formattedEmail });

        const newAdmin = await admin.create({
            firstName,
            lastName,
            email: formattedEmail,
            password: await createHash(password),
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
                message: "Admin registered successfully.",
                secret: secret.base32,
                qrCodeUrl: dataUrl
            });
        });

    } catch (error) {
        console.error('Error registering admin:', error);
        return sendError(req, res, {
            message: "Admin not created.",
            error: error.message,
        }, 500);
    }
}

exports.loginAdmin = async (req, res, next) => {
    const { email, password, otp } = req.body;

    try {
        if (!email || !password) {
            return sendError(req, res, {
                message: "Email and password are required."
            });
        }

        const formattedEmail = email.toLowerCase();

        const mainAdmin = await admin.findOne({ email: formattedEmail });
        if (!mainAdmin) {
            return sendError(req, res, { message: "Admin not found." }, 404);
        }

        if (mainAdmin.authStatus === 1) {
            if (!otp) {
                return sendError(req, res, {
                    message: "OTP is required.",
                });
            }

            const verified = speakeasy.totp.verify({
                secret: mainAdmin.secret,
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

        const isMatch = await bcrypt.compare(password, mainAdmin.password);
        if (!isMatch) {
            return sendError(req, res, { message: 'Invalid credentials.' }, 401);
        }

        const token = jwt.sign({
            adminId: mainAdmin._id,
            type: "admin",
            createdAt: mainAdmin.createdAt
        }, jwtSecret, { expiresIn: '5d' });

        console.log(token);

        const keys = await client.sMembers("adminToken");
        for (let key of keys) {
            if (key.startsWith(`${formattedEmail}_`)) {
                await client.sRem("adminToken", key);
            }
        }

        await client.sAdd("adminToken", `${formattedEmail}_${token}`);

        res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });

        return sendSuccess(req, res, { message: "Login successfully." });
    } catch (error) {
        console.error('Error logging in:', error);
        return sendError(req, res, {
            message: "An error occurred during login.",
            error: error.message,
        }, 500);
    }
};

