'use strict';

var api = require('./Channel.api');
var sinon = require('sinon');

function Channel () {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = Channel;
