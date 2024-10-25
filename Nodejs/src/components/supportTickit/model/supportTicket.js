const {default : mongoose} = require('mongoose');
const {Schema} = mongoose;

const supportTicketSchema = new Schema({
    subject:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    status:{
        type:Number,
        default:0
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
        require:true
    }
},{
    timestamps:true
})

const supportTicket = mongoose.model("SupportTicket", supportTicketSchema);
module.exports = supportTicket; 