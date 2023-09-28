const express = require('express');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // Port for HTTPS
const idenfyurl = 'https://ivs.idenfy.com/api/v2/token';

const options = {
  key: fs.readFileSync('../ssl/private-key.key'), // Replace with your private key file
  cert: fs.readFileSync('../ssl/certificate.crt'), // Replace with your public certificate file
};

app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));
// Recieve request to get token
app.post('/api/submit', (req, res) => {
  console.log(req.body);
  // Update the variable based on the request body
  const newValue = req.body.user;
    // Data to be sent in the request body
  const postData = {
    //"dummyStatus":"APPROVED",
    "clientId":newValue,
    "documents":["ID_CARD","DRIVER_LICENSE"],
  };
  // API key and API secret
  const apiKey = 'tfbKho85rgC';
  const apiSecret = '9M4bg79y9PcqXloeo31E';

  // Encode API key and API secret in Base64
  const base64Credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  axios.post(idenfyurl, postData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${base64Credentials}`
    }
  })
    .then(response => {console.log('Success:', response.data);
    res.status(200).json({ token: response.data.authToken});
  })
    .catch(error => {console.error('Error:', error);
  });

});



const server = https.createServer(options, app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});


