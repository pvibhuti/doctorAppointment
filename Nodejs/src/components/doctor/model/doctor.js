const { default: mongoose } = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
    fullName: {
        type: String,
        require:true
    },
    email: {
        type: String,
        require:true,
        lowercase:true
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
    shiftStartTime: {
        type: String,
    },
    shiftEndTime: {
        type: String,
    },
    profilePhoto: {
        type: String,
    },
    degreeCertificate: {
        type: [String],
    },
    expertise: {
        type: String
    },
    designation: {
        type: String
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
    role: {
        type: String,
        default: "doctor"
    },
    otp: {
        type: Number
    }
}, {
    timestamps: true
});

const doctor = mongoose.model("Doctor", doctorSchema);
module.exports = doctor;
