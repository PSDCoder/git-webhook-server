'use strict';

var Adapter = require('./Adapter');

Adapter.prototype.getRepositoryData = function(callback) {
    var necessaryData = {};

    if (!this.postData.repository) {
        callback(new Error('Can\'t find "repository" field in post json.'));
    } else if (!this.postData.repository.name) {
        callback(new Error('Can\'t find "repository.name" field in post json.'));
    } else {
        necessaryData.repository = this.postData.repository.name;
    }

    if (!this.postData.ref) {
        callback(new Error('Can\'t find "ref" field in post json.'));
    } else {
        necessaryData.branch = this.parseBranch(this.postData.ref);
    }

    if (!this.postData.after) {
        callback(new Error('Can\'t find "after" field in post json.'));
    } else {
        necessaryData.commit = this.postData.after;
    }

    if (!this.postData.user_name) {
        callback(new Error('Can\'t find "user_name" field in post json.'));
    } else {
        necessaryData.author = this.postData.user_name;
    }

    callback(null, necessaryData);
};


module.exports = function (postData) {
    return new Adapter(postData);
};