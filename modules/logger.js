var fs = require('fs');
var path = require('path');

function Logger(loggingEnabled) {
    this.INFO = 'info';
    this.WARNING = 'warning';
    this.ERROR = 'error';

    this.log = function(level, message) {
        if (loggingEnabled && this.hasOwnProperty(level.toUpperCase())) {
            fs.appendFile(
                path.normalize(__dirname + '/../logs/' + level + '.log'),
                new Date().toString() + ' - [' + level.slice(0, 1).toUpperCase() + level.slice(1) + '] - Message: ' + message + '\n'
            );
        }
    }
}



module.exports = function(enabled) {
    return new Logger(enabled);
};