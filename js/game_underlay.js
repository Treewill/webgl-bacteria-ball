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


/** The game's underlay.

    Parameters:
      gle: The openGL evnironment object to draw to.
      score: The current score.
      time: The time remaining for the game (since EPOCH).
*/
function GameUnderlay(gle, score, time) {
  this.gle = gle;
  var gl = gle.gl;

  this.gl_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.gl_texture);

  this._canvas = document.createElement("canvas");

  this._prepare_canvas();

  this.update(score, time);

  this.buffers = {};
  this._init_points();
  this._init_uv();
}

/** Prepares the offscreen canvas.
*/
GameUnderlay.prototype._prepare_canvas = function() {
  var canvas = this.gle.gl.canvas;

  var max_side = Math.max(canvas.width, canvas.height);

  var side;
  for (side = 1; side < max_side; side = side << 1);

  this._canvas.width = side;
  this._canvas.height = side;
}

/** Prepares the points buffer.
*/
GameUnderlay.prototype._init_points = function() {
  var gl = this.gle.gl;

  this.buffers.points = {};
  this.buffers.points.gl_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.points.gl_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0, 1.0, 1.0,
       1.0, -1.0, 1.0, 1.0,
       1.0,  1.0, 1.0, 1.0,

      -1.0, -1.0, 1.0, 1.0,
       1.0,  1.0, 1.0, 1.0,
      -1.0,  1.0, 1.0, 1.0
      ]), gl.STATIC_DRAW);
}

/** Prepares the uv (texture coordinates) buffer.
*/
GameUnderlay.prototype._init_uv = function() {
  var gl = this.gle.gl;

  var width = this.gle.gl.canvas.width * 1.0 / this._canvas.width;
  var bottom =  1 - (this.gle.gl.canvas.height * 1.0 / this._canvas.width);

  this.buffers.uv = {};
  this.buffers.uv.gl_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv.gl_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, bottom,
      width, bottom,
      width, 1.0,

      0.0, bottom,
      width, 1.0,
      0.0, 1.0
      ]), gl.STATIC_DRAW);
}

/** Updates the underlay contents.

    Parameters:
      score:  (optional) The current score.
      time: (optional) The time remaining (since EPOCH).

    Note:
      This must be called to observe any change in the draw.
*/
GameUnderlay.prototype.update = function(score, time) {
  if (score != null) this.score = score;

  this.time = time || this.time;

  var gle = this.gle;
  var gl = gle.gl;

  var ctx = this._canvas.getContext("2d");

  ctx.fillStyle = "#06b";
  ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

  ctx.fillStyle = "#0a1";
  ctx.font = "bold 48px sans-serif";
  ctx.fillText("SCORE: " + this.score, 10, 45);

  var minutes = ("0" + this.time.getMinutes())
  var seconds = ("0" + this.time.getSeconds());

  if (minutes.length > 2) minutes = minutes.substring(1);
  if (seconds.length > 2) seconds = seconds.substring(1);

  ctx.fillText("TIME: " + minutes + ":" + seconds, 10, gl.canvas.height - 15);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                this._canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                   gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(gle.uniforms.fs_texture_sampler, 0);
}

/** Draws the underlay to the openGL environment.
*/
GameUnderlay.prototype.draw = function() {
  // There are some cheap tricks here because
  // we know a lot about the state of the program
  // coming in here.

  // This will likey break if you change anything about
  // the rendering of something else.

  var gle = this.gle;
  var gl = gle.gl;

  // Setup GL environment for UI.
  Object.keys(gle.attributes).forEach(function(attribute) {
    gl.disableVertexAttribArray(attribute);
  });

  gl.enableVertexAttribArray(gle.attributes.tex_coord);
  gl.enableVertexAttribArray(gle.attributes.point);

  gl.disable(gl.DEPTH_TEST);
  gl.uniform1f(gle.uniforms.use_texture, 1.0);

  // Rendering ....
  var eye = mat4.create();

  gl.uniformMatrix4fv(gle.uniforms.modelMatrix, false, new Float32Array(eye));

  gl.uniformMatrix4fv(gle.uniforms.viewMatrix, false, new Float32Array(eye));

  gl.uniformMatrix4fv(gle.uniforms.projectionMatrix, false,
                      new Float32Array(eye));

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.points.gl_buffer);
  gl.vertexAttribPointer(gle.attributes.point, 4, gl.FLOAT, false, 0, 0);

  // Need these set but we are ignoring them.
  gl.vertexAttribPointer(gle.attributes.colour, 4, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(gle.attributes.normal, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv.gl_buffer);
  gl.vertexAttribPointer(gle.attributes.tex_coord, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Restoring old GL environment.
  gl.uniform1f(gle.uniforms.use_texture, 0.0);
  gl.enable(gl.DEPTH_TEST);

  Object.keys(gle.attributes).forEach(function(attribute) {
    gl.enableVertexAttribArray(attribute);
  });
  gl.disableVertexAttribArray(gle.attributes.tex_coord);
}
