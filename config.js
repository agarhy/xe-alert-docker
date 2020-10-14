require('dotenv').config();

const fs = require('fs');
const iron_worker = require('iron_worker');
console.log(iron_worker.params());
console.log(iron_worker.config());
console.log(iron_worker.taskId());

let platform=null
let config={}
if(iron_worker.taskId()){
    platform='ironworker'
}else{
    platform='fargate'
}
console.log('Running on:',platform)
if(platform=='ironworker'){
    const config_file= process.env.PAYLOAD_FILE
    console.log('config_file',config_file)
    config = JSON.parse(fs.readFileSync(config_file, 'utf8'))
}else{
    config={
        twilio_sid:process.env.twilio_sid,
        twilio_token:process.env.twilio_token,
        twilio_number:process.env.twilio_number,
        send_to_number:process.env.send_to_number,
        autoRun:process.env.autoRun,
        currency_from:process.env.currency_from,
        currency_to:process.env.currency_to,
        currency_amount:process.env.currency_amount      
    }
}

console.log('config_content',config)
const accountSid = config.twilio_sid
const authToken = config.twilio_token
const twilioNumber= config.twilio_number
const sendToNumber=config.send_to_number
const autoRun=(eval(config.autoRun))?1:0
const currency_from=(config.currency_from || 'EUR')
const currency_to=(config.currency_to || 'USD')
const currency_amount=(config.currency_amount||1)

module.exports={
    accountSid:accountSid,
    authToken:authToken,
    twilioNumber:twilioNumber,
    sendToNumber:sendToNumber,
    autoRun:autoRun,
    currency_from:currency_from,
    currency_to:currency_to,
    currency_amount:currency_amount,
}