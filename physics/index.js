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

module.exports = {
    Particle: require('./bodies/Particle'),
    convexBodyFactory: require('./bodies/convexBodyFactory'),
    Box: require('./bodies/Box'),
    Sphere: require('./bodies/Sphere'),
    Wall: require('./bodies/Wall'),

    Constraint: require('./constraints/Constraint'),
    Angle: require('./constraints/Angle'),
    Collision: require('./constraints/Collision'),
    Direction: require('./constraints/Direction'),
    Distance: require('./constraints/Distance'),
    Curve: require('./constraints/Curve'),
    Hinge: require('./constraints/Hinge'),
    BallAndSocket: require('./constraints/BallAndSocket'),

    Force: require('./forces/Force'),
    Drag: require('./forces/Drag'),
    RotationalDrag: require('./forces/RotationalDrag'),
    Gravity1D: require('./forces/Gravity1D'),
    Gravity3D: require('./forces/Gravity3D'),
    Spring: require('./forces/Spring'),
    RotationalSpring: require('./forces/RotationalSpring'),

    PhysicsEngine: require('./PhysicsEngine'),
    Geometry: require('./Geometry')
};
