import { allocBlockArray } from "./array-utils.js";
import { IndexBitmap } from "../components/index-bitmap.js";
import { wolfPallet } from "../lib/wolf-utils.js";

export function loadAsset(file, name, type){
	const asset = file.getAsset(name);
	switch(type){
		case "wall": {
			const element = new IndexBitmap();
			element.height = 64;
			element.width = 64;
			element.setBitmap(loadWall(asset));
			element.setPallet(wolfPallet);
			return element;
		}
	}
}

function loadWall(asset){
	const dataView = new DataView(asset);
	const height = 64;
	const width = 64;

	const bitmap = allocBlockArray(width, height);
	let i = 0;

	for(let row = 0; row < height; row++){
		for(let col = 0; col < width; col++){
			bitmap[row][col] = dataView.getUint8(i);
			i += 1;
		}
	}

	return bitmap;
}