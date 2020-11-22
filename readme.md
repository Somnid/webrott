Webrott
=======

Webrott is my first attempt at source porting an old game.  I have no real expectations of finishing but I'd like to explore and learn about it.  To that end, it's split up like a series of blog posts where each good working session has some learnings and updated code.

Rise of the Triad (ROTT) was released in 1994 by Apogee.  It's a very interesting game especially for the time but not very well known as it didn't look or play as well as Doom but had many unique ideas like multiple playable characters, rudimentary room-over-room, and a bizzar sense of humor.  You take the role of a strike team who must infultrate an island full of cultists and robots to take down their leader, the evil El Oscuro.  It runs on a updated version of the Wolfenstein 3D engine with a couple of things stolen from the Doom engine (making it more manageable for me because documentation is more plentiful for those).  Interestingly, it started as a Wolfenstien 3d sequel Wolfenstien II: Rise of the Triad before Id decided to pull the license from Apogee.  The engine was released as open source so I can probe it. My C and x86 assembly are weak and all I know about how the inner workings of those old computers I learned from Fabien Sanglard's excellent [Game Engine Black Book](https://www.amazon.com/Game-Engine-Black-Book-DOOM/dp/1099819776) series, in fact that's part of my inspiration to try.

Anyhoo, there aren't any good ways to play it these days, the best source port, Winrott, is very buggy so you're pretty much stuck with DOSBOX and that's just ugly.  Maybe someday this could be something, or at least more documentation for others.  Also, since it shares a lot of code with other games of the era (like Doom), my plan is to explore those as well because it's interesting.

By the way, I've added some shareware/freeware asset files in the repo because they make for good testing.  Please play them and buy the retail games!

You can find the source code here: https://github.com/videogamepreservation/rott

Table of Contents
-----------------

- [Part 1 - The Wad Format](part1/wad.md) (Doom, ROTT)
- [Part 2 - Reading Walls: A First Attempt](part2/walls.md) (Doom, ROTT)
- [Part 3 - Reading Pallets](part3/pallets.md) (Doom, ROTT)
- [Part 4 - Reading Walls 2: We Have Color](part4/walls2.md) (Doom, ROTT)
- [Part 5 - Reading Sprites](part5/sprites.md) (Doom, ROTT)
- [Part 6 - Reading Maps](part6/maps.md) (ROTT)
- [Part 7 - Reading Maps 2: Wolfenstien](part7/maps2.md) (Wolfenstien 3D, ROTT)
- [Part 8 - Reading Maps 3: Carmack Compression](part8/maps3.md) (Wolfenstien 3D)
- [Part 9 - Reading Walls 3: Wolfenstien](part9/walls3.md) (Wolfenstien 3D)
- [Part 10 - Reading Sprites 2: Wolfenstien](part10/sprites2.md) (Wolfenstien 3D)
- [Part 11 - Reading Maps 4: Putting it together](part11/maps4.md) (Wolfenstien 3D)
- [Part 12 - Performance 1: Map Views](part12/perf1.md) (Wolfenstien 3D)
- [Part 13 - EXE Compression](part13/compression.md) (Blake Stone: Aliens of Gold)
- [Part 14 - Reading Pallets 2: EXE Compression, Binary Diffing, and Pallet Sniffing](part14/pallets2.md) (Blake Stone: Aliens of Gold)
- [Part 15 - Reading Maps 5: ROTT Textures](part15/maps5.md) (Blake Stone: AOG, ROTT)
- [Part 16 - Reading Walls 4: Masked Walls](part16/walls4.md) (ROTT)
- [Appendix: Intepreting Binary Data](appendix/datatypes.md)
- [Appendix: ROTT Plane 0 Tiles](appendix/rott-plane0-tiles.md)
- [Appendix: ROTT Plane 1 Tiles](appendix/rott-plane1-tiles.md)
- [Appendix: ROTT Plane 2 Tiles](appendix/rott-plane2-tiles.md)

Working with the code
---------------------

Code is copy-pasted per chapter so it's easy to reference (and diff) without switching branches.  I intend to keep this setup until it becomes unmanageable.  In general, code in previous chapters will not be modified in updates to preserve the journey of learning.  I'll only fix it if it plain doesn't work as originally intended.  There are other folders with visual aids, data and shared files like CSS styles.  These will be updated as I add features and won't be subject to lots of duplication.  I will review previous posts to see if I can explain things better or correct mistakes that might mislead readers.  While I want it to read like a jounery, it's more important that any info is accurate so others can use it as a guide.

To run the project, simply run `npm start` (you must install node: https://nodejs.org/en/) in the root directory using the terminal. Node is only required to run the basic dev server, and all it does is serve static files to the web browser on localhost. You can use your own static server if you have a different one you like. I'm not going to use a build process or framework, everything is vanilla js, but I will leverage web components so you may want to brush up on those if you are unfamilar.  I also will not be using existing libraries or transpiling code, everything is written from scratch using VSCode and debugged in Chrome (browser support is not a priority but it's very unlikely I'll utilize APIs that don't have wide support). I generally won't dive as deep into the js parts, so definitely checkout MDN to understand how some of these APIs work. I'm also going for readability over performance because this is a learning exercise. 

Anyway, once the file server is running, just navigate to the html file you want.

A Native Implementation
-----------------------

I have a sister project called `rustrott` which will deal with native code and perhaps approach things in a different way.  Hopefully, spirit-willing, they will meet in the middle one day with WASM.  While it is not likely to receive as much attention from me, feel free to keep an eye on it.

https://github.com/ndesmic/rustrott


Sources
-------

- Rise of the Triad was almost a Wolfenstien sequel: https://www.dualshockers.com/rise-of-the-triad-wolfenstein-sequel-pc/
- MDN: https://developer.mozilla.org/en-US/docs/Web