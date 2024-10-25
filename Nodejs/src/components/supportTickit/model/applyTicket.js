const {default:mongoose} = require('mongoose');
const {Schema} = mongoose;

const applyTicketSchema = new Schema({
    suppotTicketId : {
        type: mongoose.Schema.Types.ObjectId,
        ref :'SupportTicket',
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient',
        require:true
    },
    message:{
        type:String,
        require:true
    },
    attachment:{
        type:[String]
    },
    status:{
        type:Number,
        default:0
    },
    chatStatus:{
        type:Number,
        default:1
    },
    reason:{
        type:String
    }
},{
    timestamps:true
})

const applyTicket = mongoose.model('ApplyTicket', applyTicketSchema);
module.exports = applyTicket;