'use strict';

//global node js modules
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;

//own modules
var config = require('./config/main');
var modules = require('./modules/moduleLoader')([
    'logger',
    'templates',
    'httpResponse',
    'notifications',
    'errorHandler'
]);

modules.logger(config.enableLogs, config.logsPath);

var repositoryAdapters = {};

//Error handler setup
var errorHandler = modules.errorHandler([
    function(message) {
        modules.logger.log(modules.logger.ERROR, message);
    },
    function(message) {
        if (config.notifyToEmailOnErrors) {
            modules.notifications.send(templates.renderTemplate('error', {error: message}));
        }
    }
]).handler;

process.on('uncaughtException', errorHandler);

http.createServer(function(req, res) {
    var requestUrl = url.parse(req.url, true);
    var buffer = '';
    var postJson = {};

    if (req.method !== 'POST') {
        errorHandler('GET request, only POST supports');
        modules.response(res, 405);
        return;
    }

    req.on('data', function(chunk) {
        buffer += chunk;
    });

    req.on('end', function () {
        if (!requestUrl.query.repository || config.repositories.indexOf(requestUrl.query.repository) === -1) {
            var repositoryMissingMessage = 'You must pass correct "repository" GET parameter';

            errorHandler(repositoryMissingMessage);
            modules.response(res, 400, repositoryMissingMessage);
            return;
        }

        if (!requestUrl.query.secretKey) {
            errorHandler(
                'Invalid authentication, please check you secretKey. ' +
                (requestUrl.query.secretKey
                ? 'Key from request: ' + requestUrl.query.secretKey
                : 'Key is empty')
            );
            modules.response(res, 403);
            return;
        } else {
            if (
                (config.repositories[requestUrl.query.repository].hasOwnProperty('secretKey') && config.repositories[requestUrl.query.repository.secretKey] !== requestUrl.query.secretKey)
                ||
                config.secretKey !== requestUrl.query.secretKey
            ) {
                errorHandler(
                    'Invalid authentication, please check you secretKey. ' +
                    (requestUrl.query.secretKey
                        ? 'Key from request: ' + requestUrl.query.secretKey
                        : 'Key is empty')
                );
                modules.response(res, 403);
                return;
            }
        }



        if (!config.repositories[requestUrl.query.repository]) {
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
                var repositoryConfig = config.repositories[postJson.repository.name];

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
                    sendNotification(renderTemplate(config.commands.messages.pullSuccess, {
                        repository: postJson.repository.name,
                        branch: pushBranch,
                        host: config.serverName
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
}).listen(config.port);

console.log('Webhook server was running on port: ' + config.port);
