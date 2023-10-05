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
  const startTime = Date.now();  // Start time before the ping

  try {
    const response = await axios.get(pingURL);
    const endTime = Date.now();  // End time after the response

    const timeTaken = endTime - startTime;
    console.log(`[Ping Response] HTTP Status: ${response.status}, Time Taken: ${timeTaken}ms`);

    if (response.status >= 200 && response.status < 300) {
      consecutiveErrors = 0;
      responseState = `HTTP Status: ${response.status}, Time Taken: ${timeTaken}ms`;
    } else {
      consecutiveErrors++;
      responseState = `Reporting Error: ${response.status}, Time Taken: ${timeTaken}ms`;
    }
  } catch (error) {
    const endTime = Date.now();  // End time after the error
    const timeTaken = endTime - startTime;

    consecutiveErrors++;
    if (error.response) {
      responseState = `Reporting Error: ${error.response.status}, Time Taken: ${timeTaken}ms`;
    } else if (error.request) {
      responseState = `Not Responding, Time Taken: ${timeTaken}ms`;
    }
  }

  console.log(`[Processed State] ${responseState}`);

  if (consecutiveErrors >= 2) {
    triggerWebhook(responseState);
    consecutiveErrors = 0;
  }

  return responseState;
}

// Function to trigger a webhook
async function triggerWebhook(responseState) {
  try {
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
  const status = await pingSite();
  res.status(200).send(`Site Status: ${status}`);
};
