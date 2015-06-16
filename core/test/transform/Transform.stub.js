'use strict';

var api = require('./Transform.api');
var sinon = require('sinon');

function Transform (parent) {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = Transform;
