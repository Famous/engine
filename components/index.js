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
    'famous/components/Align',
    'famous/components/Camera',
    'famous/components/GestureHandler',
    'famous/components/MountPoint',
    'famous/components/Opacity',
    'famous/components/Origin',
    'famous/components/Position',
    'famous/components/Rotation',
    'famous/components/Scale',
    'famous/components/Size',
    'famous/components/Transform'
    ], function ( Align, Camera, GestureHandler, MountPoint, Opacity, Origin, Position, Rotation, Scale, Size, Transform ) {
return {
    Align: Align,
    Camera: Camera,
    GestureHandler: GestureHandler,
    MountPoint: MountPoint,
    Opacity: Opacity,
    Origin: Origin,
    Position: Position,
    Rotation: Rotation,
    Scale: Scale,
    Size: Size,
    Transform: Transform
};
});
