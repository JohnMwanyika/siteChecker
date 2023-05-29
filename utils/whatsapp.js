const whatsAppClient = require('@green-api/whatsapp-api-client');
require('dotenv').config();

const restAPI = whatsAppClient.restAPI(({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
}))

module.exports = {
    whatsappText: async (phone, message) => {

        return await restAPI.message.sendMessage(`254${phone}@c.us`, null, message)

    }
}

// restAPI.message.sendMessage("254707438654@c.us", null, "hello Mwanyika comming from API")
//     .then((data) => {
//         console.log(data);
//     });