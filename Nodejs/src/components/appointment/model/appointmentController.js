const { createHash, sendSuccess, sendError, sendAppointmentEmail } = require("../../Utils/CommonUtils.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('JWTSECRET');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const client = require("../../Utils/redisClient.js");
const appointment = require("./appointment.js");
const moment = require('moment');
const { verifyToken } = require('../../Utils/authToken.js');
const doctor = require("../../doctor/model/doctor.js");
const patient = require("../../patient/model/patient.js");

exports.bookAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }
        console.log("decoded", decoded);

        const { doctorId, appointmentDate, appointmentTime, appointmentFor, disease } = req.body;

        if (moment().isAfter(appointmentDate)) {
            return sendError(req, res, { message: "Appointment date must be in the future." });
        }

        const appointmentDateFormatted = moment(appointmentDate).format('YYYY-MM-DD');
        const appointmentTimeFormatted = moment(appointmentTime, 'HH:mm').format('HH:mm');
        console.log("Formated Time ", appointmentTimeFormatted);

        const doctorData = await doctor.findById(doctorId);
        if (!doctorData) {
            return sendError(req, res, { message: "Doctor not found." }, 404);
        }

        const appointmentTimeMoment = moment(appointmentTime, 'HH:mm');

        if ((appointmentTime > doctorData.shiftStartTime) && (appointmentTime > doctorData.shiftEndTime)) {
            return sendError(req, res, {
                message: "The appointment time must be within the doctor's shift timings."
            });
        }

        const existingAppointment = await appointment.findOne({
            doctorId,
            appointmentDate,
            appointmentTime
        });

        if (existingAppointment) {
            return sendError(req, res, {
                message: "An appointment is already scheduled with this doctor at this time on that date."
            });
        }

        const timeThreshold = appointmentTimeMoment.subtract(30, 'minutes');
        const overlappingAppointment = await appointment.findOne({
            doctorId,
            appointmentDate: appointmentDateFormatted,
            appointmentTime: {
                $gte: timeThreshold.format('HH:mm'),
                $lt: appointmentTimeFormatted
            }
        });

        if (overlappingAppointment) {
            return sendError(req, res, {
                message: "There is an existing appointment within 30 minutes of the requested time. Please choose a time at least 30 minutes later."
            });
        }

        const patientData = await patient.findById(decoded.patientId);
        if (!patientData) {
            return sendError(req, res, { message: "Patient not found." }, 404);
        }

        const newAppointment = await appointment.create({
            doctorId,
            patientId: decoded.patientId,
            appointmentDate: appointmentDateFormatted,
            appointmentTime: appointmentTimeFormatted,
            appointmentFor,
            disease
        });

        const templateData = {
            patientName: patientData.fullName,
            appointmentDate: appointmentDateFormatted,
            appointmentTime: appointmentTimeFormatted,
            disease,
            appointmentFor
        };
        console.log("template Data ", templateData);

        const email = doctorData.email;
        await sendAppointmentEmail(email, "New Appointment", templateData);

        return sendSuccess(req, res, {
            message: "Appointment registered successfully.",
            newAppointment
        });

    } catch (error) {
        console.error('Error registering appointment:', error);
        if (!res.headersSent) {
            return sendError(req, res, {
                message: "Error registering appointment.",
                error: error.message
            }, 500);
        }
    }
};

