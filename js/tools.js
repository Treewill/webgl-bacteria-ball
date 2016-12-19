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


/** The begining of time (as JS views it).
*/
var EPOCH = new Date(0, 0, 0, 0, 0, 0, 0);

/** A Time difference of zero.
*/
var TIME_ZERO = new Date(EPOCH - EPOCH);

/** Converts an id to a colour suitable for OpenGL.

    Parameters:
      id: The id to convert.

    Returns:
      A vec4 with the colour for the id.
*/
function id2colour(id) {
  if (id > 2<< (8 * 3)) return vec4.fromValues(0.0, 0.0, 0.0, 1.0);
  var a = (id >> (8 * 0)) & (255);
  var b = (id >> (8 * 1)) & (255);
  var c = (id >> (8 * 2)) & (255);
  return vec4.fromValues(a / 255.0, b / 255.0, c / 255.0, 1.0);
}

/** Converts a colour from OpenGL to an id.

    Parameters:
      colour: The colour to convert.

    Returns:
      An integer id.
*/
function colour2id(colour) {
  return (colour[0] << (8 * 0)) |
         (colour[1] << (8 * 1)) |
         (colour[2] << (8 * 2));
}

/** Converts a colour in hsl to rgb.

    Parameters:
      hsl: The colour in hsl.

    Returns:
      The colour in RGB.
*/
function hsl2rgb(hsl) {
  var h = hsl[0];
  var s = hsl[1];
  var l = hsl[2];


  var hp = h / 60;
  var f = Math.floor(hp);
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs(hp % 2 - 1));
  var m = l - 0.5 * c;

  var r = m;
  var g = m;
  var b = m;

  switch(f) {
    case 0:
      r += c;
      g += x;
      break;
    case 1:
      r += x;
      g += c;
      break;
    case 2:
      g += c;
      b += x;
      break;
    case 3:
      g += x;
      b += c;
      break;
    case 4:
      r += x;
      b += c;
      break;
    case 5:
      r += c;
      b += x;
      break;
  }

  return [r, g , b];
}
