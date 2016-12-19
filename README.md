Bacterial Ball
==============

About
-----

This is a sample game just to show a simple webgl application.
It was really motivated by an assignment a friend was working on.

Currently implemented features:
  - 3D Projection (as opposed to orthographic)
  - Arc-ball
  - Specular reflection (single light)
  - Diffuse reflection (single light)
  - Texture Mapping (the interface underlay)
  - Object click detection
  - Click sounds

The whole web page is designed to be run off a desktop computer
without the need for a web server.

The Game
--------

A planet far far away is being attacked by alien bacteria. Your
mission should you choose to accept it is to help defend the
planet by shooting your high energy laser at the bacteria.
The laser beam is so strong that it is not visible to the naked
eye and will vaporize the bacteria in a single shot. You need
only to defend the planet for 5 minutes while the home species
evacuates.

Requirements
------------

A computer with a browser with canvas and WebGL.
Though you may find that your browser may struggle with some
WebGL operations. So you may need to use another browser.

Tested configurations:
  - Works on Google Chrome 55 on Ubuntu 16.04.
  - Struggles on FireFox 50.1 on Ubuntu 16.04
    (still playable, not as enjoyable).

LICENSE
-------

The code provided has the licenses in each file.
The MIT License is used for both gl-matrix and
this code.

Shortcomings:
-------------
A few things I would probably work on to some extent:
  - Separate the model from the object
    (Reduce the number of identical buffers).
  - Use a separate shader for the interface
    (The interface doesn't care about anythin the others do).
  - Rewrite the audio system because of CORS on a local
    system this may prove difficult.
  - Turn on depth and alpha blending for the interface.
    This means that it could be somewhere in the world
    rather than the backdrop.
  - Maybe use a NPOT texture because gigantic textures
    are rather wasteful. Perhaps even figure out how to
    render directly.

Extension Ideas:
----------------
A few things that would sound fun to add:
  - Losing score for striking the sphere.
  - Particle effects on shot (or some special event).
  - Aliens evacuating int the background.
  - Different screens within the game (More UI in general).
  - Custom cursor.
  - Laser effect (view bob or flash). You may need to update
    the story.
  - Texturing things (Might be difficult see [Map Projection](https://en.wikipedia.org/wiki/Map_projection)).


