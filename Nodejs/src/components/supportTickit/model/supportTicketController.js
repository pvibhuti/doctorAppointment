const doctor = require("../../doctor/model/doctor");
const patient = require("../../patient/model/patient");
const { sendError, sendSuccess } = require("../../Utils/CommonUtils");
const supportTicket = require("./supportTicket");
const applyTicket = require("./applyTicket.js");
const { fileFilterConfig, storageConfig } = require("../../Utils/CommonUtils.js");
const multer = require("multer");
const supportChatMessage = require("./supportChatMessage.js");
const { default: mongoose } = require('mongoose');

const createSupportTicket = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: user.doctorId });

        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.role !== 'mainDoctor') {
            return sendError(req, res, { message: "Only Admin can create Support Ticket." });
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account not Activate, please login first."
            });
        }

        const { subject, description } = req.body;
        const newsupportTicket = await supportTicket.create({
            subject, description
        });

        if (!newsupportTicket) {
            return sendError(req, res, { message: "Error in Creating Support Tikcet, please try Again." })
        }

        return sendSuccess(req, res, { message: "Support Ticket Created Successfully." })

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An error occurred during create Support Ticket.",
            error: error.message,
        }, 500);
    }
}

const getSupportTickets = async (req, res, next) => {
    try {
        const supportTickets = await supportTicket.find({ status: 0 });
        if (!supportTickets) {
            return sendError(req, res, { message: "Error in fatching Support Tikcet, please try Again." })
        }

        return sendSuccess(req, res, { message: "All Support Ticket Here.", supportTickets })

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An error occurred during fatching Support Ticket.",
            error: error.message,
        }, 500);
    }
}

const applyTickets = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingPatient = await patient.findOne({ _id: user.patientId });
        if (!existingPatient) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        const { suppotTicketId, message, attachment } = req.body;

        const oneSupportTicket = await supportTicket.findOne({ _id: suppotTicketId });
        if (!oneSupportTicket) {
            return sendError(req, res, { message: "Invalid support ticket or Ticket not found." }, 404);
        }

        const newApplyTicket = await applyTicket.create({
            suppotTicketId,
            userId: existingPatient._id,
            message,
            attachment
        });

        if (!newApplyTicket) {
            return sendError(req, res, { message: "Error in applying ticket, please try again." });
        }

        return sendSuccess(req, res, { message: "Ticket Successfully Applied." });

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const uploadMultipleImage = async (req, res, next) => {

    const image_ = multer({
        storage: storageConfig,
        fileFilter: fileFilterConfig
    }).array("images");

    image_(req, res, async (err) => {

        if (err) return sendError(req, res, { message: "IMAGE_NOT_UPLOADED" }, 400)

        if (!req.files || req.files.length === 0) return sendError(req, res, { message: "IMAGE_NOT_FOUND" }, 400)

        const image_name = req.files;

        var arr = [];

        image_name.map((element) => {
            arr.push(element.filename);
        })
        return sendSuccess(req, res, arr);
    }
    );
}

const getApplyTickets = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: user.doctorId });

        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.role !== 'mainDoctor') {
            return sendError(req, res, { message: "Only Admin can get all apply Ticket." });
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account not Activate, please login first."
            });
        }

        const allTickets = await applyTicket.find().populate('userId', 'fullName');
        return sendSuccess(req, res, { message: "All Apply Ticket Here.", allTickets })

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const getSelectedApplyTicket = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: user.doctorId });

        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.role !== 'mainDoctor') {
            return sendError(req, res, { message: "Only Admin can get all apply Ticket." });
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account not Activated, please login first."
            });
        }

        const id = req.params.id || req.query.id;

        const selectedTickets = await applyTicket
            .findOne({ _id: id })
            .populate('userId', 'fullName email phone')
            .populate({
                path: 'suppotTicketId',
                select: 'subject description adminId'
            });

        console.log("Selected Ticket:", selectedTickets);

        return sendSuccess(req, res, {
            message: "Selected Apply Ticket found.",
            selectedTickets
        });

    } catch (error) {
        console.error('Error:', error);
        return sendError(req, res, {
            message: "Server Error.",
            error: error.message,
        }, 500);
    }
};

