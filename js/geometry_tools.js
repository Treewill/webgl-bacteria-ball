"use strict";

// MIT License

// Copyright (c) 2016 Trevor Barnwell

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


/** Generates the vector(3) from the
    spherical co-ordinates with radius 1.

    Parameters:
      theta: The anngle off the Y-pole (theta in [-pi/2, pi/2]).
      phi: The angle in the x/z plane (phi in [0, 2*pi)).

    Returns:
      A vec3 in the direction requested.
*/
function sphere_vector3(theta, phi) {
  var retval = vec3.fromValues(
    Math.cos(theta) * Math.sin(phi),
    Math.cos(phi),
    Math.sin(theta) * Math.sin(phi)
  );
  return retval;
}

/** Generates the point from the
    spherical co-ordinates with radius 1.

    Parameters:
      theta: The anngle off the Y-pole (theta in [-pi/2, pi/2]).
      phi: The angle in the x/z plane (phi in [0, 2*pi)).

    Returns:
      A vec4 with the point on the sphere.
*/
function sphere_vector(theta, phi) {
  var retval = vec4.fromValues(
    Math.cos(theta) * Math.sin(phi),
    Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    1.0
  );
  return retval;
}
