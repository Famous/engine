'use strict';

function MockDispatch() {
}

MockDispatch.prototype.addRenderable = function addRenderable() {
};

MockDispatch.prototype.getRenderPath = function getRenderPath() {
};

MockDispatch.prototype.getContext = function getContext() {
    return {
        _transform: [],
        _origin: []
    };
};

MockDispatch.prototype.sendDrawCommand = function sendDrawCommand() {
};

MockDispatch.prototype.dirtyRenderable = function dirtyRenderable() {
};

MockDispatch.prototype.onTransformChange = function onTransformChange() {
};

MockDispatch.prototype.onSizeChange = function onSizeChange() {
};

MockDispatch.prototype.onOpacityChange = function onOpacityChange() {
};

MockDispatch.prototype.onOriginChange = function onOriginChange() {
};

module.exports = MockDispatch;
