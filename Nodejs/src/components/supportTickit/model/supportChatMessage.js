const { default: mongoose } = require('mongoose');
const { Schema } = require('mongoose');

const supportChatSchema = new Schema({
    applyTicketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApplyTicket',
        require: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    type: {
        type: Number,
        default: 0,
    },
    message: {
        type: String,
        require: true
    },
    status: {
        type: Number,
        default: 0
    },
    image: {
        type: [String]
    },
    deletedBy: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
})

const supportChatMessage = mongoose.model('SupportChatMessage', supportChatSchema);
module.exports = supportChatMessage;