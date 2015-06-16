'use strict';

var helpers = {};

var pathStub = null;

helpers.setPathStub = function setPathStub (stub) {
    pathStub = stub;
};

helpers.InsertTester = function InsertTester (depth, index, path) {
    this.depth = depth;
    this.index = index;
    this.path = path;

    pathStub.depth.withArgs(path).returns(this.depth);
    pathStub.index.withArgs(path).returns(this.index);
};

helpers.InsertTester.prototype.isDeeperThan = function isDeeperThan (otherTester) {
    return this.depth > otherTester.depth;
};

helpers.InsertTester.prototype.isOfEqualDepthTo = function isOfEqualDepthTo (otherTester) {
    return this.depth === otherTester.depth;
};

helpers.InsertTester.prototype.hasAGreaterIndexThan = function hasAGreaterIndexThan (otherTester) {
    return this.index > otherTester.index;
};

helpers.InsertTester.prototype.isAfter = function isAfter (otherTester) {
    if (
            this.isDeeperThan(otherTester) ||
            (this.isOfEqualDepthTo(otherTester) &&
             this.hasAGreaterIndexThan(otherTester))
       ) return true;
    else return false;
};

module.exports = helpers;

