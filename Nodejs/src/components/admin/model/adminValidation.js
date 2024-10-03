const Validator = require("validatorjs");
const validator = require("../../validate.js");
const commonfun = require("../../Utils/CommonUtils.js");

async function validateadminInput(req, res, next) {

  let rules = {
    firstName: "required|string|min:3|max:15|regex:/^[A-Za-z]+$/",
    lastName: "required|string|min:3|max:15|regex:/^[A-Za-z]+$/",
    email: ["required","emailAvailable","email","regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/"],
    password: ["required","string","min:8","max:15"],
  };

  console.log("Rules:", rules);

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
module.exports = { validateadminInput };