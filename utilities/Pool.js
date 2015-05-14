'use strict';


/**
 * A Pool can be used to avoid Garbage Collection by reusing otherwise
 * frequently allocated objects.
 * Objects are grouped by their respective constructor functions.
 * 
 * @class   Pool
 */ 
function Pool() {
    this._deallocated = {};
    this._allocated = [];
}

/**
 * Allocates a new object. If an object of the same class is available
 * ("allocated"), it will be recycled, otherwise a new object is being
 * instantiated with the passed in options.
 * 
 * @method  allocate
 *  
 * @param  {Function} Constructor   Constructor function used for instantiating
 *                                  the new object. Used for uniquely
 *                                  identifying the object type.
 * @param  {Object} options         Constructor options.
 * @return {Object}                 The allocated object. Either a reused object
 *                                  a newly instantiated object.
 */ 
Pool.prototype.allocate = function allocate(Constructor, options) {
    var id = Constructor.prototype.toString();
    this._deallocated[id] = this._deallocated[id] || [];
    
    var object;
    
    if (this._deallocated[id].length === 0) {
        object = new Constructor(options);
    } else {
        object = this._deallocated[id].pop();
        if (options) Constructor.call(object, options);
    }
    
    this._allocated.push(object);
    
    return object;
};

/**
 * Deallocates all currently allocated objects.
 * 
 * @method  deallocateAll
 */ 
Pool.prototype.deallocateAll = function deallocateAll() {
    for (var i = 0; i < this._allocated.length; i++) {
        var object = this._allocated[i];
        var id = object.toString();
        this._deallocated[id] = this._deallocated[id] || [];
        this._deallocated[id].push(object);
    }
    this._allocated.length = 0;
};

module.exports = Pool;
