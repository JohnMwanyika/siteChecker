require('dotenv').config();
const axios = require("axios");

const recipients = [
  '+254707438654',
  '+254773946048'
]
// sending sms to a single user
// sendSms("Message from API", '+254773946048')
//   .then(data => console.log(data))
//   .catch(error => console.log(error))

// sending sms to multiple recipient
// sendBulkSms("Message from API", ...recipients)
//   .then(data => console.log(data))
//   .catch(error => console.log(error))

async function sendSms(message, phone) {

  var data = JSON.stringify({
    response_type: "json",
    sender_name: "23107",
    service_id: 0,
    message: message,
    mobile: phone,
  });

  let config = {
    method: "post",
    url: "https://api.mobitechtechnologies.com/sms/sendsms",
    data: data,
    headers: {
      h_api_key: process.env.SMS_API_KEY,
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios(config);
    const response = res.data[0]
    // console.log(JSON.stringify(response.data));
    if (response.status_desc == "Success") {
      return { status: 'success', data: 'Message delivered' }
    } else {
      return { status: 'error', data: response.status_desc }
    }
  } catch (error) {
    console.log(error)
    return { status: 'error', data: error.message }
  }
};

async function sendBulkSms(message, ...recipients) {
  try {
    console.log(recipients)

    return recipients.forEach(async (number) => {
      const response = await sendSms(message, number);
      console.log(response)
    })

  } catch (error) {
    console.log(error)
    return { status: 'error', data: 'Oops an error occured while sending sms notification to the recipients' + error.message };
  }
}

module.exports = { sendSms };