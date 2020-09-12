import { readFile } from "../../../shared/js/file-utils.js";

customElements.define("file-comparer",
	class extends HTMLElement {
		static get observedAttributes() {
			return ["diversions"];
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
				<label for="file">Select 2 files</label>
				<input id="file" type="file" multiple />
				<pre id="output"></pre>
			`;
		}
		cacheDom() {
			this.dom = {
				file: this.shadowRoot.querySelector("#file"),
				output: this.shadowRoot.querySelector("#output")
			};
		}
		attachEvents() {
			this.dom.file.addEventListener("change", async e => {
				this.dom.output.innerHTML = "";

				if(e.target.files.length !== 2){
					this.dom.output.textContent = "Must select 2 files, no more, no less";
				}
				const fileA = e.target.files[0];
				const fileB = e.target.files[1];
				const arrayBufferA = await readFile(fileA);
				const arrayBufferB = await readFile(fileB);
				const dataViewA = new DataView(arrayBufferA);
				const dataViewB = new DataView(arrayBufferB);

				if(arrayBufferA.byteLength !== arrayBufferB.byteLength){
					this.dom.output.textContent = `Files are not the same size, ${fileA.name} is ${arrayBufferA.byteLength} bytes.  ${fileB.name} is ${arrayBufferB.byteLength} bytes.`;
				}

				const length = Math.min(arrayBufferA.byteLength, arrayBufferB.byteLength);

				let foundDiversions = 0;

				for(let i = 0; i < length; i++){
					if(dataViewA.getUint8(i) !== dataViewB.getUint8(i)){
						this.dom.output.textContent = this.dom.output.textContent + "\n" + `Files diverge at index ${i}`;
						if (foundDiversions > this.diversions) {
							return;
						}
						foundDiversions++;
					}
				}
				
			});
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
	}
);
