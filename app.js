const express = require('express');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const app = express();

const WEBHOOK_PORT = 3000; // Port for HTTPS
const API_SECRET = "21b28fe5-17e1-4152-b983-d9f431da3654";

let pending_verifications = [];

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
app.post("api/pending", (req, res) => {
  const payload = req.body;
  console.log(payload);
  res.json({ status: "success" });
});
app.post("/api/veriff/decisions", (req, res) => {
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
    console.log("spliced address ", pending_verifications);
  } else {
    console.log("error finding address in pending verifications");
  }
  if (payload.verification.status == "approved" && isValid) {
    console.log("test");
  }
});

app.post("/api/veriff/events", (req, res) => {
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
    console.log("pushed address ", pending_verifications);
  }
});

let server = require("http").Server(app);
server.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${WEBHOOK_PORT}`);
});


