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

define( [
    'famous/physics/bodies/Particle',
    'famous/physics/bodies/convexBodyFactory',
    'famous/physics/bodies/Box',
    'famous/physics/bodies/Sphere',
    'famous/physics/bodies/Wall',

    'famous/physics/constraints/Constraint',
    'famous/physics/constraints/Angle',
    'famous/physics/constraints/Collision',
    'famous/physics/constraints/Direction',
    'famous/physics/constraints/Distance',
    'famous/physics/constraints/Curve',
    'famous/physics/constraints/Hinge',
    'famous/physics/constraints/BallAndSocket',

    'famous/physics/forces/Force',
    'famous/physics/forces/Drag',
    'famous/physics/forces/RotationalDrag',
    'famous/physics/forces/Gravity1D',
    'famous/physics/forces/Gravity3D',
    'famous/physics/forces/Spring',
    'famous/physics/forces/RotationalSpring',

    'famous/physics/PhysicsEngine',
    'famous/physics/Geometry'
    ], function ( Particle, convexBodyFactory, Box, Sphere, Wall, Constraint, Angle, Collision, Direction, Distance, Curve, Hinge, BallAndSocket, Force, Drag, RotationalDrag, Gravity1D, Gravity3D, Spring, RotationalSpring, PhysicsEngine, Geometry ) {

return {
    Particle: Particle,
    convexBodyFactory: convexBodyFactory,
    Box: Box,
    Sphere: Sphere,
    Wall: Wall,

    Constraint: Constraint,
    Angle: Angle,
    Collision: Collision,
    Direction: Direction,
    Distance: Distance,
    Curve: Curve,
    Hinge: Hinge,
    BallAndSocket: BallAndSocket,

    Force: Force,
    Drag: Drag,
    RotationalDrag: RotationalDrag,
    Gravity1D: Gravity1D,
    Gravity3D: Gravity3D,
    Spring: Spring,
    RotationalSpring: RotationalSpring,

    PhysicsEngine: PhysicsEngine,
    Geometry: Geometry
};
});
