import { getString, trimString } from "./file-utils.js";

const numMaps = 100;

export class MapHeadFile {
	constructor(arrayBuffer){
		this.dataView = new DataView(arrayBuffer);
		this.relwTag = this.dataView.getUint16(0, true); //must be 0xABCD
		this.headerOffsets = new Array(numMaps);
		for(let i = 0; i < numMaps; i++){
			this.headerOffsets[i] = this.dataView.getUint32(2 + (i * 4),true);
		}
	}
}

export class GameMapsFile {
	constructor(arrayBuffer) {
		this.dataView = new DataView(arrayBuffer);
		this.signature = getString(this.dataView, 0, 8);
	}
	getMap(offset){
		return {
			planeStarts : [
				this.dataView.getUint32(offset, true),
				this.dataView.getUint32(offset + 4, true),
				this.dataView.getUint32(offset + 8, true)
			],
			planeLengths : [ //these are compressed 
				this.dataView.getUint16(offset + 12, true), 
				this.dataView.getUint16(offset + 14, true),
				this.dataView.getUint16(offset + 16, true)
			],
			height: this.dataView.getUint16(offset + 18, true),
			width: this.dataView.getUint16(offset + 20, true),
			name: trimString(getString(this.dataView, offset + 22, 16))
		}
	}
}