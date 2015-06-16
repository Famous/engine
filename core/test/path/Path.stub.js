'use strict';

var api = require('./Path.api');
var sinon = require('sinon');

var path = {};

api.forEach(function (method) {
    path[method] = sinon.stub();
});

module.exports = path;

