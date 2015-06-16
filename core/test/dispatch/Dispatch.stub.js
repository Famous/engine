'use strict';

var api = require('./Dispatch.api');
var sinon = require('sinon');

var Dispatch = {};

api.forEach(function (method) {
    Dispatch[method] = sinon.stub();
});

module.exports = Dispatch;

