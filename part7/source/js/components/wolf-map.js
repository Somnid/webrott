import { forEachBlock } from "../lib/array-utils.js";

customElements.define("wolf-map",
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
			element.setMap = element.setMap.bind(element);
			element.renderMap = element.renderMap.bind(element);
		}
		connectedCallback() {
			this.render();
			this.cacheDom();
			this.renderMap();
		}
		render() {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<link rel="stylesheet" href="css/system.css">
				<table id="table"></table>
			`;
		}
		cacheDom() {
			this.dom = {
				table: this.shadowRoot.querySelector("#table"),
			};
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
		setMap(map) {
			this.map = map;
		}
		renderMap() {
			this.dom.table.innerText = "placeholder";
		}
	}
);
