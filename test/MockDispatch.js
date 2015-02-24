'use strict';

var MockContext = require('./MockContext');

function MockDispatch() {
    this._context = new MockContext();
}

MockDispatch.prototype.dirtyComponent = function dirtyComponent() {
};

MockDispatch.prototype.addComponent = function addComponent() {
};

module.exports = MockDispatch;
