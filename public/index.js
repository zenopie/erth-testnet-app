
const veriff = Veriff({
  host: 'https://stationapi.veriff.com',
  apiKey: '388c7a11-9b98-4fa9-b5a2-73348479326a',
  parentId: 'veriff-root',
  onSession: function(err, response) {
    window.veriffSDK.createVeriffFrame({ url: response.verification.url });
  }
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


