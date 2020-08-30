export function readFile(file) {
	return new Promise((res, rej) => {
		const fileReader = new FileReader();
		fileReader.onload = e => res(e.target.result);
		fileReader.onerror = rej;
		fileReader.readAsArrayBuffer(file);
	});
}