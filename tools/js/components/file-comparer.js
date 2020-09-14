import { readFile } from "../../../shared/js/file-utils.js";

customElements.define("file-comparer",
	class extends HTMLElement {
		static get observedAttributes() {
			return ["maxdiversions"];
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
					table { border-collapse: collapse; }
					table td { border: 1px solid black; }
					#compare { display: grid; grid-template-columns: min-content; grid-gap: 1rem; }
					#file-a { grid-col: 1 / 1; grid-row: 1 / 1; }
					#file-b { grid-col: 1 / 2; grid-row: 1 / 1; }
					.diff { background: pink; }
					.skip { text-align: center; }
				</style>
				<label for="file">Select 2 files</label>
				<input id="file" type="file" multiple />
				<div id="warn"></div>
				<div id="size"></div>
				<div id="compare">
					<div id="file-a">
						<div>
							<h1 id="title-a"></h1>
						</div>
						<table id="table-a"></table>
					</div>
					<div id="file-b">
						<div>
							<h1 id="title-b"></h1>
						</div>
						<table id="table-b"></table>
					</div>
				</div>
			`;
		}
		cacheDom() {
			this.dom = {
				file: this.shadowRoot.querySelector("#file"),
				tableA: this.shadowRoot.querySelector("#table-a"),
				tableB: this.shadowRoot.querySelector("#table-b"),
				size: this.shadowRoot.querySelector("#size"),
				warn: this.shadowRoot.querySelector("#warn"),
				titleA: this.shadowRoot.querySelector("#title-a"),
				titleB: this.shadowRoot.querySelector("#title-b")
			};
		}
		attachEvents() {
			this.dom.file.addEventListener("change", async e => {
				this.dom.warn.innerHTML = "";
				this.dom.size.innerHTML = "";
				this.dom.tableA.innerHTML = "";
				this.dom.tableB.innerHTML = "";

				if(e.target.files.length !== 2){
					this.dom.warn.textContent = "Must select 2 files, no more, no less";
				}
				const fileA = e.target.files[0];
				const fileB = e.target.files[1];
				const arrayBufferA = await readFile(fileA);
				const arrayBufferB = await readFile(fileB);
				const dataViewA = new DataView(arrayBufferA);
				const dataViewB = new DataView(arrayBufferB);

				if(arrayBufferA.byteLength !== arrayBufferB.byteLength){
					this.dom.size.textContent = `Files are not the same size, ${fileA.name} is ${arrayBufferA.byteLength} bytes.  ${fileB.name} is ${arrayBufferB.byteLength} bytes.`;
				}

				const length = Math.min(arrayBufferA.byteLength, arrayBufferB.byteLength);
				const paragraphLength = Math.floor(length / 16);

				let foundDiversions = 0;
				const paragraphs = [];

				for(let paragraph = 0; paragraph < paragraphLength; paragraph++){
					const bytes = new Array(16);
					let hasDiff = false;
					if(foundDiversions > this.maxdiversions) break;

					for(let byte = 0; byte < 16; byte++){
						const valueA = dataViewA.getUint8((paragraph * 16) + byte);
						const valueB = dataViewB.getUint8((paragraph * 16) + byte);
						
						bytes[byte] = {
							valueA,
							valueB,
							isDiff: valueA !== valueB 
						};

						if(valueA !== valueB){
							hasDiff = true;
							foundDiversions += 1;
						}
					}

					if(hasDiff){
						paragraphs.push(bytes);
					} else if(!paragraphs[paragraphs.length - 1]?.skip) {
						paragraphs.push({ skip: true, count: 1 });
					} else {
						paragraphs[paragraphs.length - 1].count++;
					}
				}

				if(foundDiversions === 0){
					this.dom.warn.textContent = "The file contents are identical";
				} else {
					renderTable(paragraphs, this.dom.tableA, (value, td) => {
						td.textContent = value.valueA.toString(16).padStart(2, "0");
						td.classList.add(value.isDiff ? "diff" : "same");
						return td;
					});
					renderTable(paragraphs, this.dom.tableB, (value, td) => {
						td.textContent = value.valueB.toString(16).padStart(2, "0");
						td.classList.add(value.isDiff ? "diff" : "same");
						return td;
					});

					this.dom.titleA.textContent = fileA.name;
					this.dom.titleB.textContent = fileB.name;
				}
			});
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
	}
);


function renderTable(tableData, table, map){
	let rowOffset = 0;
	for(let row = 0; row < tableData.length; row++){
		const tr = document.createElement("tr");

		if(tableData[row].skip){
			const td = document.createElement("td");
			td.colSpan = 17;
			td.classList.add("skip");
			td.innerText = `Skipping ${tableData[row].count} rows`;
			tr.appendChild(td);
			rowOffset += tableData[row].count;
		} else {
			const indexTd = document.createElement("td");
			indexTd.classList.add("index-col");
			indexTd.textContent = rowOffset * 16;
			tr.appendChild(indexTd);

			for(let col = 0; col < tableData[0].length; col++){
				let td = document.createElement("td");
				td = map(tableData[row][col], td);
				tr.appendChild(td);
			}
			rowOffset += 1;
		}
		table.appendChild(tr);
	}
}