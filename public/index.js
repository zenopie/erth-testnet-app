
const veriff = Veriff({
  host: 'https://stationapi.veriff.com',
  apiKey: '388c7a11-9b98-4fa9-b5a2-73348479326a',
  parentId: 'veriff-root',
  onSession: function(err, response) {
    window.veriffSDK.createVeriffFrame({ url: response.verification.url });
  }
});

const pending_check_url = 'https://erth.network/api/pending';

fetch(pending_check_url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // Set the content type to JSON
  },
  body: JSON.stringify({
    address: '888',
  }) // Convert the data object to JSON string
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Assuming the response is JSON
  })
  .then(data => {
    console.log('POST request successful:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

function registerButton() {
  veriff.setParams({
    person: {
      givenName: ' ',
      lastName: ' '
    },
    vendorData: '888'
  });
  veriff.mount();
  document.querySelector(".test-box").classList.add("remove");
  document.querySelector(".disclaimer").classList.remove("remove");
}


