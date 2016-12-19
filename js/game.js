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


/** The game.

    Parameters:
      canvas: (optional) The canvas to use.
      time: (optional) The time remaining (since EPOCH).
      max_bacteria: (optional) The maximum number of bacteria.
*/
function Game(canvas, time, max_bacteria = 10) {
  if (canvas == null) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  } else {
    this.canvas = canvas;
  }

  this.light_point = vec3.fromValues(2.0, 2.0, 2.0);
  this.light_colour = vec3.fromValues(1.0, 1.0, 1.0);

  this.sphere_resolution = 5;

  this.arc_ball = {
    centre: vec2.fromValues(this.canvas.width / 2, this.canvas.height / 2),
    radius: (Math.min(this.canvas.width, this.canvas.height) - 10) / 2.0
  };

  this.clearColor = [0.0, 0.4, 0.7, 1.0];

  this._init_gl();

  this.ball = new Sphere(this.gle, this.sphere_resolution);
  this.bacterium = [];

  this.underlay = new GameUnderlay(
      this.gle, 0, time || (new Date(new Date(0,0,0,0,5,0,999) - EPOCH)));

  this._init_view();
  this._init_projection();

  this.bacterium_ids = new Set();
  for (var i = 0; i < max_bacteria; i++) {
    this.bacterium_ids.add(i + 2);
  }

  this.max_bacteria = this.bacterium_ids.size;

  this._init_bacteria_colours();

  this._prepare_sound();

  this._set_handlers();
  this.draw();
}

/** Initializes the openGL environment.
*/
Game.prototype._init_gl = function() {
  var gl = this.canvas.getContext("webgl");

  // We should never see this though.
  gl.clearColor(this.clearColor[0],
                this.clearColor[1],
                this.clearColor[2],
                this.clearColor[3]);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  var vs_source = document.getElementById("vertex_shader").innerHTML;
  var fs_source = document.getElementById("fragment_shader").innerHTML;

  var uniforms = [
    "modelMatrix",
    "viewMatrix",
    "projectionMatrix",

    "one_colour",
    "single_colour",
    "use_texture",

    "light_point",
    "light_colour",

    "light_ambient",
    "light_diffuse",
    "light_specular",

    "tex_coord",

    "fs_texture_sampler"
  ];

  var attributes = [
    "point",
    "colour",

    "normal",
    "tex_coord"
  ];

  this.gle = new GLEnvironment(gl,
      vs_source, fs_source,
      uniforms, attributes);

  gl.useProgram(this.gle.shader);
  gl.uniform1f(this.gle.uniforms.one_colour, 0.0);
  gl.uniform1f(this.gle.uniforms.use_texture, 0.0);

  gl.disableVertexAttribArray(this.gle.attributes.tex_coord);
}

/** Initializes the view matrix.
*/
Game.prototype._init_view = function() {
  var look_from = [0.0, 0.0, 3.0];
  var look_at = [0.0, 0.0, 0.0];
  var up = [0.0, 1.0, 0.0];

  this.viewMatrix = mat4.create();
  mat4.lookAt(this.viewMatrix, look_from, look_at, up);
}

/** Initializes the projection matrix.
*/
Game.prototype._init_projection = function() {
  var fov = glMatrix.toRadian(60);
  var width = this.canvas.width;
  var height = this.canvas.height;
  var aspect = width/height;
  var near = 0.1;
  var far = 100.0;

  this.projectionMatrix = mat4.create();
  mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
}

/** Intialize the bacteria colours.
*/
Game.prototype._init_bacteria_colours = function() {
  var bacteria_colour_map = new Map();

  var id_counter = 2;

  var id_iterate = this.bacterium_ids.entries();

  for (var i = 0; i < this.bacterium_ids.size; i++) {
    var hue =  i * 360.0 / this.bacterium_ids.size;

    var stop = hsl2rgb([hue, 1.0, 0.8 - 0.2 * (i % 2)]);
    var start = hsl2rgb([hue, 1.0, 0.4 - 0.2 * (i % 2)]);

    bacteria_colour_map.set(id_iterate.next().value[0], [
      vec4.fromValues(start[0], start[1], start[2], 1.0),
      vec4.fromValues(stop[0], stop[1], stop[2], 1.0)
    ]);
  }
  this._bacteria_colour_map = bacteria_colour_map;
}

