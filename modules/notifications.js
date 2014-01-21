var templates = require('./templates');
var config = require('../config/main');

exports.send = function (message) {
    var messageToSending = templates.render(config.commands.notify, {
        email: config.email,
        hostname: config.hostname,
        message: message
    });

    exec(messageToSending, function(err) {
        if (err) {
            console.log(err);
            logger.log(logger.ERROR, err.message);
        }

    });
};