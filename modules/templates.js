var templates = require('../config/templates');

exports.render = function (template, params) {
    params = params || {};

    for(var param in params) {
        if (params.hasOwnProperty(param)) {
            template = template.replace(new RegExp('\\*\\*' + param + '\\*\\*', 'g'), params[param]);
        }
    }

    return template;
};

exports.renderTemplate = function (templateName, params) {
    if (!templates[templateName]) {
        throw new Error('Can\'t find email template with name: ' + templateName);
    }

    return this.render(templates[templateName], params);
};