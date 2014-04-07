'use strict';

function ErrorHandler(tasks) {
    this.tasks = tasks || [];
}

ErrorHandler.prototype.handler = function(err) {
    var message = err instanceof Error ? err.message : err;

    for (var i = 0, tasksLength = this.tasks.length; i < tasksLength; i++) {
        this.tasks[i](message);
    }
};

module.exports = function (tasks) {
    return new ErrorHandler(tasks);
};