require('dotenv').config();
const axios = require("axios");
module.exports = async function sendSms(phone, message) {
  
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

  await axios(config).then((res) => {
    console.log(JSON.stringify(res.data));
  }).catch((err)=>{
    console.log(err)
  })
};

// sendSms(+254793712929,"Message from API");