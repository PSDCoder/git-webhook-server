'use strict';

var Adapter = require('./Adapter');

Adapter.prototype.getRepositoryData = function() {
    var necessaryData = {};

    if (!this.postData.repository) {
        throw new Error('Can\'t find "repository" field in post json.');
    } else if (!this.postData.repository.name) {
        throw new Error('Can\'t find "repository.name" field in post json.');
    } else {
        necessaryData.repository = this.postData.repository.name;
    }

    if (!this.postData.ref) {
        throw new Error('Can\'t find "ref" field in post json.');
    } else {
        necessaryData.branch = this.parseBranch(this.postData.ref);
    }

    if (!this.postData.after) {
        throw new Error('Can\'t find "after" field in post json.');
    } else {
        necessaryData.commit = this.postData.after;
    }

    if (!this.postData.user_name) {
        throw new Error('Can\'t find "user_name" field in post json.');
    } else {
        necessaryData.author = this.postData.user_name;
    }

    return necessaryData;
};


module.exports = function (postData) {
    return new Adapter(postData);
};