//Patient Apply Support ticket Data 
const getPatientTicket = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingPatient = await patient.findOne({ _id: user.patientId });

        if (!existingPatient) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingPatient.status === 1) {
            return sendError(req, res, {
                message: "Account not Activate, please login first."
            });
        }

        const selectedTicket = await applyTicket.find({ userId: existingPatient._id }).populate('userId', 'fullName').populate('suppotTicketId', 'subject description adminId');
        console.log("selected Ticket", selectedTicket);

        return sendSuccess(req, res, { message: "selected Apply Ticket Here.", selectedTicket });

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const approveTickets = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: user.doctorId });

        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.role !== 'mainDoctor') {
            return sendError(req, res, { message: "Only Admin can aaprove Ticket." });
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account not Activate, please login first."
            });
        }
        const { id, reason } = req.body;
        if (!id || !reason) {
            return sendError(req, res, {
                message: "Apply ticket Id and reason required."
            });
        }

        const existApply = await applyTicket.findOne({ _id: id });
        if (!existApply) {
            return sendError(req, res, {
                message: "Invalid id or Apply Tikcet not found."
            });
        }

        const approve = await applyTicket.findByIdAndUpdate(existApply._id, { reason, status: 1, chatStatus: 2 }, { new: true });

        return sendSuccess(req, res, { message: "Ticket Approved Successfully.", approve });

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const rejectTickets = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const existingDoctor = await doctor.findOne({ _id: user.doctorId });

        if (!existingDoctor) {
            return sendError(req, res, { message: "Invalid token or User not found." }, 404);
        }

        if (existingDoctor.role !== 'mainDoctor') {
            return sendError(req, res, { message: "Only Admin can aaprove Ticket." });
        }

        if (existingDoctor.status === 1) {
            return sendError(req, res, {
                message: "Account not Activate, please login first."
            });
        }

        const { id, reason } = req.body;
        if (!id || !reason) {
            return sendError(req, res, {
                message: "Apply ticket Id and reason required."
            });
        }

        const existApply = await applyTicket.findOne({ _id: id });
        if (!existApply) {
            return sendError(req, res, {
                message: "Invalid id or Apply Tikcet not found."
            });
        }

        const rejected = await applyTicket.findByIdAndUpdate(existApply._id, { reason, status: 2, chatStatus: 2 }, { new: true });

        return sendSuccess(req, res, { message: "Ticket Reject Successfully.", rejected });

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const getMessagesByTicket = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }
        const _id = user.doctorId || user.patientId;

        const { id } = req.query || req.params;

        if (!id) {
            return sendError(req, res, { message: "Ticket ID is required." });
        }

        const messages = await supportChatMessage.find({
            applyTicketId: id,
            deletedBy: { $ne: _id },
            status: 0
        });

        return sendSuccess(req, res, { message: "All messages here.", messages });
    } catch (error) {
        console.error('Error:', error);
        return sendError(req, res, {
            message: "Server Error.",
            error: error.message,
        }, 500);
    }
};

const deleteMessages = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return sendError(req, res, { message: "Token is invalid." }, 403);
        }

        const { id } = req.body || req.query || req.params;

        if (!id) {
            return sendError(req, res, { message: "Message ID(s) required." });
        }

        const _id = user.doctorId || user.patientId;
        if (!_id) {
            return sendError(req, res, { message: "Invalid user." }, 403);
        }

        const messageIds = Array.isArray(id) ? id : [id];

        const messages = await supportChatMessage.find({ _id: { $in: messageIds } });
        if (messages.length === 0) {
            return sendError(req, res, { message: "No messages found for the provided id(s)." }, 404);
        }

        await supportChatMessage.updateMany(
            { _id: { $in: messageIds } },
            { $addToSet: { deletedBy: _id } }
        );

        return sendSuccess(req, res, { message: "Message(s) deleted successfully." });
    } catch (error) {
        console.error('Error:', error);
        return sendError(req, res, {
            message: "A server error occurred.",
            error: error.message,
        }, 500);
    }
};

const deleteforEveryOne = async (req, res, next) => {
    try {

        const { id } = req.query || req.params;

        if (!id) {
            return sendError(req, res, { message: "Message ID is required." });
        }

        const messageData = await supportChatMessage.findOne({ _id: id });
        if (!messageData) {
            return sendError(req, res, { message: "Message data not found." }, 404);
        }

        const updatedMessage = await supportChatMessage.findByIdAndUpdate(
            id,
            { status: 1 },
            { new: true }
        );
        console.log("update message ", updatedMessage);


        return sendSuccess(req, res, { message: "Message Delete for Every one Successfully." });

    } catch (error) {
        console.error('Error :', error);
        return sendError(req, res, {
            message: "An Server Error.",
            error: error.message,
        }, 500);
    }
}

const editMessage = async (req, res, next) => {
    try {
        const { id, text } = req.query || req.params;

        if (!id || !text) {
            return sendError(req, res, { message: "Message ID and new text are required." });
        }

        const updatedMessage = await supportChatMessage.findByIdAndUpdate(
            id,
            { message: text },
            { new: true }
        );

        return sendSuccess(req, res, { message: "Message updated successfully.", data: updatedMessage });
    } catch (error) {
        console.error('Error:', error);
        return sendError(req, res, {
            message: "An error occurred while editing the message.",
            error: error.message,
        }, 500);
    }
};

module.exports = {
    createSupportTicket,
    getSupportTickets,
    applyTickets,
    getApplyTickets,
    approveTickets,
    rejectTickets,
    uploadMultipleImage,
    getSelectedApplyTicket,
    getPatientTicket,
    getMessagesByTicket,
    deleteforEveryOne,
    editMessage,
    deleteMessages
}