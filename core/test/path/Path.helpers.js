'use strict';

var helpers = {};

helpers.generateSelector = function generateSelector () {
    return Math.random().toString(36).substring(2, 5);
};

helpers.makeID = function makeID (path) {
    return '#' + path;
};

helpers.makeClass = function makeClass (path) {
    return '.' + path;
};

helpers.generateIndex = function generateIndex() {
    return (Math.random() * 40)|0;
};

helpers.addDepth = function addDepth (path) {
    return path + '/' + this.generateIndex();
};

helpers.generatePathOfDepth = function generatePathOfDepth (depth) {
    var path = this.generateSelector();
    while (depth--) path = this.addDepth(path);
    return path;
};

helpers.generatePath = function generatePath () {
    return this.generatePathOfDepth((Math.random() * 6)|0);
};

helpers.generateTestCases = function generateTestCases () {
    var result = [];
    for (var i = 0 ; i < 10 ; i++) {
        result.push(this.generateSelector());
        result.push(this.makeID(this.generateSelector()));
        result.push(this.makeClass(this.generateSelector()));
        result.push(this.generatePath());
        result.push(this.makeID(this.generatePath()));
        result.push(this.makeClass(this.generatePath()));
    }
    return result;
};

helpers.addTrailingSlash = function addTrailingSlash (path) {
    return path + '/';
};

module.exports = helpers;

