const axios = require('axios');

// The URL to monitor
const pingURL = "https://YOURURL.com";
// The webhook for RestartVMService see https://github.com/danielraffel/RestartVMService for details
const webhookURL = "https://YOUR_ZONE-YOUR_PROJECT_ID-NUMBER.cloudfunctions.net";
// Your unique password to validate your webhook for RestartVMService
const secretPayload = { "secret": "UNIQUE_PASSWORD" };

let consecutiveErrors = 0;

// Function to ping the site and return its status
async function pingSite() {
  let responseState = "";
  try {
    // Make a GET request to the site
    const response = await axios.get(pingURL);
    // Log the received HTTP status for easy spotting in logs
    console.log(`[Ping Response] HTTP Status: ${response.status}`);
    
    // Check if the status code is OK
    if (response.status >= 200 && response.status < 300) {
      // Reset consecutive error counter
      consecutiveErrors = 0;
      responseState = `HTTP Status: ${response.status}`;
    } else {
      // Increment consecutive error counter
      consecutiveErrors++;
      responseState = `Reporting Error: ${response.status}`;
    }
  } catch (error) {
    // Increment consecutive error counter
    consecutiveErrors++;
    // Determine the type of error
    if (error.response) {
      responseState = `Reporting Error: ${error.response.status}`;
    } else if (error.request) {
      responseState = "Not Responding";
    }
  }
  
  // Log how the response was processed
  console.log(`[Processed State] ${responseState}`);

  // Trigger the webhook if there are 2 or more consecutive errors
  if (consecutiveErrors >= 2) {
    triggerWebhook(responseState);
    // Reset consecutive error counter
    consecutiveErrors = 0;
  }

  return responseState;
}

// Function to trigger a webhook
async function triggerWebhook(responseState) {
  try {
    // Make a POST request to the webhook URL
    await axios.post(webhookURL, {
      ...secretPayload,
      "responseState": responseState
    });
  } catch (error) {
    console.error("Failed to trigger webhook:", error);
  }
}

// The main function that will be exported and triggered
exports.httpPing = async (req, res) => {
  // Call the pingSite function and get the status
  const status = await pingSite();
  // Send the status as the HTTP response
  res.status(200).send(`Site Status: ${status}`);
};
