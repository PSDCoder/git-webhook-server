var commands = require('./commands');
var repositoryTypes = require('../modules/repository-types');

module.exports = {
    serverName: 'digital ocean (psdcoder)', //used for email notifications
    port: 8080,
    key: 'a*(3kla0kj230s',
    email: 'psdcoder@gmail.com',
    notifyOnErrors: false,
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