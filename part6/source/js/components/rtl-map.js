customElements.define("rtl-map",
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
				<div class="keyval">
					<span class="key">Floor:</span>
					<span class="value" id="floor"><span>
				</div>
				<div class="keyval">
					<span class="key">Ceiling:</span>
					<span class="value" id="ceiling"><span>
				</div>
				<div class="keyval">
					<span class="key">Brightness:</span>
					<span class="value" id="brightness"><span>
				</div>
				<div class="keyval">
					<span class="key">Light Fade:</span>
					<span class="value" id="fade"><span>
				</div>
				<div class="keyval">
					<span class="key">Height:</span>
					<span class="value" id="height"><span>
				</div>
				<div class="keyval">
					<span class="key">Sky Level:</span>
					<span class="value" id="sky-level"><span>
				</div>
				<div class="keyval">
					<span class="key">Fog:</span>
					<span class="value" id="fog"><span>
				</div>
				<div class="keyval">
					<span class="key">Light Source:</span>
					<span class="value" id="light-source"><span>
				</div>
				<div class="keyval">
					<span class="key">Timer:</span>
					<span class="value" id="timer"><span>
				</div>
				<table id="table"></table>
			`;
		}
		cacheDom() {
			this.dom = {
				table: this.shadowRoot.querySelector("#table"),
				floor: this.shadowRoot.querySelector("#floor"),
				ceiling: this.shadowRoot.querySelector("#ceiling"),
				brightness: this.shadowRoot.querySelector("#brightness"),
				fade: this.shadowRoot.querySelector("#fade"),
				height: this.shadowRoot.querySelector("#height"),
				skyLevel: this.shadowRoot.querySelector("#sky-level"),
				fog: this.shadowRoot.querySelector("#fog"),
				lightSource: this.shadowRoot.querySelector("#light-source"),
				timer: this.shadowRoot.querySelector("#timer")
			};
		}
		attributeChangedCallback(name, oldValue, newValue) {
			this[name] = newValue;
		}
		setMap(map) {
			this.map = map;
		}
		renderMap() {
			this.dom.floor.textContent = this.map[0][0][0];
			this.dom.ceiling.textContent = this.map[0][0][1];
			this.dom.brightness.textContent = this.map[0][0][2];
			this.dom.fade.textContent = this.map[0][0][3];
			this.dom.height.textContent = this.map[1][0][0];
			this.dom.skyLevel.textContent = this.map[1][0][1];
			this.dom.fog.textContent = this.map[1][0][2] === 0x68 ? "No Fog" : this.map[1][0][2] === 0x69 ? "Fog" : "maybe fog?";
			this.dom.lightSource.textContent = this.map[1][0][3] === 0x8b ? "Illuminate" : "none";
			this.dom.timer.textContent = this.map[1][0][121] + "|" + this.map[2][0][121];
		}
	}
);
