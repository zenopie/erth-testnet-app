let verification_status = "not verified";

const veriff = Veriff({
  host: 'https://stationapi.veriff.com',
  apiKey: '388c7a11-9b98-4fa9-b5a2-73348479326a',
  parentId: 'veriff-root',
  onSession: function(err, response) {
    window.location.href = response.verification.url;
  }
});



async function check_verification_status(){
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
  console.log("Verification Status: " + verification_status);
  if (verification_status == "not verified") {
    document.querySelector("#loading").classList.add("remove");
    document.querySelector(".test-box").classList.remove("remove");
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

function start(){
  check_verification_status();
}