/** Draw to the canvas.

    Parameters:
      ui: (optional) If set to false the ui will not be drawn.
*/
Game.prototype.draw = function(ui=true) {
  var gle = this.gle;
  var gl = gle.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (ui) this.underlay.draw();

  gl.uniformMatrix4fv(gle.uniforms.viewMatrix, false, this.viewMatrix);
  gl.uniformMatrix4fv(gle.uniforms.projectionMatrix, false,
                      this.projectionMatrix);

  gl.uniform3fv(gle.uniforms.light_point, this.light_point);
  gl.uniform3fv(gle.uniforms.light_colour, this.light_colour);

  this.ball.draw();

  this.bacterium.forEach(function(bacteria){
    bacteria.draw();
  }, this);
}

/** Draw fake colours.

    Note:
      Usefull for checking things.
*/
Game.prototype.false_draw = function() {
  var gle = this.gle;
  var gl = gle.gl;

  gl.uniform1f(gle.uniforms.one_colour, 1.0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.draw(false);
  gl.clearColor(this.clearColor[0],
                this.clearColor[1],
                this.clearColor[2],
                this.clearColor[3]);
  gl.uniform1f(gle.uniforms.one_colour, 0.0);
}

/** Gets the next id available.

    Returns:
      An integer id not used by anything else.
*/
Game.prototype._next_id = function() {
  var bucket = Array.from(this.bacterium_ids);
  var id = bucket[Math.floor(Math.random() * bucket.length)];

  this.bacterium_ids.delete(id);
  return id;
}

/** Updates the count down time.
*/
Game.prototype._update_time = function() {
  if (this.last_time == null) return;

  var now = new Date();

  var time_difference = (now - this.last_time);
  var new_time_remaining = new Date(this.underlay.time - time_difference);

  if (time_difference > 1000 ||
      new_time_remaining.getMilliseconds() <
          this.underlay.time.getMilliseconds()) {
    this.underlay.update();
  }

  this.underlay.time = new_time_remaining;
  if (this.underlay.time < TIME_ZERO) {
    this.underlay.time = TIME_ZERO;
  }

  this.last_time = now;
}

/** Spawns new bacteria if permitted.
*/
Game.prototype._spawn_bacteria = function() {
  var frequency = 64;
  var radius = 0.05;

  if (Math.random() < 1.0 / frequency &&
      this.bacterium.length < this.max_bacteria) {
    var r = vec3.fromValues(Math.random() - 0.5,
                            Math.random() - 0.5,
                            Math.random() - 0.5);
    vec3.normalize(r, r);

    var id = this._next_id();
    var colours = this._bacteria_colour_map.get(id);

    var bacteria = new Sphere(this.gle,
                              this.sphere_resolution,
                              r,
                              radius,
                              colours[0],
                              colours[1],
                              undefined,
                              undefined,
                              0.02);
    bacteria.id = id;

    var pole = vec3.fromValues(0.0, 0.0, 1.0);

    if (!vec3.equals(r, pole)) {
      var axis = vec3.cross(vec3.create(), pole, r);
      vec3.normalize(axis, axis);

      var angle = Math.acos(vec3.dot(pole, r));
      bacteria.rotation = mat4.rotate(mat4.create(), mat4.create(),
                                      angle, axis);
      bacteria.buildModel();
    }

    this.bacterium.push(bacteria);
  }
}

/** Grows any small bacteria.
*/
Game.prototype._grow_bacteria = function() {
  var plus_scalar = 0.00008;
  var plus = vec3.fromValues(plus_scalar, plus_scalar, plus_scalar);
  var maximum= plus_scalar *  5000;

  this.bacterium.forEach(function(bacteria){
    if (bacteria.scale[0] < maximum) {
      vec3.add(bacteria.scale, bacteria.scale, plus);
      bacteria.buildModel();
    }
  });
}

/** Builds a tick function, to be called repeatedly.
*/
Game.prototype.build_tick = function() {
  var game = this;

  var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozrequestAnimationFrame ||
      window.webkitrequestAnimationFrame ||
      window.orequestAnimationFrame;

  var tick = function() {
    game._update_time();
    game._spawn_bacteria();
    game._grow_bacteria();
    game.draw();
    requestAnimationFrame(tick);
  }

  return tick;
}

/** Builds the click handler for the canvas.

    Returns:
      A function to be used as the click handler on the canvas.
*/
Game.prototype.build_click = function() {
  var game = this;
  var gl = this.gle.gl;

  return function(event) {
    var offset = element_offset(event.target);
    var x = event.clientX - offset.x;
    var y = event.target.height - (event.clientY - offset.y);

    var colour = new Uint8Array(4);
    game.false_draw();
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, colour);

    var id = colour2id(colour);

    var hit = false;

    for (var i = 0; i < game.bacterium.length; i++){
      if (game.bacterium[i].id == id){
        hit = true;
        game.bacterium.splice(i, 1);
        game.bacterium_ids.add(id);
        if (game.underlay.time > TIME_ZERO) game.underlay.score++;
        game.underlay.update();
        break;
      }
    }
    if (hit) {
      game.sound.hit.currentTime = 0;
      game.sound.hit.play();
    } else {
      game.sound.miss.currentTime = 0;
      game.sound.miss.play();
    }
    game.draw();
  };
}

