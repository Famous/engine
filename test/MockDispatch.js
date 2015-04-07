'use strict';

function MockDispatch() {}

MockDispatch.prototype.addRenderable = function addRenderable() {};

MockDispatch.prototype.addComponent = function addComponent() {};

MockDispatch.prototype.getRenderPath = function getRenderPath() {
    return 'body/0/1';
};

MockDispatch.prototype.getContext = function getContext() {
    return {
        _origin: [50, 50, 50],
        _opacity: { value: 1 },
        _size: {
            getTopDownSize: function() { return [100, 100, 100]; }
        },
        _transform: {
            _matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        },
    };
};

MockDispatch.prototype.sendDrawCommand = function sendDrawCommand() { return this };

MockDispatch.prototype.dirtyRenderable = function dirtyRenderable() {};

MockDispatch.prototype.dirtyComponent = function dirtyComponent() {};

MockDispatch.prototype.onTransformChange = function onTransformChange() {};

MockDispatch.prototype.onSizeChange = function onSizeChange() {};

MockDispatch.prototype.onOpacityChange = function onOpacityChange() {};

MockDispatch.prototype.onOriginChange = function onOriginChange() {};

module.exports = MockDispatch;
