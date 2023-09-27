const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 443; // Port for HTTPS

const options = {
  key: fs.readFileSync('ssl/server.key'), // Replace with your private key file
  cert: fs.readFileSync('ssl/certificate.crt'), // Replace with your public certificate file
};

// Serve static files from the 'public' directory
app.use(express.static('public'));

const server = https.createServer(options, app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});