/** Builds the mouse down handler for the canvas.

    Returns:
      A function to be used as the mousedown handler on the canvas
*/
Game.prototype.build_mousedown = function() {
  var game = this;
  var arc_ball = this.arc_ball;

  return function(event) {
    if (event.button == 2){

      var offset = element_offset(event.target);

      var height = event.target.height;

      var point = {
        x: (event.clientX - offset.x) - arc_ball.centre[0],
        y: (height - (event.clientY - offset.y)) - arc_ball.centre[1],
        z: 0
      };

      arc_ball.matrix_stash = mat4.copy(mat4.create(), game.viewMatrix);

      var d2 = point.x * point.x + point.y * point.y;
      var r2 = arc_ball.radius * arc_ball.radius;
      if (d2 < r2){
        point.z = Math.sqrt(r2 - d2);
      }

      arc_ball.start = vec3.fromValues(point.x, point.y, point.z);
      vec3.normalize(arc_ball.start, arc_ball.start);
    }
  }
}

/** Builds the mouse move handler for the canvas.

    Returns:
      A function to be used as the mousemove handler on the canvas.
*/
Game.prototype.build_mousemove = function() {
  var game = this;
  var arc_ball = this.arc_ball;

  return function(event) {
    if ((event.buttons & 2) == 2 && arc_ball.start != null) {
      var offset = element_offset(event.target);

      var height = event.target.height;

      var point = {
        x: (event.clientX - offset.x) - arc_ball.centre[0],
        y: (height - (event.clientY - offset.y)) - arc_ball.centre[1],
        z: 0
      };

      var d2 = point.x * point.x + point.y * point.y;
      var r2 = arc_ball.radius * arc_ball.radius;
      if (d2 < r2){
        point.z = Math.sqrt(r2 - d2);
      }

      arc_ball.end = vec3.fromValues(point.x, point.y, point.z);
      vec3.normalize(arc_ball.end, arc_ball.end);

      var axis = vec3.cross(vec3.create(), arc_ball.start, arc_ball.end);
      var angle = Math.acos(vec3.dot(arc_ball.start, arc_ball.end));

      if (vec3.equals(arc_ball.start, arc_ball.end)) {
        mat4.copy(game.viewMatrix, arc_ball.matrix_stash);
      } else {
        var transform = mat4.create();

        // Translate into ball.
        var translate_in = mat4.translate(mat4.create(), mat4.create(),
                                          vec3.fromValues(0.0, 0.0, 3.0));

        var rot = mat4.rotate(mat4.create(), mat4.create(), angle, axis);

        // Translate out of ball.
        var translate_out = mat4.translate(mat4.create(), mat4.create(),
                                           vec3.fromValues(0.0, 0.0, -3.0));


        mat4.mul(transform, translate_in, transform);
        mat4.mul(transform, rot, transform);
        mat4.mul(transform, translate_out, transform);
        mat4.mul(game.viewMatrix, transform, arc_ball.matrix_stash);
      }
    }
  }
}

/** Builds the mouse up handler for the canvas.

    Returns:
      A function to be used as the mouseup handler on the canvas.
*/
Game.prototype.build_mouseup = function() {
  var arc_ball = this.arc_ball;
  return function(event) {
    if ((event.button & 2) == 2){
      arc_ball.start = undefined;
    }
  }
}

/** Builds the context menu handler for the canvas.

    Returns:
      A function to be used as the contextmenu handler on the canvas.
*/
Game.prototype.build_contextmenu = function() {
  return function(event) { event.preventDefault(); };
}

/** Adds the handlers to the canvas.
*/
Game.prototype._set_handlers = function() {
  this.canvas.addEventListener('click', this.build_click());
  this.canvas.addEventListener('mousemove', this.build_mousemove());
  this.canvas.addEventListener('contextmenu', this.build_contextmenu());
  this.canvas.addEventListener('mousedown', this.build_mousedown());
  this.canvas.addEventListener('mouseup', this.build_mouseup());
}

/** Prepares the sound items.
*/
Game.prototype._prepare_sound = function() {
  this.sound = {};
  this.sound.hit = document.getElementById("hit");
  this.sound.miss = document.getElementById("miss");
}

/** Starts the game loop.
*/
Game.prototype.start = function() {
  this.last_time = new Date();
  this.build_tick()();
}
