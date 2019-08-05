/**
 * @param {!{
 *   id: string,
 *   title: string,
 *   text: string,
 *   titleStyle: !Object,
 *   textStyle: !Object,
 *   coord: !Array<number>,
 *   rotation: !Array<number>,
 *   size: !Array<number>,
 * }} args
 * @return {!THREE.Mesh}
 */
function createTipMesh({id, title, text, titleStyle, textStyle, coord, rotation, size}) {
	const coordsScale = 0.01;
	const [w, h] = size;
	const canvas = createTipCanvas(id, title, text, titleStyle, textStyle, size);
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
	mesh.position.set(x * coordsScale, y * coordsScale, z * coordsScale);
	
	const [rx, ry, rz] = rotation;
	mesh.rotation.set(THREE.Math.degToRad(rx), THREE.Math.degToRad(ry), THREE.Math.degToRad(rz));

	return mesh;
}

/**
 *  id: string,
 *  title: string,
 *  text: string,
 *  titleStyle: !Object,
 *  textStyle: !Object,
 * @param {!Array<number>} size
 * @return {!Element}
 */
function createTipCanvas(id, title, text, titleStyle, textStyle, size) {
	const canvas = document.createElement("canvas");

	canvas.id = id;
	const [w, h] = size;
	canvas.width = w;
	canvas.height = h;

	const ctx = canvas.getContext("2d")
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	const doc = document.implementation.createHTMLDocument();
	const tipDiv = doc.createElement("div");
	tipDiv.id = 'd' + id;
	tipDiv.width = w;
	tipDiv.height = h;

	const heading = document.createElement("h1");
	heading.style.font = titleStyle.font;
	heading.style.fontSize = titleStyle.size;
	heading.style.backgroundColor = titleStyle.backgroundColor;
	heading.style.color = titleStyle.color;
	heading.innerText = title;

	const description = document.createElement("a");
	description.style.font = textStyle.font;
	description.style.fontSize = textStyle.size;
	description.style.backgroundColor = textStyle.backgroundColor;
	description.style.color = textStyle.color;
	heading.innerText = text;

	tipDiv.appendChild(heading);
	tipDiv.appendChild(description);

	doc.body.appendChild(tipDiv);
	rasterizeHTML.drawDocument(doc, canvas).then(function(renderResult) {
		ctx.drawImage(renderResult.image, 0, 0);
	});

	return canvas;
}

export {
	createTipMesh,
};