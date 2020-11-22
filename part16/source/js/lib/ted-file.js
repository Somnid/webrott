import { getString, trimString, unCarmack, unRelew } from "./file-utils.js";
import { allocBlockArray, writeBlockSequential } from "./array-utils.js";

const numMaps = 100;

export class VswapFile {
	constructor(arrayBuffer, extension){
		this.arrayBuffer = arrayBuffer;
		this.extension = extension;
		this.dataView = new DataView(this.arrayBuffer);
		this.chunksInFile = this.dataView.getUint16(0, true);
		this.spriteStart = this.dataView.getUint16(2, true);
		this.soundStart = this.dataView.getUint16(4, true);
		
		const offsets = new Array(this.chunksInFile);
		const lengths = new Array(this.chunksInFile);
		let index = 6;

		for(let i = 0; i < this.chunksInFile; i++){
			offsets[i] = this.dataView.getUint32(index, true);
			index += 4;
		}
		for (let i = 0; i < this.chunksInFile; i++) {
			lengths[i] = this.dataView.getUint16(index, true);
			index += 2;
		}

		this.entries = new Array(this.chunksInFile);
		for(let i = 0; i < this.chunksInFile; i++){
			let type;
			if(i < this.spriteStart){
				type = "wall";
			} else if(i >= this.spriteStart && i < this.soundStart){
				type = "sprite";
			} else if(i >= this.soundStart){
				type = "sound";
			}

			this.entries[i] = {
				name: i,
				offset: offsets[i],
				size: lengths[i],
				type
			};
		}
	}
	getAsset(index){
		const offset = this.entries[index].offset;
		const length = this.entries[index].size;
		return this.arrayBuffer.slice(offset, offset + length);
	}
}

export class MapHeadFile {
	constructor(arrayBuffer) {
		this.dataView = new DataView(arrayBuffer);
		this.relwTag = this.dataView.getUint16(0, true); //must be 0xABCD
		this.headerOffsets = new Array(numMaps);
		for (let i = 0; i < numMaps; i++) {
			this.headerOffsets[i] = this.dataView.getUint32(2 + (i * 4), true);
		}
	}
}

export class GameMapsFile {
	constructor(arrayBuffer, mapHeadFile, extension, carmackCompressed = true) {
		this.dataView = new DataView(arrayBuffer);
		this.extension = extension;
		this.carmackCompressed = carmackCompressed;
		this.signature = getString(this.dataView, 0, 8);
		this.mapHeadFile = mapHeadFile;
		this.maps = [];

		for (let offset of this.mapHeadFile.headerOffsets.filter(ho => ho !== 0 && ho !== 0xffffffff)) {
			this.maps.push({
				planeStart: [
					this.dataView.getUint32(offset, true),
					this.dataView.getUint32(offset + 4, true),
					this.dataView.getUint32(offset + 8, true)
				],
				planeLength: [
					this.dataView.getUint16(offset + 12, true),
					this.dataView.getUint16(offset + 14, true),
					this.dataView.getUint16(offset + 16, true)
				],
				height: this.dataView.getUint16(offset + 18, true),
				width: this.dataView.getUint16(offset + 20, true),
				name: trimString(getString(this.dataView, offset + 22, 16))
			});
		}
	}
	getMap(mapNum) {
		const map = this.maps[mapNum];
		const layerCount = map.planeLength.filter(p => p !== 0).length;
		const layers = new Array(layerCount);

		for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
			const planeStart = map.planeStart[layerIndex];
			const planeLength = map.planeLength[layerIndex];

			const layer = allocBlockArray(map.height, map.width);
			const decompressedLength = this.dataView.getUint16(planeStart, true);
			const compressedData = this.dataView.buffer.slice(planeStart + 2, planeStart + planeLength);
			let decompressedData;

			if(this.carmackCompressed){
				const relwData = unCarmack(compressedData, decompressedLength);
				const dv = new DataView(relwData);
				const relwDecompressedLength = dv.getUint16(0, true);
				if (relwDecompressedLength != (map.height * map.width * 2)) throw new Error("Map data size is incorrect!");
				decompressedData = unRelew(relwData.slice(2), relwDecompressedLength, this.mapHeadFile.relwTag);
			} else {
				if(decompressedLength != (map.height * map.width * 2)) throw new Error("Map data size is incorrect!");
				decompressedData = unRelew(compressedData, decompressedLength, this.mapHeadFile.relwTag);
			}

			const layerDataView = new DataView(decompressedData);
			const decompressedWordLength = Math.floor(decompressedData.byteLength / 2);

			for(let i = 0; i < decompressedWordLength; i++){
				writeBlockSequential(layer, i, layerDataView.getUint16((i * 2), true));
			}

			layers[layerIndex] = layer;
		}
		return layers;
	}
}