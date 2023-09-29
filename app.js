const express = require('express');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const path = require('path');

function get_value(file) {
  const filePath = path.join(__dirname, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    return null; // Or handle the error in another way based on your needs
  }
}
function save_pending(array, file){
  const filePath = path.join(__dirname, file);
  const arrayAsString = JSON.stringify(array, null, 2);
    fs.writeFile(filePath, arrayAsString, 'utf8', (err) => {
      if (err) {
          console.error(`Error writing file: ${err}`);
          return;
      }
      console.log('Array written to file successfully.');
    });
}

const API_SECRET = get_value("API_SECRET.txt");


const WEBHOOK_PORT = 3000; // Port for HTTPS


let pending_verifications = JSON.parse(get_value("PENDING_VERIFS.txt"));

app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

function isSignatureValid(data) {
  const { signature, secret } = data;
  let { payload } = data;

  if (data.payload.constructor === Object) {
    payload = JSON.stringify(data.payload);
  }
  if (payload.constructor !== Buffer) {
    payload = new Buffer.from(payload, "utf8");
  }
  const hash = crypto.createHmac("sha256", secret);
  hash.update(payload);
  const digest = hash.digest("hex");
  return digest === signature.toLowerCase();
}
app.get("/api/pending/:address", (req, res) => {
  const address = req.params.address;
  console.log(address);
  const pending = pending_verifications.includes(address);
  res.json({ pending: pending });
});
app.post("/api/veriff/decisions/", (req, res) => {
  const signature = req.get("x-hmac-signature");
  const secret = API_SECRET;
  const payload = req.body;

  console.log("Received a decisions webhook");
  const isValid = isSignatureValid({ signature, secret, payload });
  console.log("Validated signature:", isValid);
  console.log("Payload", JSON.stringify(payload, null, 4));
  res.json({ status: "success" });
  let find_address = pending_verifications.indexOf(payload.verification.vendorData);
  if (find_address != -1 && isValid){
    pending_verifications.splice(find_address, 1);
    save_pending(pending_verifications, "PENDING_VERIFS.txt");
    console.log("spliced address ", pending_verifications);
  } else {
    console.log("error finding address in pending verifications");
  }
  if (payload.verification.status == "approved" && isValid) {
    console.log("test");
  }
});

app.post("/api/veriff/events/", (req, res) => {
  const signature = req.get("x-hmac-signature");
  const secret = API_SECRET;
  const payload = req.body;
  const isValid = isSignatureValid({ signature, secret, payload });

  console.log("Received an events webhook");
  console.log("Validated signature:", isValid);
  console.log("Payload", JSON.stringify(payload, null, 4));
  res.json({ status: "success" });
  if (payload.action == "submitted" && isValid) {
    pending_verifications.push(payload.vendorData);
    save_pending(pending_verifications, "PENDING_VERIFS.txt");
    console.log("pushed address ", pending_verifications);
  }
});

let server = require("http").Server(app);
server.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${WEBHOOK_PORT}`);
});


