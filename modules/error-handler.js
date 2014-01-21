function ErrorHandler(tasks) {
    this.tasks = tasks || [];

    this.handle = function(message) {
        for (var i = 0, tasksLength = this.tasks.length; i < tasksLength; i++) {
            this.tasks[i](message);
        }
    };
}

module.exports = function (tasks) {
    return new ErrorHandler(tasks);
};