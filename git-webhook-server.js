//global node js modules
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;

//own modules
var conf = require('./config/main');
var logger = require('./modules/logger')(true);
var templates = require('./modules/templates');
var response = require('./modules/http-response');
var errorHandlerModule = require('./modules/error-handler');
var notifications = require('./modules/notifications');

var errorTasks = [
    function(message) {
        logger.log(logger.ERROR, message);
    },
    function(message) {
        if (conf.notifyOnErrors) {
            notifications.send(templates.render('error', {error: message}));
        }
    }
];


var ErrorHandler = errorHandlerModule(errorTasks);

process.on('uncaughtException', function (err) {
    handleError(err.message);
});

http.createServer(function(req, res) {
    var requestUrl = url.parse(req.url, true);

    if (requestUrl.pathname === '/favicon.ico') {
        response(res, 404);
        return;
    }

    if (req.method !== 'POST') {
        handleError('GET request, only POST supports');
        response(res, 405);
        return;
    }

    var buffer = '';
    var postJson = {};

    req.on('data', function(chunk) {
        buffer += chunk;
    });

    req.on('end', function () {
        var requestKey = requestUrl.query['key'];

        if (requestKey !== conf.key) {
            handleError('Invalid authentication, please check you key. ' + (requestKey ? 'Key from request: ' + requestKey : 'Key is empty'));
            response(res, 403);

            return;
        }

        if(buffer.length > 0) {
            try {
                postJson = JSON.parse(buffer);
            } catch (ex) {
                handleError('json parsing: ' + ex.message);
                response(res, 400);
                return;
            }
        } else {
            response(res, 400, 'You must pass correct gitlab json.');
            return;
        }

        switch (requestUrl.pathname) {
            case '/':
                if (!postJson.repository || !conf.repositories[postJson.repository.name]) {
                    response(res, 400, 'You must setup hook for this repository in webhook server. JSON: ' + buffer);
                    return;
                }

                var repositoriesData = conf.repositories[postJson.repository.name];
                var pushBranch = /\/([^\/]+)$/.exec(postJson.ref)[1];

                for(var n = 0, commandsLength = repositoriesData.commands.length; n < commandsLength; n++) {
                    if (repositoriesData.branches === '*' || repositoriesData.branches[pushBranch]) {
                        var renderedCommand = renderTemplate(repositoriesData.commands[n], {
                            path: repositoriesData.path
                        });

                        exec(renderedCommand, function (err) {
                            if (err) {
                                handleError(err.message);
                            }
                        });
                    }
                }

                if (repositoriesData.notifyOnUpdate) {
                    'Repository: **repository**, branch: **branch** on **host** was updated',

                    sendNotification(renderTemplate(conf.commands.messages.pullSuccess, {
                        repository: postJson.repository.name,
                        branch: pushBranch,
                        host: conf.hostname
                    }));
                }

                logger.log(logger.INFO, 'Repository "' + postJson.repository.name + '" was successfully updated. Commit: ' + postJson.after);

                response(res, 200);
                break;
            default:
                response(res, 404);
                break;
        }
    });
}).listen(conf.port);

console.log('Webhook server was running on port: ' + conf.port);
