/**
 * @param {!{
 *   id: string,
 *   text: string,
 *   coord: !Array<number>,
 *   rotation: !Array<number>,
 *   size: !Array<number>,
 * }} args
 * @return {!THREE.Mesh}
 */
function createTipMesh({id, text, coord, rotation, size}) {
	const [w, h] = size;
	const canvas = createTipCanvas(id, text, size);
	const texture = new THREE.CanvasTexture(canvas);
	const geometry = new THREE.BoxGeometry(w / 2, h / 2, 1);
	const material = new THREE.MeshBasicMaterial({
		map: texture
	});
	
	const mesh = new THREE.Mesh(geometry, material);
	mesh.scale.set(0.01,0.01,0.001);
	
	const [x, y, z] = coord;
	mesh.position.set(x, y, z);
	
	const [rx, ry, rz] = rotation;
	mesh.rotation.set(degToRad(rx), degToRad(ry), degToRad(rz));

	return mesh;
}

/**
 * @param {string} id
 * @param {string} text
 * @param {!Array<number>} size
 * @return {!Element}
 */
function createTipCanvas(id, text, size) {
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

	wrapText(ctx, text, canvas.width / 2, h * 0.4, w * 0.8,  h / 10, 10);
	
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

/**
 * @param {number} degrees
 * @return {number}
 */
function degToRad(degrees)
{
  return degrees * (Math.PI / 180);
}

export {
	createTipMesh,
};