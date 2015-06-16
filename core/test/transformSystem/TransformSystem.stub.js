'use strict';

var api = require('./TransformSystem.api');
var sinon = require('sinon');

var TransformSystem = {};

api.forEach(function (method) {
    TransformSystem[method] = sinon.stub();
});

module.exports = TransformSystem;
