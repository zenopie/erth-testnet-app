

const veriff = Veriff({
  host: 'https://stationapi.veriff.com',
  apiKey: '388c7a11-9b98-4fa9-b5a2-73348479326a',
  parentId: 'veriff-root',
  onSession: function(err, response) {
    window.location.href = response.verification.url;
  }
});

async function query(){
	let tx = await secretjs.query.compute.queryContract({
	  contract_address: ID_CONTRACT,
	  code_hash: ID_HASH,
	  query: {
		  registration_status: {
			address: secretjs.address
		},
	  }
	});
  console.log(tx);
  return tx.registration_status;
};



async function check_verification_status(){
  let verification_status = "not verified";
  let contract_value =  await query();
  if (contract_value == "registered") {
    verification_status = "registered";
  } else {
    const pending_check_url = '/api/pending/' + window.secretjs.address;
    await fetch(pending_check_url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
    }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Assuming the response is JSON
    })
    .then(data => {
      console.log('GET request successful:', data);
      if (data.pending) {
        verification_status = "pending";
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  console.log("Verification Status: " + verification_status);
  if (verification_status == "registered") {
    document.querySelector("#loading").classList.add("remove");
    document.querySelector("#claim-box").classList.remove("remove");
  } else if (verification_status == "not verified") {
    document.querySelector("#loading").classList.add("remove");
    document.querySelector("#register-box").classList.remove("remove");
  } else if (verification_status == "pending") {
    document.querySelector("#loading").classList.add("remove");
    document.querySelector("#pending-box").classList.remove("remove");
  }
  
}

function registerButton() {
  veriff.setParams({
    person: {
      givenName: ' ',
      lastName: ' '
    },
    vendorData: window.secretjs.address
  });
  veriff.mount();
  document.querySelector(".test-box").classList.add("remove");
  document.querySelector(".disclaimer").classList.remove("remove");
}
async function mint(){
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: ID_CONTRACT,
    	code_hash: ID_HASH,
		msg: {
			mint: {},
		}
	});
	let resp = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
};
function claimButton(){
  mint();
} 

function start(){
  check_verification_status();
}

