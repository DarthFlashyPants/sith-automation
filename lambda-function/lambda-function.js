var http = require('http');

'use strict';
/**
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */
exports.handler = (event, context, callback) => {
    console.log('Current Battery Voltage:', event.batteryVoltage);
    console.log('Received event:', event.clickType);
    // On a single press, send the system info report
    if (event.clickType == 'SINGLE') {
        console.log('Generating SytemInfo Report');
        callAutomation('/systeminfo', function(err, body) {
            if (err) {
                console.log(err);
            }
        });
        // On a double press, generate and pulicsh LogShark reports
    } else if (event.clickType == 'DOUBLE') {
        console.log('Generating Logshark Data');
        callAutomation('/logs', function(err, body) {
            if (err) {
                console.log(err);
            }
        });
        // For a long press, restart Tableau Server
    } else if (event.clickType == 'LONG') {
        console.log('Restarting the Server');
        callAutomation('/restart', function(err, body) {
            if (err) {
                console.log(err);
            }
        });
    }
};

function callAutomation(path, callback) {
    return http.get({
        // IP address of your Tableau Server
        host: '10.0.1.126',
        // Port which the sith-automation.js is listening on
        port: 7998,
        path: path
    }, function(err, response) {
        if (err) {
            console.log(err);
        }

        callback('success');
    });
}
