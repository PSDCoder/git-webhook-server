function ErrorHandler(tasks) {
    tasks = tasks || [];

    this.handle = function(err) {
        var message = err instanceof Error ? err.message : err;

        for (var i = 0, tasksLength = tasks.length; i < tasksLength; i++) {
            tasks[i](message);
        }
    };
}

module.exports = function (tasks) {
    return new ErrorHandler(tasks);
};