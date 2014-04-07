'use strict';

function Adapter(postData) {
    this.postData = postData;
}

Adapter.prototype.parseBranch = function (ref) {
    return /\/([^\/]+)$/.exec(ref)[1];
};

module.exports = Adapter;