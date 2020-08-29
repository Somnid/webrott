import { allocBlockArray } from "../lib/array-utils.js";

function getPallet(palletLump, length){
	const pallet = new Array(length);
	for (let i = 0; i < length; i++) {
		pallet[i] = {
			red: palletLump.getUint8((i * 3) + 0),
			green: palletLump.getUint8((i * 3) + 1),
			blue: palletLump.getUint8((i * 3) + 2),
		}
	}
	return pallet;
}
function colorToHex(rgba) {
	const red = parseInt(rgba.red).toString(16).padStart(2, "0")
	const green = parseInt(rgba.green).toString(16).padStart(2, "0");
	const blue = parseInt(rgba.blue).toString(16).padStart(2, "0");
	const alpha = rgba.alpha ? parseInt(rgba.alpha).toString(16).padStart(2, "0") : "";
	return "#" + red + green + blue + alpha;
}
function getTableImage(grid, pallet, showIndices = true){
	const table = document.createElement("table");
	if(showIndices){
		const thead = document.createElement("thead");
		for(let col = 0; col < grid[0].length + 1; col++){
			const th = document.createElement("th");
			if(col !== 0){
				th.textContent = col - 1;
			}
			thead.appendChild(th);
		}
		table.appendChild(thead);
	}
	for (let row = 0; row < grid.length; row++) {
		const tr = document.createElement("tr");

		if(showIndices){
			for (let col = 0; col < grid[0].length + 1; col++) {
				const td = document.createElement("td");
				if(col === 0){
					td.textContent = row;
					td.classList.add("index-col");
				} else {
					const color = pallet[grid[row][col - 1]];
					td.style.backgroundColor = color !== undefined ? colorToHex(color) : "";
				}
				tr.appendChild(td);
			}
			table.appendChild(tr);
		} else {
			for (let col = 0; col < grid[0].length; col++) {
				const td = document.createElement("td");
				const color = pallet[grid[row][col]];
				td.style.backgroundColor = color !== undefined ? colorToHex(color) : "";
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
	}

	return table;
}

customElements.define("table-pic",
	class extends HTMLElement {
		static get observedAttributes() {
			return ["src", "palletsrc"];
		}
		constructor() {
			super();
			this.bind(this);
		}
		bind(element) {
			element.cacheDom = element.cacheDom.bind(element);
			element.render = element.render.bind(element);
		}
		async connectedCallback() {
			this.render();
			this.cacheDom();
			await this.renderTable()
		}
		render() {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<link rel="stylesheet" href="../shared/css/system.css">
				<style>
					table { border-spacing: 0; }
					table td { width: 32px; height: 32px; border: 1px solid green; }
					table th { width: 32px; height: 32px; }
					table td.index-col { border: none; }
				</style>
			`;
		}
		cacheDom() {
			this.dom = {
				aspect: this.shadowRoot.querySelector("#aspect"),
				canvas: this.shadowRoot.querySelector("#canvas")
			};
		}
		async renderTable() {
			const lump = await fetch(this.src).then(x => x.arrayBuffer()).then(x => new DataView(x));

			const width = lump.getUint16(0, true);
			const height = lump.getUint16(2, true);
			const _left = lump.getUint16(4, true);
			const _top = lump.getUint16(6, true);

			const grid = allocBlockArray(width, height);

			const columnOffsets = [];

			for (let col = 0; col < width; col++) {
				columnOffsets[col] = lump.getUint32(8 + (col * 4), true);
			}
			let index = 8 + (width * 4);

			for (let col = 0; col < width; col++) {
				while (true) {
					const rowStart = lump.getUint8(index);
					index += 1;
					if (rowStart === 255) break;

					const pixelCount = lump.getUint8(index);
					index += 1;

					//advance one more byte because of unused padding
					index += 1;

					//draw post spans
					for (let row = rowStart; row < rowStart + pixelCount; row++) {
						const palletIndex = lump.getUint8(index);
						index += 1;

						grid[row][col] = palletIndex
					}

					index += 1; //advance one more byte because of unused padding
				}
			}

			const palletLump = await fetch(this.palletsrc).then(x => x.arrayBuffer()).then(x => new DataView(x));
			const pallet = getPallet(palletLump, 256);
			const table = getTableImage(grid, pallet);
			this.shadowRoot.appendChild(table);
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
	}
);
