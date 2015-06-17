'use strict';

var api = require('./Opacity.api');
var sinon = require('sinon');

function Opacity (parent) {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = Opacity;
