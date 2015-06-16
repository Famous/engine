'use strict';

var api = require('./Node.api');
var sinon = require('sinon');

function Node () {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = Node;

