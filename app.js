const express = require('express');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const app = express();

const WEBHOOK_PORT = 3000; // Port for HTTPS
const API_SECRET = "21b28fe5-17e1-4152-b983-d9f431da3654";


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

app.post("/api/veriff/", (req, res) => {
  const signature = req.get("x-hmac-signature");
  const secret = API_SECRET;
  const payload = req.body;

  console.log("Received a webhook");
  console.log(
    "Validated signature:",
    isSignatureValid({ signature, secret, payload })
  );
  console.log("Payload", JSON.stringify(payload, null, 4));
  res.json({ status: "success" });
  process.exit();
});

app.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${WEBHOOK_PORT}`);
});


