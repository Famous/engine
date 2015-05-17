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

var Channel = require('../Channel');
var test = require('tape');

test('Channel', function(t) {
    t.test('Workerless mode', function(t) {
        t.test('sendMessage method', function(t) {
            t.plan(2);
            var channel = new Channel();
            channel.onmessage = function(actualMessage) {
                t.deepEqual(
                    actualMessage,
                    expectedMessage,
                    'Channel should send commands via Channel#onmessage when not ' +
                    'running in a Worker'
                );
                t.equal(
                    actualMessage,
                    expectedMessage,
                    'Channel should not clone commands'
                );
            };
            var expectedMessage = [1, 2, 3];
            channel.sendMessage(expectedMessage);
        });
        
        t.test('onMessage method', function(t) {
            t.plan(2);
            var channel = new Channel();
            channel.onmessage = function() {
                t.fail(
                    'Channel#postMessage should send message TO the "Worker"'
                );
            };
            var expectedMessage = [1, 2, 3];
            channel.onMessage = function(actualMessage) {
                t.deepEqual(
                    actualMessage,
                    expectedMessage,
                    'Received message should be identic to sent message'
                );
                t.equal(
                    actualMessage,
                    expectedMessage,
                    'Received message should be cloned when not running in ' +
                    'Worker mode'
                );
            };
            channel.postMessage(expectedMessage);
        });
    });
});
