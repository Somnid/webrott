import { readFile } from "../../../shared/js/file-utils.js";
import { getTablePallet } from "../../../shared/js/image-utils.js";

customElements.define("pallet-extractor",
	class extends HTMLElement {
		static get observedAttributes() {
			return [];
		}
		constructor() {
			super();
			this.bind(this);
		}
		bind(element) {
			element.cacheDom = element.cacheDom.bind(element);
			element.render = element.render.bind(element);
			element.attachEvents = element.attachEvents.bind(element);
		}
		async connectedCallback() {
			this.render();
			this.cacheDom();
			this.attachEvents();
		}
		render() {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<link rel="stylesheet" href="../shared/css/system.css">
				<style>
					#pallet table td { width: 16px; height: 16px; }
				</style>
				<label for="file">Select Wolfenstien 3D GAMEPAL.obj:</label>
				<input id="file" type="file" multiple accept=".obj" />
				<div id="pallet"></div>
				<div id="output"></div>
			`;
		}
		cacheDom() {
			this.dom = {
				file: this.shadowRoot.querySelector("#file"),
				output: this.shadowRoot.querySelector("#output"),
				pallet: this.shadowRoot.querySelector("#pallet")
			};
		}
		attachEvents(){
			this.dom.file.addEventListener("change", async e => {
				const file = e.target.files[0];
				const arrayBuffer = await readFile(file);
				const dataView = new DataView(arrayBuffer, 119); //Found this via inspection
				const pallet = new Array(256);
				for(let i = 0; i < 256; i++){
					pallet[i] = [
						dataView.getUint8(i * 3) << 2,
						dataView.getUint8((i * 3) + 1) << 2,
						dataView.getUint8((i * 3) + 2) << 2
					];
				}

				this.dom.output.textContent = JSON.stringify(pallet);
				this.dom.pallet.appendChild(getTablePallet(pallet));
			});
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
	}
);
