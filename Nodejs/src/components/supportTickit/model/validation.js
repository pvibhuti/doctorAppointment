const Validator = require("validatorjs");
const validator = require("../../validate.js");
const commonfun = require("../../Utils/CommonUtils.js");

async function validateSupportTicket(req, res, next) {
    let rules = {
        subject: "required|string|min:3|max:35|regex:/^[A-Za-z ]+$/",
        description: ["required","string","min:5","max:100","regex:/^[a-zA-Z0-9.-:,' ]+$/"],
    };
    console.log("Rules:", rules);

    await validator(req.body, rules, async (errors, status) => {
        if (!status) {
            // console.log("Error :", errors);
            return commonfun.sendError(req, res, errors)
            return "ERROR";
        } else {
            next();
        }
    });
}

async function validateApplyTicket(req, res, next) {
    let rules = {
        suppotTicketId: ["required","string"],
        userId: ["string"],
        message: "required|string|min:3|max:15|regex:/^[A-Za-z ]+$/",
    };
    console.log("Rules:", rules);

    await validator(req.body, rules, async (errors, status) => {
        if (!status) {
            // console.log("Error :", errors);
            return commonfun.sendError(req, res, errors)
            return "ERROR";
        } else {
            next();
        }
    });
}

async function validateSupportChat(req, res, next) {
    let rules = {
        applyTicketId: ["required","string"],
        senderId: ["required","string"],
        receiverId: ["required","string"],
        message: "required|string|min:3|max:15|regex:/^[A-Za-z ]+$/",
        type: "required|regex:/^[0-9]{1}$/",
    };
    console.log("Rules:", rules);

    await validator(req.body, rules, async (errors, status) => {
        if (!status) {
            // console.log("Error :", errors);
            return commonfun.sendError(req, res, errors)
            return "ERROR";
        } else {
            next();
        }
    });

}

module.exports = {validateSupportChat, validateSupportTicket, validateApplyTicket };