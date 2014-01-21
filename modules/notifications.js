var exec = require('child_process').exec;
var templates = require('./templates');
var config = require('../config/main');
var commands = require('../config/commands');
var logger = require('./logger')(true);

exports.send = function (message) {
    var messageToSending = templates.render(commands.notify, {
        email: config.email,
        serverName: config.serverName,
        message: message
    });

    exec(messageToSending, function(err) {
        if (err) {
            console.log(err);
            logger.log(logger.ERROR, err.message);
        }
    });
};