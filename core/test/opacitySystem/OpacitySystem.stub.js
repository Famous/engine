'use strict';

var api = require('./OpacitySystem.api');
var sinon = require('sinon');

var OpacitySystem = {};

api.forEach(function (method) {
    OpacitySystem[method] = sinon.stub();
});

module.exports = OpacitySystem;
