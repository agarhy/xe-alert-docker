'use strict';
require('dotenv').config();

const express = require('express');
const puppeteer = require('puppeteer-core');
const {accountSid,authToken,twilioNumber,sendToNumber,autoRun,currency_from,currency_to,currency_amount}= require('./config')


const client = require('twilio')(accountSid, authToken);
const PORT = 3000;
const HOST = '0.0.0.0';


// App
const app = express();
let appServer

async function sendMsg(msg) {
    
    return await client.messages
    .create({
        body: msg,
        from: twilioNumber,
        to: `+${sendToNumber}`
    })
    .then(message =>(message))
    .catch(err =>{
        //console.log(err)
        return err
    })

}

async function scrap(from='eur',to='usd',amount=1) {
  // Launch the browser
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true,
    ignoreHTTPSErrors: true
  });
  
  // Create an instance of the page
  const page = await browser.newPage();
  // Go to the web page that we want to scrap
  console.log('go to page: ',`https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`)
  await page.goto(`https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`);

  // Here we can select elements from the web page
  const data = await page.evaluate(() => {
    const equal = document.querySelector(
      "#currencyConverter .converterresult-conversionTo .converterresult-toAmount"
    ).innerText;
    const fromCurrency = document.querySelector(
        "#currencyConverter .converterresult-conversionFrom > span:nth-child(2)"
    ).innerText;
    const toCurrency = document.querySelector(
        "#currencyConverter .converterresult-conversionTo .converterresult-toCurrency"
    ).innerText;
    // This object will be stored in the data variable
    console.log(equal,fromCurrency,toCurrency)
    return {
        equal,
        fromCurrency,
        toCurrency,
    };
  });

  
  // Here we can do anything with this data

  // We close the browser
  await browser.close();
  return data
}

//App Route
app.get('/alert/:from/:to/:amount', async(req, res) => {
  console.log(req.params)
  let result=await scrap(req.params.from,req.params.to,req.params.amount);
  let alertMsg=`XE Currency Alert: ${req.params.amount} ${req.params.from}/${req.params.to} = ${result.equal}`
  sendMsg(alertMsg);
  res.send(result);
  appServer.close();
  return 0;
});

const run = async()=>{
  console.log('run')
  let result=await scrap(currency_from,currency_to,currency_amount);
  let alertMsg=`XE Currency Alert: ${currency_amount} ${currency_from}/${currency_to} = ${result.equal}`
  sendMsg(alertMsg);
  console.log("message sent : ",alertMsg," - to number: ",sendToNumber)  
  return 0;
}
console.log("autoRun:",autoRun)
if(autoRun=='true' || autoRun==true ){
  console.log('atuo run')
  run()
}else{
  appServer= app.listen(PORT, HOST);
  console.log(`Running on http://${HOST}:${PORT}`);
}