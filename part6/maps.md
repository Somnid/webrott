Maps
====

Map loading is contained in RT_TED.C.  We can see the map loading in ReadROTTMap function inside.  We can see that a file contains multiple maps and they get read into a RTLMap object.

```c
//RT_TED, ~line: 1351, ReadROTTMap,
//...

CheckRTLVersion( filename );
filehandle = SafeOpenRead( filename );
```

At first it checks the first 4 bytes which contain the signature. This will be `RTL ` or `RTC `.  RTL is a single player level file, RTC is a COMM-BAT (multiplayer) level file.  These signatures should match the file extension.

Next it checks the next 4 bytes which contain a long.  This is checked against the greatest version the executable can handle incase the level was made for a higher version of ROTT.  The final value is 0x0101 (257) for ROTT version 1.1.

```
//
// Load map
//
lseek( filehandle, RTL_HEADER_OFFSET + mapnum * sizeof( RTLMap ), SEEK_SET );
SafeRead( filehandle, &RTLMap, sizeof( RTLMap ) );

//...
```
Into the struct:

```c
typedef struct
{
	unsigned long used;
	unsigned long CRC;
	unsigned long RLEWtag;
	unsigned long MapSpecials;
	unsigned long planestart[ NUMPLANES ];
	unsigned long planelength[ NUMPLANES ];
	char Name[ ALLOCATEDLEVELNAMELENGTH ];
} RTLMAP;
```

`used` is a boolean value that should be 1 for occupied map slots indicating that the map is to be used.  If it's 0 then an error is thrown if you try to load it.

`CRC` or Cyclic Redundancy Check is basically a hash of some sort used to make sure you are infact loading the same version of a map.  This is used both when loading save games, as well as when playing multiplayer.

The `RELWtag` is a special value used to indicate whether a map block is run-length encoded. The engine checks to see if this value equals `0x4344` for registered levels, `0x4d4b` for shareware levels and some other value for custom levels.  In shareware mode the executable will not load registered or custom maps so this also seems to function as a form of copy protection.

`MapSpecials` are bit flags that indicate special properties when loading the map but there appears to only be one valid option: `0x0001` which toggles all push walls during a multiplayer COMM-BAT game.

`NUMPLANES` is a constant of 3.  According to the handy `HACKER.TXT` included with the source code, it looks like the maps are broken into 3 planes.  The first contains walls, the second contains objects and the third contains info (music etc).  These contain the offsets and lengths of each of the 3 planes.  The planes themselves are 128 x 128 units.

`ALLOCATEDLEVELNAMELENGTH` is a constant of 24, so map names are allocated 24 characters but hacker.txt says they should be at most 22 characters.

There are 100 level slots in the RTL file but most will be unused, basically a nulled out 64 byte block. When you read the RTLMap struct, these will have used = false.

Layer Compression
-----------------

Layers are compress using a custom run-length encoding.  To read the map data block you must:
1) Read a 16-bit unsigned value
2) If that value is equal to the relw tag then read two more unsigned 16-bit values:
	1) The first is the number of times to write the value
	2) the second is the value to write
3) Otherwise write the value
4) Repeat until you have read upto the length for the layer

```js
getMap(mapNum){
	const map = this.maps[mapNum];
	const layers = new Array(3);
	for(let layerIndex = 0; layerIndex < 3; layerIndex++){
		const wallStart = map.planeStart[0];
		const wallLength = map.planeLength[0];
		const layer = allocSquareArray(128);
		let byteIndex = wallStart;
		let mapIndex = 0;
		while(byteIndex < (wallStart + wallLength)){
			const tag = this.dataView.getUint16(byteIndex, true);
			if(tag === map.relwTag){ //compressed data
				const count = this.dataView.getUint16(byteIndex + 2, true);
				const value = this.dataView.getUint16(byteIndex + 4, true);
				byteIndex += 6;
				for(let i = 0; i < count; i++){
					writeSequential(layer, mapIndex, value);
					mapIndex++;
				}
			} else { //uncompressed data
				byteIndex += 2;
				writeSequential(layer, mapIndex, tag);
				mapIndex++;
			}
		}
		layers[layerIndex] = layer;
	}
	return layers;
}
```

Map Interpretation
------------------

There's some metadata that's included in certain parts of the map data:

### Layer 1 (walls)
The first row contains data:
- [0,0] is the floor index (range: 180-195)
- [0,1] is the ceiling index (ceilings: 198-213; skies: 234-238) 
- [0,2] is the map brightness (range: 216-223)
- [0,3] is how much the light fades (range: 252-267 fast to slow)

### Layer 2 (sprites)
The first row contains data:
- [0,0] is the level height (range: 90-97; 450-457)
- [0,1] is the height of sky (range: 90-97; 450-457) 
- [0,2] indicates fog (104) or no fog (105)
- [0,3] indicates if lights illuminate walls (139)

The ranges are strange but it means it's easier to test you are reading data correctly.

Note that all of this information comes from hacker.txt.

Aside: Change Logs
------------------

There is another WAD lump called `CHNGLG` that exists in some WADs.  I was trying to figure out the difference between versions of SIGIL and apparently there is a change log in the WAD itself.  This is pretty east to read using our existing text reading capability in file-utils.js:

```
const txt = getString(dataView, 0, dataView.byteLength); //dataview containing the lump
const pre = document.createElement("pre");
pre.textContent = txt;
return pre;
```

Nice.  This thing finally came in handy!

Notes
-----
- TEd (Tile Editor) is id's tile map editor, created by John Romero.  ROTT uses TEd version 5.
- While JS devs usually don't bother, because things have known lengths I preallocate my arrays with the array constructor