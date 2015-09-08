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
define([
    'famous/core/Channel',
    'famous/core/Clock',
    'famous/core/Commans',
    'famous/core/Dispatch',
    'famous/core/Event',
    'famous/core/FamousEngine',
    'famous/core/Node',
    'famous/core/Path',
    'famous/core/PathStore',
    'famous/core/Scene',
    'famous/core/Size',
    'famous/core/SizeSystem',
    'famous/core/Transform',
    'famous/core/TransformSystem'
    ], function ( Channel, Clock, Commands, Dispatch, Event, FamousEngine, Node, Path, PathStore, Scene, Size, SizeSystem, Transform, TransformSystem) {
return {
    Channel: Channel,
    Clock: Clock,
    Commands: Commands,
    Dispatch: Dispatch,
    Event: Event,
    FamousEngine: FamousEngine,
    Node: Node,
    Path: Path,
    PathStore: PathStore,
    Scene: Scene,
    Size: Size,
    SizeSystem: SizeSystem,
    Transform: Transform,
    TransformSystem: TransformSystem
};
});
