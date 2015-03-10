function ThreadManager (thread, compositor) {
	this._thread = thread;
	this._compositor = compositor;

    var _this = this;
	this._thread.onmessage = function (ev) {
        _this._compositor.receiveCommands(ev.data ? ev.data : ev);
    };
    this._thread.onerror = function (error) {
        console.error(error);
    };
}

ThreadManager.prototype.update = function update (time) {
    this._thread.postMessage(['FRAME', time]);
    var threadMessages = this._compositor.drawCommands();
    this._thread.postMessage(threadMessages);
    this._compositor.clearCommands();
};

module.exports = ThreadManager;
