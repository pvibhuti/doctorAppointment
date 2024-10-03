const Validator = require("validatorjs");
const validator = require("../../validate.js");
const commonfun = require("../../Utils/CommonUtils.js");

async function validatePatientInput(req, res, next) {

    let rules = {
        fullName: "required|string|min:3|max:15|regex:/^[A-Za-z ]+$/",
        email: ["required", "emailExisting","emailExist","email", "regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/"],
        phone: ["required", "uniqueNumber","uniqueNo","regex:/^[0-9]{10}$/"],
        password: ["required", "string", "min:8", "max:15"],
        gender: "required|string|min:3|max:15|regex:/^[A-Za-z]+$/|in:MALE,Male,male,female,Female,.other,Other,OTHER",
        address: ["required", "string", "min:3", "max:35", "regex:/^[a-zA-Z0-9 ,.#/:()-]+$/"],
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
module.exports = { validatePatientInput };