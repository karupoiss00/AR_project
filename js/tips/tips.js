//import * as html2canvas from '/js/html2canvas/html2canvas.min.js';

/**
 * @param {!{
 *   id: string,
 *   text: string,
 *   textSize: number,
 *   html: string,
 *   coord: !Array<number>,
 *   rotation: !Array<number>,
 *   size: !Array<number>,
 * }} args
 * @return {!THREE.Mesh}
 */
function createTipMesh({id, text, textSize, html, coord, rotation, size}) {
	const [w, h] = size;
	const canvas = createTipCanvas(id, text, textSize, html, size);
	const texture = new THREE.CanvasTexture(canvas);
	const whiteSide = new THREE.MeshBasicMaterial({ color: 'white' });
	const tipSide = new THREE.MeshBasicMaterial({ map: texture });
	const geometry = new THREE.CubeGeometry(w / 2, h / 2, 1);
	const material = [
		whiteSide,
		whiteSide,
		whiteSide,
		whiteSide,
		tipSide,
		whiteSide
	];

	const mesh = new THREE.Mesh(geometry, material);
	mesh.scale.set(0.01, 0.01, 0.01);

	const [x, y, z] = coord;
	mesh.position.set(x, y, z);
	
	const [rx, ry, rz] = rotation;
	mesh.rotation.set(THREE.Math.degToRad(rx), THREE.Math.degToRad(ry), THREE.Math.degToRad(rz));

	return mesh;
}

/**
 * @param {string} id
 * @param {string} text
 * @param {number} textSize
 * @param {string} html
 * @param {!Array<number>} size
 * @return {!Element}
 */
function createTipCanvas(id, text, textSize, html, size) {
	const canvas = document.createElement("canvas");

	canvas.id = id;
	const [w, h] = size;
	canvas.width = w;
	canvas.height = h;

	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000000';
	ctx.textAlign = "center";

	if (html.length > 0)
	{
		//var dom = document.implementation.createDocument('', 'html');
		const tipDiv = document.createElement("div");
		tipDiv.id = 'd' + id;
		tipDiv.width = w;
		tipDiv.height = h;
		tipDiv.innerHTML = html;
		document.body.appendChild(tipDiv);
		domtoimage.toPng(document.getElementById('d' + id))
			.then(function (dataUrl) {
				var img = new Image();
				img.src = dataUrl;
				ctx.drawImage(img, 0, 0);
			})
	}
	else
	{
		wrapText(ctx, text, canvas.width / 2, h * 0.2, w * 0.8,  h / 10, textSize);
	}

	return canvas;

}

/**
 * @param context
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @param {number} lineHeight
 */
function wrapText(context, text, x, y, maxWidth, lineHeight, textSize) {
	context.font = "normal normal ".concat(textSize, "px Verdana");
	const words = text.split(' ');
	let line = '';

	for (let i = 0; i < words.length; ++i)
	{
		const testLine = line + words[i] + ' ';
		const metrics = context.measureText(testLine);
		const testWidth = metrics.width;

		if ((testWidth > maxWidth) && (i > 0))
		{
			context.fillText(line, x, y);
			line = words[i] + ' ';
			y += textSize * 1.5;
		}
		else
		{
			line = testLine;
		}
	}

	context.fillText(line, x, y);
}

export {
	createTipMesh,
};