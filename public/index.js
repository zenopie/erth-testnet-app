

function test() {
    fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // You may need additional headers, such as Authorization
      },
      body: JSON.stringify({ "user": "1" })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the response body as JSON
      })
      .then(data => {
        console.log(data);
        iframe(data.token);
  
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle the error here
      });
  }
  function iframe(token) {
    // Create the iframe element
    var iframe = document.createElement('iframe');

    // Set attributes for the iframe
    iframe.id = 'iframe';
    iframe.allowFullscreen = true;
    iframe.src = 'https://ui.idenfy.com/?authToken=' + token;
    iframe.allow = 'camera';

    // Append the iframe to the body or any other desired container
    document.querySelector(".home-content").appendChild(iframe);
  }
function registerButton() {
    document.querySelector(".test-box").classList.add("remove");
    document.querySelector(".disclaimer").classList.remove("remove");
}
window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
  console.log(event);
    // ...
}