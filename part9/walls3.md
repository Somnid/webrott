Walls 3
=======

Etch-a-sketch maps are cool but I think it's time to add a little bit more.  Going further will likely require merging the functionality of map-reader and wad-reader so that we can add the visuals.  But as a baby step let's keep going with Wolfenstien, after all this is going to be the easy case.  To get Wolfenstien assets we need to look into `VSWAP.{ext}`.

VSWAP
-----

`VSWAP` first starts with a header with the following info:

```
chunksInFile (16-bits)
spriteStart (16-bits)
soundStart (16-bits)
```

`chunksInFile` is the number of assets with a "chunk" being similar to a WAD "lump."  `spriteStart` and `soundStart` are offsets that tell us where the data of each type starts.  Next there are 2 arrays of data:
```
offsets (chunksInFile * 32-bits)
lengths (chunksInFile * 16-bits)
```

These contain the offsets and length for each asset and there are `chunksInFile` many of them.  This should give us enough data to find a particular asset.

Aside: Visual Aides
-------------------

I create a visual aide for sprites located in `visual-aids` directory.  This was mainly copying the `doom-image` code and instead of exporting a canvas image, I built it into a table where I can add overlays and other fancy stuff if necessary.  That component is called `table-pic`. To make things simpler I also exported the binary lumps for the `PLAYPAL` pallets and `TROOA1` image.  `table-pic` take in the url of both as attributes and fetches them.  It then renders the image and adds handy guides and indexes to make it easier to follow.  Building and revisiting the Doom sprite code definely gave me so ideas for how to make the code simplier, especially now that I've touched maps. For one, using an intermediate format of an index-pallet bitmap.  This is used in the map rendering code, but also in images.  If I were to carry things around internally in that format I might need to do less duplication of rendering code.

I'll probably start doing some more visual aides but I'm not sure what exactly.  Probably anything I, myself, have trouble visualizing, especially when I come back to it.

Also, here's the code snippet I used to export the lumps:

```js
window.dvToFile = function dvtoFile(dataView, length, offset = 0, name){
    length = length ?? dataView.byteLength;
    const blob = new Blob([dataView.buffer.slice(offset + dataView.byteOffset, offset + dataView.byteOffset + length)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name ?? "asset";
    a.click();
}
```
This operates on `DataViews`s which is why there's some extra offsetting.  A data view is just a view into an array buffer but we need the acutal array buffer to build the file.  So we grab the dataView's offset on the arraybuffer plus any offset from there as well as the lenght if necessary.  A trick to download files with js is to construct a link with the download attribute and programatically click it.  So what I do is use the debugger to stop at the start of the code generating the image and use this snippet to download the binary data.  I don't need a real tool to do this yet.

Notes:
------

- For some reason my `doom-image` component got corrupted and was never working in all chapters.  I had to fix it.
- allocBlockArray had a bug reading from the wrong dimension.  Since the previous blocks were square it didn't matter but I fixed it while making the visual aids for images.

Sources:
-------

- https://devinsmith.net/backups/bruce/wolf3d.html