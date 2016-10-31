var spawn = require('child_process').spawn;
var http = require('http');
var request = require("request");
var fs = require('fs');
var AWS = require('aws-sdk');
var server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Response. So there.');
    /*******************Send Notification ***********************/
    if (req.url.toString() == '/systeminfo') {
        // Get Trusted Ticket, then get server status
        getTicket(function(body) {
            // Get Status
            request.get({
                followAllRedirects: true,
                url: 'http://localhost/trusted/' + body + '/admin/systeminfo.xml',
                jar: true
            }, function(err, response, body) {
                if (err) {
                    console.log(err);
                } else {
                    var systeminfo = body;

                    console.log(systeminfo, 'publishing to SNS');
                    // Publish to SNS topic
                    publishStatus(systeminfo, function(data) {
                        console.log('Push Completed: ', data);
                    });
                }
            });
        });
    } else if (req.url.toString() == '/restart') {
        // Restart Tableau Server by spawning a "tabadmin restart"
        console.log('Restarting');
        tabadminStop = [];
        tabadminStop.push('restart');
        try {
            // tabadmin.exe restart
            exec = spawn('tabadmin.exe', tabadminStop);
        } catch (e) {
            console.log('error spawning!');
            console.log(e);
            console.log(e.message);
        }
        exec.stdout.on('data', function(data) {
            console.log(data.toString());
        });
    } else if (req.url.toString() == '/logs') {
        // Generate logs with tabadmin ziplogs, call Logshark, cleanup zip file
        console.log('Preparing Logs');
        tabadminZipLogs = [];
        tabadminZipLogs.push('ziplogs');
        tabadminZipLogs.push('d:\\logs.zip');
        tabadminZipLogs.push('-f');
        // Zip up logs
        try {
            // tabadmin.exe ziplogs d:\logs.zip
            exec = spawn('tabadmin.exe', tabadminZipLogs);
        } catch (e) {
            console.log('error spawning!');
            console.log(e);
            console.log(e.message);
        }
        exec.stdout.on('data', function(data) {
            console.log(data.toString());
        });
        exec.on('exit', function() {
            //  Once Complete, run logshark without dumping tons of text to console
            console.log('Running Logshark. This will take some time.');
            try {
                //  logshark.exe d:\logs.zip -p <-- -p publishes results to Tabelau Server
                cleanUp = spawn('c:\\Program Files\\Logshark\\Logshark.exe', ['d:\\logs.zip', '-p']);
            } catch (e) {
                console.log('error spawning!');
                console.log(e);
                console.log(e.message);
            }
            cleanUp.stdout.on('data', function(data) {
                process.stdout.write('.');
            });
            cleanUp.on('exit', function() {
                console.log('\nLogShark Complete');
                // delete log from HD
                fs.unlink('d:\\logs.zip');
            });
        });
    }
});
// Get a Trusted Ticket from Tableau Server
var getTicket = function(callback) {
    console.log('here');
    request.post({
        url: 'http://localhost/trusted',
        form: {
            'username': 'admin',
            'target_site': ''
        }
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            callback();
        } else {
            var ticket = body;

            callback(body);
        }
    });
};
// Publish the status of Tableau Server to an AWS SNS Topic
var publishStatus = function(message, callback) {
    // Set identity of the IAM user in AWS
    AWS.config.loadFromPath('./config.json');

    var sns = new AWS.SNS();
    var params = {
        Message: message,
        /* required */
        Subject: 'Your status, my master',
        TopicArn: 'arn:aws:sns:us-east-1:xxxxxxxxxx:yyyyyyyyyyy'
    };

    sns.publish(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(err);
        }

        callback(data);
    });
};

server.listen(7998);
