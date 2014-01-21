var messages = require('../config/messages');

exports.render = function (templateName, params) {
    if (!messages[templateName]) {
        throw new Error('Can\'t find email template with name: ' + templateName);
    }

    var template = messages[templateName];
    params = params || {};

    for(var param in params) {
        if (params.hasOwnProperty(param)) {
            template = template.replace(new RegExp('\\*\\*' + param + '\\*\\*', 'g'), params[param]);
        }
    }

    return template;
};