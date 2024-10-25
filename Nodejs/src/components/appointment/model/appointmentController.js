const { sendSuccess, sendError, sendAppointmentEmail } = require("../../Utils/CommonUtils.js");
const appointment = require("./appointment.js");
const moment = require('moment');
const doctor = require("../../doctor/model/doctor.js");
const patient = require("../../patient/model/patient.js");
const notification = require("../../notification/model/notification.js");
// const { io } = require('../../../index.js');

const bookAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

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
        if (!doctorData.shiftStartTime && !doctorData.shiftEndTime) {
            return sendError(req, res, { message: "doctor on leave. Doctor please select another doctor." }, 404);
        }

        const appointmentTimeMoment = moment(appointmentTime, 'HH:mm');

        if ((appointmentTime < doctorData.shiftStartTime) || (appointmentTime > doctorData.shiftEndTime)) {
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

        const patientData = await patient.findById(user.patientId);
        if (!patientData) {
            return sendError(req, res, { message: "Patient not found." }, 404);
        }

        const newAppointment = await appointment.create({
            doctorId,
            patientId: user.patientId,
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
const getAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }
        const { day, time, status } = req.query;

        let filter = { doctorId: user.doctorId };
        const today = moment().format("YYYY-MM-DD");
        console.log("today", today);

        const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");
        console.log("tomorrow", tomorrow);

        let beforeToday = moment().subtract(1, 'days').format("YYYY-MM-DD");
        console.log("before", beforeToday);

        // let beforeToday = { $lt: today };
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

const deleteAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
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

const editAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
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

const allcountAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const totalAppointments = await appointment.countDocuments({ doctorId: user.doctorId });

        const today = moment().format("YYYY-MM-DD");
        const todayAppointments = await appointment.countDocuments({ doctorId: user.doctorId, appointmentDate: today });

        const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");
        const tomorrowAppointments = await appointment.countDocuments({ doctorId: user.doctorId, appointmentDate: tomorrow });

        return sendSuccess(req, res, {
            message: "Total appointments fetched successfully.",
            totalAppointments,
            todayAppointments,
            tomorrowAppointments
        });

    } catch (error) {
        console.error('Error fetching All Count appointments:', error);
        return sendError(req, res, {
            message: "Error fetching total appointments.",
            error: error.message
        }, 500);
    }
}

const upcomingAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const today = moment().startOf('day').format('YYYY-MM-DD')

        const upcomingAppointments = await appointment.find({
            doctorId: user.doctorId,
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

const approveAppointment = async (req, res, next) => {
    try {
        const id = req.body.id || req.query.id || req.params.id;
        const io = req.app.get('socketio');

        if (!id) {
            return sendError(req, res, { message: "Appointment ID is required." }, 400);
        }

        const existingAppointment = await appointment.findById(id).populate('doctorId', 'fullName');

        if (!existingAppointment) {
            return sendError(req, res, { message: "Appointment not found." }, 404);
        }

        const patientId = existingAppointment.patientId;
        const currentTime = moment();
        const appointmentTime = moment(existingAppointment.appointmentDate);

        console.log('Doctor info:', existingAppointment.doctorId);

        if (appointmentTime.diff(currentTime, 'hours') < 24) {
            return sendError(req, res, { message: "You can only approve appointments at least 24 hours before the scheduled time." }, 400);
        }

        if (appointmentTime.isBefore(currentTime)) {
            return sendError(req, res, { message: "You cannot approve an appointment that is already in the past." }, 400);
        }

        const msg = `Your appointment has been approved by Dr. ${existingAppointment.doctorId.fullName}`;
        io.to(patientId.toString()).emit('appointmentNotification', { status: 1, message: msg });

        await notification.create({
            patientId: existingAppointment.patientId,
            doctorId: existingAppointment.doctorId,
            appointmentId: existingAppointment._id,
            message: msg
        });

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

const rejectAppointment = async (req, res, next) => {
    try {
        const id = req.body.id || req.query.id || req.params.id;

        const io = req.app.get('socketio');

        const existingAppointment = await appointment.findById(id).populate('doctorId', 'fullName');
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

        const msg = `Your appointment has been rejected by Dr. ${existingAppointment.doctorId.fullName}`;
        io.to(existingAppointment.patientId.toString()).emit('appointmentNotification', { status: 2, message: msg });

        await notification.create({
            patientId: existingAppointment.patientId,
            doctorId: existingAppointment.doctorId,
            appointmentId: existingAppointment._id,
            message: msg
        });

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
const getAppointmentForPatient = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const { day, time, status } = req.query;
        let filter = { patientId: user.patientId };

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

const remainAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }

        const today = moment().startOf('day').format('YYYY-MM-DD')

        const upcomingAppointments = await appointment.find({
            patientId: user.patientId,
            appointmentDate: { $gt: today }
        }).populate('doctorId', 'fullName');

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

module.exports = { remainAppointment, bookAppointment, upcomingAppointment, getAppointment, deleteAppointment, editAppointment, allcountAppointment, approveAppointment, getAppointmentForPatient, rejectAppointment }