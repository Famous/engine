'use strict';

var index = 0;
var SLASH = '/';

function RenderProxy (parent) {
    this._parent = parent;
    this._id = SLASH + index++;
}

RenderProxy.prototype.getRenderPath = function getRenderPath () {
    return this._parent.getRenderPath() + this._id;
};

RenderProxy.prototype.receive = function receive (command) {
    this._parent.receive(command);
    return this;
};

RenderProxy.prototype.send = function send () {
    this._parent.send();
    return this;
};  

module.exports = RenderProxy;
