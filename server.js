require('dotenv').config(); // Load environment variables from .env
const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = 'ACa3bd7fa7f3cc8d02fa77803be95607ad';
const authToken = '854ff1e1bde93c33b149ec404f470537';
const client = new twilio(accountSid, authToken);

const twilioNumber = '+12515511081';
const toNumber = '+918109543070'; // Fixed number for outgoing calls
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/makeCall', (req, res) => {
  client.calls.create({
    to: toNumber,
    from: twilioNumber,
    twiml: `<Response>
             <Play>https://sa-5550.twil.io/audio.mp3</Play>
             <Gather action="/handleGather" method="POST">
             </Gather>
             <Say> not give any response </Say>
           </Response>`,
  })
  .then(call => res.send(`Call initiated: ${call.sid}`))
  .catch(err => res.status(500).send(err.message));
});

app.post('/handleGather', (req, res) => {
  const { Digits, From } = req.body;
  const interviewLink = 'https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test';

  if (Digits === '1') {
    // Send the text message
    client.messages.create({
      body: `Thank you for your interest. Here is your interview link: ${interviewLink}`,
      from: twilioNumber,
      to: From
    })
    .then(() => {
      res.send(`<Response>
                 <Say>Thank you for your interest. Here is your interview link: ${interviewLink}</Say>
               </Response>`);
    })
    .catch(err => res.status(500).send(err.message));
  } else {
    res.send(`<Response>
               <Say>Invalid option. Please try again.</Say>
               <Redirect>/</Redirect>
             </Response>`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
