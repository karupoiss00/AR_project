/**
 @param {!{
   id: string,
   text: string,
   coord: !Array<number>,
   size: number,
 }} tipInfo
 */
function createTipCanvas(tipInfo) {
	const canvas = document.createElement("canvas");

	canvas.id = tipInfo.id;
	canvas.width = tipInfo.size;
	canvas.height = tipInfo.size;

	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000000';
	ctx.textAlign = "center";

	wrapText(ctx, tipInfo.text, canvas.width / 2, 20, 80, tipInfo.size / 10); 
}

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
	createTipCanvas,
};