Maps Part 2
===========

Out of curiosity I wanted to find out how close the ROTT level format is to Wolfenstien 3D.  So let's look at that.

Wolfenstien 3D
--------------

Wolfensien map files are made up of a couple game files, `MAPHEAD.{ext]` which contains some offset into the meat of the map data which is in `GAMEMAPS.{ext}`. `ext` here can be a number of different things depending on the version of Wolfenstien 3D you are running.  `WL1` is the demo version (episode 1), `WL3` is the registered version (episodes 1-3), `WL6` is the full version with all 6 episodes, `SDM` is the demo of Spear of Destiny (levels 1-2), and `SOD` is the full Spear of Destiny (leves 1-21).  Maps have somewhat familiar properties:

```C
typedef struct
{
	unsigned	RLEWtag;
	long		headeroffsets[100];
	byte		tileinfo[];
} mapfiletype;

typedef	struct
{
	long		planestart[3];
	unsigned	planelength[3];
	unsigned	width,height;
	char		name[16];
} maptype;
```
While looking into this I found more interesting tidbits about TeD and this explains some of the weirdness in the structs.  First is the RLEW tag which for all iD games is always `0xabcd` (not so in ROTT!). There is space for 100 levels which is how many TeD can allocate, Wolfenstien is hardcoded to use only 60 which is how many appear in the original game with all 6 episodes.  The offset also indicate unused levels.  An offset of `0` means the level is not used, however in some other iD games that offset might be `0FFFFFFFF` instead.  Lastly we have the `tileinfo[]` array.  This is something TeD adds in certain games, in Wolfenstien it is unused, the total `MAPHEAD` files size is 402 bytes, 100 offsets plus the RELW tag.

`GAMEMAPS` has 3 planes as exported from TeD but only 2 are used for Wolfenstien.  The size is always 64x64 and the names for the shareware episode maps will look like `Wolf1 Map1`, `Wolf1 Boss`, `Wolf1 Secret` etc.  Note that version 1 of Wolfenstien calls this file `MAPTEMP.{ext}`.  My understanding is that this is an uncompressed working version of the map file and used by some games edited with TeD.  Taking a look at some of my Apogee games it's a toss-up if it's `GAMEMAPS` or `MAPTEMP`.

So what we do is first read in `MAPHEAD`, get the relw tag and grab 100 offsets.  We can filter out the offsets that are 0 and we are left with offsets to actual levels.  Using `GAMEMAPS` we read from the offset of the level and grab all the `maptype` data. 

```js
if(e.target.files.length === 2 && (extension === "wl1" || extension === "wl3" || extension == "wl6" || extension === "sdm" || extension === "sod")){
	const headerArrayBuffer = await readFile(files[files.findIndex(f => getName(f.name) === "maphead")]);
	const mapArrayBuffer = await readFile(files[files.findIndex(f => getName(f.name) === "gamemaps")]);
	this.maphead = new MapHeadFile(headerArrayBuffer);
	this.mapFile = new GameMapsFile(mapArrayBuffer);
	this.dom.entries.innerHTML = "";
	let index = 0;
	for(let offset of this.maphead.headerOffsets.filter(ho => ho !== 0)){
		const map = this.mapFile.getMap(offset);
		const thisIndex = index;
		const tr = document.createElement("tr");
		tr.addEventListener("click", () => this.loadMap(thisIndex, "wolf"));
		const indexCell = document.createElement("td");
		indexCell.textContent = index + 1;
		const nameCell = document.createElement("td");
		nameCell.textContent = map.name;
		tr.appendChild(indexCell);
		tr.appendChild(nameCell);
		this.dom.entries.appendChild(tr);
		index++;
	}
}
```

We need to modify the map-reader to accept new file types and take multiple files in the case of Wolfenstien.  Since we'll be able to read TeD map types it should not be hard to add more support for games like Blake Stone (which I might look into).

Carmak Encoding
---------------


Notes:
------

- Wolfenstien maps are signed with TeD5 version 1.0.
- The Wolfenstien source has a variable called `tinf`, this confused me at first but I think it stands for "tileInfo"
- rtl-map was renamed to rott-map

Sources:
-------

- http://gaarabis.free.fr/_sites/specs/wlspec_index.html (Wolf3d File Specs)
- http://www.shikadi.net/moddingwiki/GameMaps_Format (TeD file info)