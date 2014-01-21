//global node js modules
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;

//own modules
var conf = require('./config/main');
var logger = require('./modules/logger')(true);
var templates = require('./modules/templates');
var response = require('./modules/http-response');
var notifications = require('./modules/notifications');
var repositoryAdapters = {};

//Error handler setup
var errorHandlerModule = require('./modules/error-handler');
var errorTasks = [
    function(message) {
        logger.log(logger.ERROR, message);
    },
    function(message) {
        if (conf.notifyOnErrors) {
            notifications.send(templates.renderTemplate('error', {error: message}));
        }
    }
];
var errorHandler = errorHandlerModule(errorTasks).handle;
process.on('uncaughtException', errorHandler);

http.createServer(function(req, res) {
    var requestUrl = url.parse(req.url, true);

    if (requestUrl.pathname === '/favicon.ico') {
        response(res, 404);
        return;
    }

    if (req.method !== 'POST') {
        errorHandler('GET request, only POST supports');
        response(res, 405);
        return;
    }

    var buffer = '';
    var postJson = {};

    req.on('data', function(chunk) {
        buffer += chunk;
    });

    req.on('end', function () {
        if (requestUrl.query.key !== conf.key) {
            errorHandler('Invalid authentication, please check you key. ' + (requestUrl.query.key ? 'Key from request: ' + requestUrl.query.key : 'Key is empty'));
            response(res, 403);
            return;
        }

        if (!requestUrl.query.repository) {
            var repositoryMissingParam = 'You must pass "repository" GET parameter';

            errorHandler(repositoryMissingParam);
            response(res, 400, repositoryMissingParam);
            return;
        }

        if (!conf.repositories[requestUrl.query.repository]) {
            var unsettedUpRepository = 'You must setup hook for this repository in main config. Repostory: ' + requestUrl.query.repository;
            errorHandler(unsettedUpRepository);
            response(res, 400, unsettedUpRepository);
            return;
        }

        if(buffer.length > 0) {
            try {
                postJson = JSON.parse(buffer);
            } catch (ex) {
                errorHandler('json parsing: ' + ex.message);
                response(res, 400);
                return;
            }
        } else {
            var jsonError = 'You must pass correct gitlab json. Current post data: ' + buffer;
            errorHandler(jsonError);
            response(res, 400, jsonError);
            return;
        }

        switch (requestUrl.pathname) {
            case '/':
                var repositoryConfig = conf.repositories[postJson.repository.name];

                //cache repository adapter
                if (!repositoryAdapters[repositoryConfig.type]) {
                    repositoryAdapters[repositoryConfig.type] = require('./modules/repository-adapters/' + repositoryConfig.type);
                }

                var postUpdateData = repositoryAdapters[repositoryConfig.type].getRepositoryData();
                for(var n = 0, commandsLength = repositoryConfig.commands.length; n < commandsLength; n++) {
                    if (repositoryConfig.branches === '*' || repositoryConfig.branches[postUpdateData.branch]) {
                        var renderedCommand = templates.render(repositoryConfig.commands[n], {
                            path: repositoryConfig.path
                        });

                        exec(renderedCommand, function (err) {
                            if (err) {
                                errorHandler(err);
                            }
                        });
                    }
                }

                if (repositoryConfig.notifyOnUpdate) {
                    sendNotification(renderTemplate(conf.commands.messages.pullSuccess, {
                        repository: postJson.repository.name,
                        branch: pushBranch,
                        host: conf.serverName
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
