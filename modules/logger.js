'use strict';

var fs = require('fs');
var path = require('path');

function Logger(logsEnabled, logsPath) {
    this.logsEnabled = logsEnabled;
    this.logsPath = logsPath;
}

Logger.prototype.INFO = 'Info';
Logger.prototype.WARNING = 'Warning';
Logger.prototype.ERROR = 'Error';

Logger.prototype.log = function(level, message) {
    if (this.logsEnabled && this.hasOwnProperty(level.toUpperCase())) {
        fs.appendFile(
            path.normalize(this.logsPath + level.toLowerCase() + '.log'),
            new Date().toString() + ' - [' + level + '] - Message: ' + message + '\n'
        );
    }
};

module.exports = function(logsEnabled, logsPath) {
    return new Logger(logsEnabled, logsPath);
};