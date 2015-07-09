'use strict';

var api = require('./Clock.api');
var sinon = require('sinon');

function Clock () {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = Clock;
