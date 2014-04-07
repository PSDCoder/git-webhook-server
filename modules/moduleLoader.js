'use strict';

var util = require('util');

module.exports = function (modulesNames) {
    if (!util.isArray(modulesNames)) {
        throw new Error('For load modules you must pass array of their names');
    }

    var loadedModules = [];

    for (var i = 0, length = modulesNames.length; i < length; i++) {
        loadedModules[modulesNames[i]] = require('./' + modulesNames[i]);
    }

    return loadedModules;
};