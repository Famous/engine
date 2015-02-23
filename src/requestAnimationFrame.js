// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license

'use strict';

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];

var rAF;

if (typeof window === 'object') {
    for(var x = 0; x < vendors.length && !rAF; ++x) {
        rAF = window[vendors[x]+'RequestAnimationFrame'];
    }
}

rAF = rAF || function(callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function() { callback(currTime + timeToCall); }, 
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
};

module.exports = rAF;
