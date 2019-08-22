/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   text: string,
 *   titleStyle: !Object,
 *   textStyle: !Object,
 *   color: string
 *   coord: !Array<number>,
 *   rotation: !Array<number>,
 *   size: !Array<number>,
 * }}
 */
let TipData;

/**
 * @typedef {{
 *   font: string,
 *   size: number,
 *   color: string,
 *   backgroundColor: string,
 * }}
 */
let Style;

/**
 * @param {!TipData} args
 * @return {!Promise<!THREE.Mesh>}
 */
function createTipMesh({id, title, text, titleStyle, textStyle, color, coord, rotation, size}) {
	const coordsScale = 0.01;
	const [w, h] = size;
	const canvasPromise = createTipCanvas(id, title, text, titleStyle, textStyle, color, size);

	return canvasPromise.then((canvas) => {
		const texture = new THREE.CanvasTexture(canvas);
		const colorSide = new THREE.MeshBasicMaterial({ color: color });
		const tipSide = new THREE.MeshBasicMaterial({ map: texture });
		const geometry = new THREE.CubeGeometry(w / 2, h / 2, 1);
		const material = [colorSide, colorSide, colorSide, colorSide, tipSide, colorSide];

		const mesh = new THREE.Mesh(geometry, material);
		mesh.scale.set(0.01, 0.01, 0.01);

		const [x, y, z] = coord;
		mesh.position.set(x * coordsScale, y * coordsScale, z * coordsScale);

		const [rx, ry, rz] = rotation;
		mesh.rotation.set(THREE.Math.degToRad(rx), THREE.Math.degToRad(ry), THREE.Math.degToRad(rz));

        return Promise.resolve(mesh);
	});
}

/**
 * @param {string} id,
 * @param {string} title,
 * @param {string} text,
 * @param {!Style} titleStyle,
 * @param {!Style} textStyle,
 * @param {string} color,
 * @param {!Array<number>} size
 * @return {!Promise<!Element>}
 */
function createTipCanvas(id, title, text, titleStyle, textStyle, color, size) {
	const canvas = document.createElement("canvas");

	canvas.id = id;
	const [w, h] = size;
	canvas.width = w;
	canvas.height = h;

	const ctx = canvas.getContext("2d")
	ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	const doc = document.implementation.createHTMLDocument();
	const tipDiv = doc.createElement("div");
	tipDiv.id = 'd' + id;
	tipDiv.width = w;
	tipDiv.height = h;

	const heading = createHeading(title, titleStyle);
	const description = createDescription(text, textStyle);

	tipDiv.appendChild(heading);
	tipDiv.appendChild(description);

	doc.body.appendChild(tipDiv);

	return rasterizeHTML.drawDocument(doc, canvas).then(function(renderResult) {
		ctx.drawImage(renderResult.image, 0, 0);
        return Promise.resolve(canvas);
	});
}


/**
 *  @param {string} title
 *  @param {!Style} titleStyle
 * @return {!Element}
 */
function createHeading(title, titleStyle) {
	const heading = document.createElement("h1");

	heading.style.font = titleStyle.font;
	heading.style.fontSize = titleStyle.size.toString() + 'px';
	heading.style.backgroundColor = titleStyle.backgroundColor;
	heading.style.color = titleStyle.color;
	heading.innerHTML = "<center>" + title + "</center>";

	return heading;
}

/**
 *  @param {string} text
 *  @param {!Style} textStyle
 * @return {!Element}
 */
function createDescription(text, textStyle) {
	const description = document.createElement("a");

	description.style.font = textStyle.font;
	description.style.fontSize = textStyle.size.toString() + 'px';
	description.style.backgroundColor = textStyle.backgroundColor;
	description.style.color = textStyle.color;
	description.innerText = text;

	return description;
}

export {
	createTipMesh,
	TipData
};