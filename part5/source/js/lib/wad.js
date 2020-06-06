import { getPaddedString } from "./wad-utils.js";

export class Wad {
	constructor(arrayBuffer){
		this.arrayBuffer = arrayBuffer;
		this.dataView = new DataView(arrayBuffer);
		this.type = [
			this.dataView.getUint8(0),
			this.dataView.getUint8(1),
			this.dataView.getUint8(2),
			this.dataView.getUint8(3)
		].map(x => String.fromCharCode(x)).join("");
		this.numLumps = this.dataView.getInt32(4, true);
		this.infoTableOffset = this.dataView.getInt32(8, true);
		this.entries = [];
		let index = this.infoTableOffset;
		for(let i = 0; i< this.numLumps; i++){
			this.entries.push({
				offset: this.dataView.getInt32(index, true),
				size: this.dataView.getInt32(index + 4, true),
				name: getPaddedString(this.dataView, index + 8)
			});
			index += 16;
		}
	}
	get(name){
		name = name.padEnd(8, "\0");
		const entry = this.entries.find(e => e.name.trim() === name.trim());
		return entry 
			? new DataView(this.arrayBuffer, entry.offset, entry.size)
			: null;
	}
	getType(){
		if(this.get("PAL")) return "rott";
		if(this.get("PLAYPAL")) return "doom";
	}
}