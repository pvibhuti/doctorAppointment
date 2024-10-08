const { default: mongoose } = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({
    fullName: {
        type: String,
        require:true
    },
    email: {
        type: String,
        require:true
    },
    phone: {
        type: Number,
        require:true
    },
    password: {
        type: String,
        minlength: 8,
        require:true
    },
    gender: {
        type: String,
        require:true
    },
    address: {
        type: String,
        require:true
    },
    profilePhoto: {
        type: String,
    },
    secret: {
        type: String,
    },
    authStatus: {
        type: Number,
        default: 0,
    },
    status: {
        type: Number,
        default: 0
    },
    role:{
        type:String,
        default:"patient"
    },
    otp: {
        type: Number
    },
    age:{
        type:Number
    }
}, {
    timestamps: true
});

const patient = mongoose.model("Patient", patientSchema);
module.exports = patient;
