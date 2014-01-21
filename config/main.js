var commands = require('./commands');
var os = require("os");

module.exports = {
    hostname: '' || os.hostname(), //used only for notifications
    port: 8080,
    key: 'a*(3kla0kj230s',
    email: 'psdcoder@gmail.com',
    notifyOnErrors: true,
    commands: commands,
    repositories: {
        coins: {
            path: '/var/www/MPOS/',
            commands: [
                commands.pull
            ],
            notifyOnUpdate: true,
            branches: '*'
        }
    }
};