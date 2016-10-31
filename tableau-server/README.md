# Sith Automation

![N|Solid](http://vignette2.wikia.nocookie.net/starwars/images/5/5b/SithCultist-TPOV.jpg/revision/latest?cb=20131007195906)

### Check server status, generate & publish logs, restart Tableau Server with an AWS IoT button

Sith automation is made up of two parts:
- sith-automation.js, which should be run on directly on the Tableau Server.
- lambda-function.js, the contents of which can be pasted into the AWS console while activating an AWS Lambda function

Sith-automation assumes:

- You have an AWS IoT button and the permissions to leverage AWS Lambda in response to a "button push"
- You've added tabadmin to the PATH of your Tableau Server
- Logshark is installed in it's default location on Tableau Server
- Logshark has been configured, including a pointer BACK to your Tableau Server so that it can automatically publish vizzes to the server.
- There is a D: drive where a log which has been generated can be temporarily stored
- *Unrestricted* trusted tickets have been enabled on the server
- You have added localhost and/or 127.0.0.1 to the wgserver.trusted_hosts of the Tableau Server

As you'll see this script listens on port 7998, so make sure it's been opened on your machine.

#### THERE IS ABSOLUTELY NO AUTHENTICATION OR SECURITY IMPLEMENTED IN THIS PROJECT ####

Therefore, you are crazy if you run this on an open system without significantly improving it.

#### Setup (sith-automation.js):

1. Add a file named config.json to this project. Use it to specify AWS IAM credentials and your AWS Region:

```
{ "accessKeyId": "AccessKey", "secretAccessKey": "YourSecretAccessKey", "region": "us-east-1" }
```

2. npm install
3. On line 95, modify the *admin* username you wish to use in order to login to Tableau Server and get server status with:
```
             'username': 'admin',
```             
4. On line 119, modify the ARN of the AWS SNS topic which sends out email to your subscribers:
```
TopicArn: 'arn:aws:sns:us-east-1:xxxxxxxxxxx:sithy-status'
```
#### Setup (lambda-function.js):

Follow the steps in the [AWS IoT button configuration wizard](https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/configure-triggers?bp=iot-button-email) to register and setup your IoT button:

![N|Wizard](https://cloud.githubusercontent.com/assets/8373862/19844857/25b2a4ee-9f6c-11e6-958b-b2e1e7d9343f.png)

Copy and paste the code in lambda-function.js to the Lambda Function Code Window. Replace the IP address and Port on lines 51 and 53 with values for your Tableau Server and the port on which sith-automation.js listens

![N|Lambda](https://cloud.githubusercontent.com/assets/8373862/19844856/24580bfc-9f6c-11e6-87b1-42639471b3c2.png)

After saving and testing the function, don't forget to *enable* the function using the button in the upper-right of the trigger screen.  

![N|Complete](https://cloud.githubusercontent.com/assets/8373862/19845198/6ca4b98e-9f6f-11e6-934e-943e3f27f0ca.png)

#### Running (sith-automation):

```
node sith-automation.js
```
