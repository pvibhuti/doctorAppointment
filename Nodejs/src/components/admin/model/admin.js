const { default: mongoose } = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    firstName: {
        type: String,
    },
    LastName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        minlength: 8,
    },
    status:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const admin = mongoose.model("Admin", adminSchema);
module.exports = admin;
