import { allocBlockArray } from "./array-utils.js";
import { loadWall } from "./ted-asset.js";
import { extractPallets } from "./wad-asset.js";

export function loadSprite(asset) {
	const dataView = asset instanceof DataView ? asset : new DataView(asset);

	const origSize = dataView.getUint16(0, true);
	const width = dataView.getUint16(2, true);
	const height = dataView.getUint16(4, true);
	const left = dataView.getUint16(6, true);
	const top = dataView.getUint16(8, true);
	const columnOffsets = new Array(width);

	for (let col = 0; col < width; col++) {
		columnOffsets[col] = dataView.getUint16(10 + (col * 2), true);
	}
	let index = 10 + (width * 2);

	const bitmap = allocBlockArray(width, height);

	for (let col = 0; col < width; col++) {
		while (true) {
			let rowStart = dataView.getUint8(index);
			index += 1;
			if (rowStart === 255) break;

			const pixelCount = dataView.getUint8(index);
			index += 1;

			//draw post spans
			for (let row = rowStart; row < rowStart + pixelCount; row++) {
				const palletIndex = dataView.getUint8(index);
				index += 1;

				bitmap[row][col] = palletIndex;
			}
		}
	}

	return bitmap;
}

export function extractWalls(wad) {
	let isWalls = false;
	const walls = [];
	for(let i = 0; i < wad.entries.length; i++){
		const entry = wad.entries[i];

		if(entry.name === "WALLSTOP") break;
		if(isWalls){ //should always be 4096 unless wall is missing
			if(entry.size == 0){
				walls.push(null);
			} else {
				const wall = new DataView(wad.arrayBuffer, entry.offset, entry.size);
				walls.push(loadWall(wall));
			}
		}
		if(entry.name === "WALLSTRT") isWalls = true;
	}
	return walls;
}

export function getPallets(wad) {
	const palletData = wad.getByName("PAL");
	return extractPallets(palletData);
}

export function loadMap(map) {
	const height = map[0].length;
	const width = map[0][0].length;
	const tileMap = allocBlockArray(height, width);

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const value = map[0][row][col];

			if(value >= 1 && value <= 32){ //walls
				tileMap[row][col] = value - 1;
			} else if(value >= 36 && value <= 45){ //more walls
				tileMap[row][col] = value - 4;
			} else if(value === 46){    //what's this?
				tileMap[row][col] = 73;
			} else if (value >= 49 && value <= 71) { //walls?
				tileMap[row][col] = value - 9;
			} else if (value >= 80 && value <= 89){
				tileMap[row][col] = value - 16;
			}
		}
	}

	return tileMap;
}