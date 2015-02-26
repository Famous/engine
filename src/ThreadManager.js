function ThreadManager (thread, compositor) {
	this.thread = thread;
	this.compositor = compositor;

    var _this = this;
	this.thread.onmessage = function (ev) {
        _this.compositor.receiveCommands(ev.data);
    };
    this.thread.oncommands = function (commands) {
        _this.compositor.receiveCommands(commands);
    };
    this.thread.onerror = function (error) {
        console.error(error);
    };
}

ThreadManager.prototype.update = function update (time) {
    if (this.thread.postMessage) {
        this.thread.postMessage(['FRAME', time]);

        var threadMessages = this.compositor.drawCommands();
        this.thread.postMessage(threadMessages);
    } else {
        this.thread.receiveCommands(['FRAME', time]);

        var threadMessages = this.compositor.drawCommands();
        this.thread.receiveCommands(threadMessages);
    }
    
    this.compositor.clearCommands();
};

module.exports = ThreadManager;
