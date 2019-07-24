/**
 @param {!{
   id: string,
   text: string,
   coord: !Array<number>,
   size: number,
 }} args
 @return {!THREE.Mesh}
 */
function createTipMesh({id, text, coord, size}) {
	const canvas = createTipCanvas(id, text, size);
	const texture = new THREE.CanvasTexture(canvas);
	const geometry = new THREE.BoxGeometry(50, 50, 1)
	const material = new THREE.MeshBasicMaterial({
		map: texture
	});
	
	const mesh = new THREE.Mesh(geometry, material);
	mesh.scale.set(0.01,0.01,0.001);
	
	const [x, y, z] = coord;
	mesh.position.set(x, y, z);
	/*
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
		*/

	return mesh;
}

/**
 @param {string} id
 @param {string} text
 @param {number} size
 @return {!Element}
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
 @param context
 @param {string} text
 @param {number} x
 @param {number} y
 @param {number} maxWidth
 @param {number} lineHeight
 */
function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for (var n = 0; n < words.length; n++)
	{
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  
	  if (testWidth > maxWidth && n > 0)
	  {
		context.fillText(line, x, y);
		line = words[n] + ' ';
		y += lineHeight;
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