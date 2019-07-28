/**
 * @param {!{
 *   id: string,
 *   text: string,
 *   coord: !Array<number>,
 *   rotation: !Array<number>,
 *   size: number,
 * }} args
 * @return {!THREE.Mesh}
 */
function createTipMesh({id, text, coord, rotation, size}) {
	const canvas = createTipCanvas(id, text, size);
	const texture = new THREE.CanvasTexture(canvas);
	const geometry = new THREE.BoxGeometry(50, 50, 1);
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
 * @param {number} size
 * @return {!Element}
 */
function createTipCanvas(id, text, size) {
	const canvas = document.createElement("canvas");

	canvas.id = id;
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000000';
	ctx.textAlign = "center";

	wrapText(ctx, text, canvas.width / 2, 20, 80, size / 10);
	
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
function wrapText(context, text, x, y, maxWidth, lineHeight) {
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
			y += lineHeight;
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