//Get Appointment For Doctor With Filter
exports.getAppointment = async (req, res, next) => {
    try {
        const {  day, time, status } = req.query;

        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        let filter = { doctorId: decoded.doctorId };

        let today = moment().startOf('day').format('YYYY-MM-DD');        
        let tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');
        let beforeToday = { $lt: today };
        let underWeek = { $gte: today, $lt: moment().add(7, 'days').startOf('day').format('YYYY-MM-DD') };
        let thisMonth = { $gte: moment().startOf('month').toDate(), $lt: moment().add(1, 'month').startOf('month').format('YYYY-MM-DD') };

        if (day === 'today') {
            filter.appointmentDate = today;
        } else if (day === 'tomorrow') {
            filter.appointmentDate = tomorrow;
        } else if (day === 'before') {
            filter.appointmentDate = beforeToday;
        } else if (day === 'under_week') {
            filter.appointmentDate = underWeek;
        } else if (day === 'month') {
            filter.appointmentDate = thisMonth;
        }

        if (time) {
            const [hours, minutes] = time.split(':');
            const appointmentTime = `${hours}:${minutes}`;

            filter.appointmentTime = {
                $eq: appointmentTime
            };
        }

        if (status) {
            if (status === 'pending') {
                filter.status = 0;
            } else if (status === 'approved') {
                filter.status = 1;
            } else if (status === 'rejected') {
                filter.status = 2;
            }
        }

        const allAppointments = await appointment.find(filter).populate('patientId', 'fullName');

        if (!allAppointments.length) {
            return sendError(req, res, { message: "No appointments found." }, 404);
        }

        return sendSuccess(req, res, { message: "All Appointments", allAppointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return sendError(req, res, { message: "Error fetching appointments.", error: error.message }, 500);
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const id = req.query.id;

        const allAppointments = await appointment.findOne({ _id: id })

        if (!allAppointments) {
            return sendError(req, res, { message: "No appointments found." }, 404);
        }
        // const deletAppointment = await appointment.findByIdAndUpdate(allAppointments._id,{status:1},{new:true})
        const deletAppointment = await appointment.findByIdAndDelete(id);
        console.log("Appointment deleted.");

        return sendSuccess(req, res, { message: "Appointment Deleted Successfully." });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return sendError(req, res, { message: "Error fetching appointments.", error: error.message }, 500);
    }
};

exports.editAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const id = req.query.id;
        const { editData } = req.body;

        const allAppointments = await appointment.findOne({ _id: id })

        if (!allAppointments) {
            return sendError(req, res, { message: "No appointments found." }, 404);
        }

        const updateAppointment = await appointment.findByIdAndUpdate(allAppointments._id, req.body, { new: true });
        console.log("Appointment Updated.");

        return sendSuccess(req, res, { message: "Appointment Updated" });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return sendError(req, res, { message: "Error fetching appointments.", error: error.message }, 500);
    }
};

exports.totalAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const totalAppointments = await appointment.countDocuments({ doctorId: decoded.doctorId });
        return sendSuccess(req, res, {
            message: "Total appointments fetched successfully.",
            totalAppointments
        });

    } catch (error) {
        console.error('Error fetching total appointments:', error);
        return sendError(req, res, {
            message: "Error fetching total appointments.",
            error: error.message
        }, 500);
    }
};

exports.todaysAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const today = moment().format("YYYY-MM-DD");
        const todayAppointments = await appointment.countDocuments({ doctorId: decoded.doctorId, appointmentDate: today });

        return sendSuccess(req, res, {
            message: `Today's appointments fetched successfully.`,
            todayAppointments
        });

    } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        return sendError(req, res, {
            message: "Error fetching today's appointments.",
            error: error.message
        }, 500);
    }
};

exports.tomorrowsAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");
        const tomorrowAppointments = await appointment.countDocuments({ doctorId: decoded.doctorId, appointmentDate: tomorrow });

        return sendSuccess(req, res, {
            message: `Tomorrow's appointments fetched successfully.`,
            tomorrowAppointments
        });

    } catch (error) {
        console.error('Error fetching tomorrow\'s appointments:', error);
        return sendError(req, res, {
            message: "Error fetching tomorrow's appointments.",
            error: error.message
        }, 500);
    }
};

exports.upcomingAppointment = async (req, res, next) => {
    try {
        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const today = moment().startOf('day').toDate();
        const upcomingAppointments = await appointment.find({
            doctorId: decoded.doctorId,
            appointmentDate: { $gt: today }
        }).populate('patientId', 'fullName');

        if (!upcomingAppointments || upcomingAppointments.length === 0) {
            return sendError(req, res, { message: "No upcoming appointments found." }, 404);
        }

        return sendSuccess(req, res, {
            message: "Upcoming appointments fetched successfully.",
            upcomingAppointments
        });

    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        return sendError(req, res, {
            message: "Error fetching upcoming appointments.",
            error: error.message
        }, 500);
    }
};

