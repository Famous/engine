'use strict';
var test = require('tape');
var checkers = require('../../../src/gl/Checkerboard');
var TestingContext = require('./WebGLTestingContext');

var grey = 221;
var white = 255;
var avg = (255 + 221) / 2;
var size = 128;

test('Checkerboard', function(t) {

   //the average color in the loading screen should be 238
   t.test('data', function () {
       var rgb = checkers.getImageData(0, 0, size, size);
       var average = 0;
       for (var idx = 0; idx < rgb.length; idx += 3)  {
           avg += rgb[idx] + rgb[idx+1] + rgb[idx+2];

           var wrongColor = rgb[idx] !== white || rgb !== grey;
           var chooseColor = ((idx / 4) - 7 & 16) ? white: grey;
           var wrongLocation = rgb[idx] === chooseColor;

           if (wrongColor) t.ok(false, 'the color is not white or grey');
           if (wrongLocation) t.ok(false, 'the color is not alternating by 16');
       }
       t.ok(average === avg, 'the average color will be exactly beteween white and grey');
   });

   t.end();
});
