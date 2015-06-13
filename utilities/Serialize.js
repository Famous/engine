/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Serialize = {};

/**
 * Private.
 */
Serialize.serializeArray = function serializeArray (vec, orig) {
    if(orig) {
        var modified = false, len = vec.length;
        for (var i = 0; i < len ; i++)
            if(vec[i] !== orig[i]) {
                modified = true;
                break;
            }
        if(!modified) return null;
    }
    if(Array.isArray(vec))
        return JSON.stringify(vec);
    var temp = new Array(len);
    for (i = 0; i < len ; i++)
        temp[i] = vec[i];
    return JSON.stringify(temp);
};

/**
 * Private.  Hack for Node translating storage values.
 */
Serialize.serializeArrayDorked3 = function serializeArray3ZOffset (vec, orig) {
    if(vec[0]==orig[0]&&vec[1]==orig[1]&&vec[2]==orig[2])
        return null;
    return JSON.stringify([vec[0],vec[1],vec[2]+0.5]);
};

/**
 * Private.
 */
Serialize.deserializeArray = function serializeArray (vec) {
    if( typeof vec === 'string' ) {
        return JSON.parse(vec);
    }
    return vec;
};

module.exports = Serialize;