exports.approveAppointment = async (req, res, next) => {
    try {
        const id = req.body.id || req.query.id || req.params.id;

        const existingAppointment = await appointment.findById(id);
        if (!existingAppointment) {
            return sendError(req, res, { message: "Appointment not found." }, 404);
        }

        const currentTime = moment();
        const appointmentTime = moment(existingAppointment.appointmentDate);

        if (appointmentTime.diff(currentTime, 'hours') < 24) {
            return sendError(req, res, { message: "You can only approve appointments at least 24 hours before the scheduled time." }, 400);
        }

        if (appointmentTime.isBefore(currentTime)) {
            return sendError(req, res, { message: "You cannot approve an appointment that is already in the past." }, 400);
        }

        const updatedAppointment = await appointment.findByIdAndUpdate(id, { status: 1 }, { new: true });
        return sendSuccess(req, res, { message: "Appointment approved successfully.", updatedAppointment });

    } catch (error) {
        console.error('Error approving appointment:', error);
        return sendError(req, res, {
            message: "Error occurred while approving appointment.",
            error: error.message
        }, 500);
    }
};

exports.rejectAppointment = async (req, res, next) => {
    try {
        const id = req.body.id || req.query.id || req.params.id;

        const existingAppointment = await appointment.findById(id);
        if (!existingAppointment) {
            return sendError(req, res, { message: "Appointment not found." }, 404);
        }

        const currentTime = moment();
        const appointmentTime = moment(existingAppointment.appointmentDate);

        if (appointmentTime.diff(currentTime, 'hours') < 24) {
            return sendError(req, res, { message: "You can only reject appointments at least 24 hours before the scheduled time." }, 400);
        }

        if (appointmentTime.isBefore(currentTime)) {
            return sendError(req, res, { message: "You cannot reject an appointment that is already in the past." }, 400);
        }

        const updatedAppointment = await appointment.findByIdAndUpdate(id, { status: 2 }, { new: true });
        return sendSuccess(req, res, { message: "Appointment rejected successfully.", updatedAppointment });

    } catch (error) {
        console.error('Error rejecting appointment:', error);
        return sendError(req, res, {
            message: "Error occurred while rejecting appointment.",
            error: error.message
        }, 500);
    }
};

// For Patient Appointment List with Filter
exports.getAppointmentForPatient = async (req, res, next) => {
    try {
        const { day, time, status } = req.query;

        const decoded = await verifyToken(req, res);
        if (!decoded) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        let filter = { patientId: decoded.patientId };

        let today = moment().startOf('day').format('YYYY-MM-DD');
        let tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');
        let beforeToday = { $lt: today };
        let underWeek = { $gte: today, $lt: moment().add(7, 'days').startOf('day').format('YYYY-MM-DD') };
        let thisMonth = { $gte: moment().startOf('month').toDate(), $lt: moment().add(1, 'month').startOf('month').format('YYYY-MM-DD') };

        if (day === 'today') {
            filter.appointmentDate = today;
        } else if (day === 'tomorrow') {
            filter.appointmentDate = tomorrow;
        } else if (day === 'before') {
            filter.appointmentDate = beforeToday;
        } else if (day === 'under_week') {
            filter.appointmentDate = underWeek;
        } else if (day === 'month') {
            filter.appointmentDate = thisMonth;
        }

        if (time) {
            const [hours, minutes] = time.split(':');
            const isPM = time.includes('PM');
            let appointmentTime = new Date();
            appointmentTime.setHours(isPM ? parseInt(hours) + 12 : parseInt(hours));
            appointmentTime.setMinutes(parseInt(minutes));

            filter.appointmentTime = { $regex: new RegExp(`^${appointmentTime.getHours()}:${appointmentTime.getMinutes().toString().padStart(2, '0')} (AM|PM)$`) };
        }

        if (status) {
            if (status === 'pending') {
                filter.status = 0;
            } else if (status === 'approved') {
                filter.status = 1;
            } else if (status === 'rejected') {
                filter.status = 2;
            }
        }

        const allAppointments = await appointment.find(filter).populate('doctorId', 'fullName');

        if (!allAppointments.length) {
            return sendError(req, res, { message: "No appointments found." }, 404);
        }

        return sendSuccess(req, res, { message: "All Appointments", allAppointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return sendError(req, res, { message: "Error fetching appointments.", error: error.message }, 500);
    }
};