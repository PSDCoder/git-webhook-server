'use strict';

var commands = require('./commands');
var repositoryTypes = require('../modules/repositoryTypes');

module.exports = {
    serverName: 'digital ocean (psdcoder)', //used for email notifications
    port: 8080,
    email: 'psdcoder@gmail.com',
    secretKey: 'a*(3kla0kj230s',
    notifyToEmailOnErrors: true,
    enableLogs: true,
    logsPath: __dirname + '/../logs/',
    commands: commands,
    repositories: {
        coins: {
            type: repositoryTypes.GITLAB,
            path: '/var/www/MPOS/',
            commands: [
                commands.hardReset,
                commands.clean,
                commands.pull
            ],
            notifyOnUpdate: true,
            branches: '*'
        }
    }
};