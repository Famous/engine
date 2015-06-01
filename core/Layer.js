
var PathUtils = require('./Path');

function Layer () {
    this.items = [];
    this.paths = [];
    this.memo = {};
    this.iterator = 0;
}

Layer.prototype.insert = function insert (path, item) {
    var paths = this.paths;
    var index = paths.indexOf(path);
    if (index !== -1)
        throw new Error('item already exists at path: ' + path);

    var i = 0;
    var targetDepth = PathUtils.depth(path);
    var targetIndex = PathUtils.index(path);

    while (
            paths[i] &&
            targetDepth >= PathUtils.depth(paths[i])
    ) i++;

    while (
            paths[i] &&
            targetDepth === PathUtils.depth(paths[i]) &&
            targetIndex < PathUtils.index(paths[i])
    ) i++;

    paths.splice(i, 0, path);
    this.items.splice(i, 0, item);

    this.memo[path] = i;

    for (var len = this.paths.length ; i < len ; i++)
        this.memo[this.paths[i]] = null;

};

Layer.prototype.remove = function remove (path) {
    var paths = this.paths;
    var index = paths.indexOf(path);
    if (index === -1)
        throw new Error('Cannot remove. No item exists at path: ' + path);

    paths.splice(i, 1);
    this.items.splice(i, 1);

    this.memo[path] = null;

    for (var len = this.paths.length ; i < len ; i++)
        this.memo[this.paths[i]] = null;
};

Layer.prototype.get = function get (path) {
    if (this.memo[path]) return this.items[this.memo[path]];

    var index = this.paths.indexOf(path);

    if (index === -1) return;

    this.memo[path] = index;

    return this.items[index];
};

Layer.prototype.getItems = function getItems () {
    return this.items;
};

Layer.prototype.getPaths = function getPaths () {
    return this.paths;
};

Layer.prototype.next = function next () {
    return this.paths[this.iterator++];
};

Layer.prototype.resetIterator = function resetIterator () {
    this.iterator = 0;
};

Layer.prototype.getIterator = function getIterator () {
    return this.iterator;
};

module.exports = Layer;
