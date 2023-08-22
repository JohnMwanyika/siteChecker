const socket = require('../app');


// simplified way to emmit events
function emitEvent(event, message) {
    socket.ioObject.emit(event, message);
};


function emitToUser(event, message, userId) {
    try {
        emitToUser(`${event}_${userId}`, message)
    } catch (error) {
        console.log('Error occured while emiting event', error)
    }
}

module.exports = { emitEvent, emitToUser };