const express = require("express");
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const cors = require('cors');
const supportChatMessage = require("../supportTickit/model/supportChatMessage");
const { NewFactorInstance } = require("twilio/lib/rest/verify/v2/service/entity/newFactor");

const createServer = (app) => {

    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        },
    });

    io.on('connection', (socket) => {

        socket.on("send_message", async (messageData) => {
            try {

                if (messageData.messageData.message) {
                    const textMessage = new supportChatMessage({
                        message: messageData.messageData.message,
                        senderId: messageData.messageData.senderId,
                        receiverId: messageData.messageData.receiverId,
                        applyTicketId: messageData.messageData.applyTicketId,
                        type: messageData.messageData.type,
                        image: null,
                    });

                    await textMessage.save();
                    socket.broadcast.emit("receive_message", { message: textMessage });
                }

                if (messageData.messageData.image) {
                    const imageMessage = new supportChatMessage({
                        message: null,
                        senderId: messageData.messageData.senderId,
                        receiverId: messageData.messageData.receiverId,
                        applyTicketId: messageData.messageData.applyTicketId,
                        type: messageData.messageData.type,
                        image: messageData.messageData.image,
                    });

                    await imageMessage.save();
                    socket.broadcast.emit("receive_message", { message: imageMessage });
                    // socket.emit("receive_message", { message: `User ${socket.id}:  ${messageData.messageData.image}` });
                }
            } catch (error) {
                console.error("Error saving message to DB:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });

    });

    return { server, io }
}



module.exports = createServer; 