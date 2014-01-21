var http = require('http');

/**
 * Format HTTP response and send it
 *
 * @param {ServerResponse} res - response object from http request
 * @param {number} code - HTTP Code
 * @param {string} [message] - Message for request
 */
module.exports = function (res, code, message) {
    res.writeHead(code, http.STATUS_CODES[code]);
    res.end((message || http.STATUS_CODES[code]) + '\n');
};