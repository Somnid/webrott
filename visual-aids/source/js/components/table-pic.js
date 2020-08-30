import { allocBlockArray } from "../../../../shared/js/array-utils.js";
import { getPallet, getTableImage } from "../../../../shared/js/image-utils.js";


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

			const palletBuffer = await fetch(this.palletsrc).then(x => x.arrayBuffer());
			const pallet = getPallet(palletBuffer, 256);
			const table = getTableImage(grid, pallet);
			this.shadowRoot.appendChild(table);
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
	}
);
