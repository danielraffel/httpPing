# httpPing

When activated, this Google Cloud Function checks the status of a specific URL. If the URL is unresponsive, the function initiates a webhook. Although not mandatory, it's optimized for use with [RestartVMService](https://github.com/danielraffel/RestartVMService) which will automatically restart a Google Cloud VM when the hosted URL becomes unavailable.

## One-liner

A Cloud Function that pings a URL, reports its status and triggers a webhook if there are issues.

## Setup

1. Create a v1 Cloud Function in the Google Cloud Platform Console.
2. Set the trigger to HTTP.
3. Paste the code from this repository into the Cloud Function editor.
4. Set the environment variables `pingURL` and `webhookURL` to the URL of the site you want to monitor and the URL of the webhook, respectively.
5. Save the Cloud Function.

## How it works

The Cloud Function first pings the URL using the Axios library. If the response status code is 200 or 300, the function reports that the site is up. Otherwise, the function reports that the site is down and triggers the webhook.

## Example

The following example shows how to use the httpPing Cloud Function to monitor a website:

```
export const httpPing = async (req, res) => {
  const status = await pingSite();
  res.status(200).send(`Site Status: ${status}`);
};
```

In this example, the `pingSite` function is used to ping the website. The `status` variable is then used to set the response status code and message.

## Troubleshooting

If the Cloud Function is not working, you can check the following:

* Make sure that the Cloud Function is triggered correctly.
* Make sure that the environment variables `pingURL` and `webhookURL` are set correctly.
* Check the logs for the Cloud Function to see if there are any errors.

## To trigger the Cloud Function every minute, you can use Google Cloud Scheduler.

1. Go to the [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler) page in the Google Cloud Platform Console.
2. Click **Create Job**.
3. Select the **HTTP** trigger.
4. Enter the URL of the Cloud Function as the target URL.
5. Set the schedule to run every **Minute** * * * * *.
6. Click **Create**.

The Cloud Function will now be triggered every minute by Google Cloud schedule.
