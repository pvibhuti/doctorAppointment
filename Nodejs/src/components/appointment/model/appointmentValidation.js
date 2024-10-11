const Validator = require("validatorjs");
const validator = require("../../validate.js");
const commonfun = require("../../Utils/CommonUtils.js");

async function validateAppointmentInput(req, res, next) {

  let rules = {
    doctorId: ["required"],
    appointmentDate: ["required", "date","regex:/^[0-9]{4}-[0-9]{2}-[0-9]{2}$"],
    appointmentTime: ["required","regex:/^[0-9]{2}:[0-9]{2}$"],
    disease:["required","min:5","max:35","regex:/^[A-Za-z ]+$/"]
  };

  await validator(req.body, rules, async (errors, status) => {
    if (!status) {
      console.log("Error :", errors);
      return commonfun.sendError(req, res, errors)
      return "ERROR";
    } else {
      next();
    }
  });

}
module.exports = { validateAppointmentInput };