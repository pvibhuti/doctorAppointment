const { default: mongoose } = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    apointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    message: {
        type: String
    },
    status:{
        type: Number,
        default:0
    },
}, {
    timestamps: true
});

const notification = mongoose.model("Notification", notificationSchema);
module.exports = notification;