

var helpers = {};


helpers.InsertTester = function InsertTester (depth, index, path) {
    this.depth = depth;
    this.index = index;
    this.path = path;
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

helpers.InsertTester.prototype.insertInto = function insertInto (store, PathUtilsStub) {
    PathUtilsStub.depth.returns(this.depth);
    PathUtilsStub.index.returns(this.index);
    store.insert(this.path, this);
};

module.exports = helpers;

