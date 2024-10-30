import socket from '../constants/socket';

const registerSocket = (ticketId, userId, setMessageReceived) => {
    socket.on("message_deleted", ({ messageId }) => {
        setMessageReceived((prevMessages) =>
            prevMessages.filter((message) => message._id !== messageId)
        );
    });

    socket.on("message_deleted_for_everyone", ({ messageId }) => {
        setMessageReceived((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== messageId)
        );
    });
};

const removeSocket = () => {
    socket.off("message_deleted");
    socket.off("message_deleted_for_everyone");
};

export { registerSocket, removeSocket };