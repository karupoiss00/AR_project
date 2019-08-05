/**
 * @param {string} json
 * @return {!Array<!Object>}
 */
function parseTipJson(json) {
	const parsedJson = JSON.parse(json);
	
	if (!verifyParsedJson(parsedJson))
	{
		return [];
	}
	
	const tips = [];
	
	for (const data of parsedJson['tips'])
	{
		tips.push(createTip(data));
	}
	
	return tips;
}

/**
 * @param {?Object=} parsedJson
 * @return {boolean}
 */
function verifyParsedJson(parsedJson) {
	if (parsedJson instanceof Object)
	{
		const tips = parsedJson['tips'];
		if (tips instanceof Array)
		{
			return tips.every((data) => data instanceof Object);
		}
	}
	
	return false;
}
 
/**
 * @param {!Object} data
 * @return {!Object}
 */
function createTip(data) {
	const noProperty = (property) => !data.hasOwnProperty(property);
	data = checkTipStyles(data);
	if (noProperty('id') || noProperty('text'))
	{
		throw new Error('incorrect tip id');
	}
	if (noProperty('color'))
	{
		data['color'] = "#ffffff";
	}
	if (noProperty('coord'))
	{
		data['coord'] = [0, 0, 0];
	}
	
	if (noProperty('rotation'))
	{
		data['rotation'] = [0, 0, 0];
	}
	
	if (noProperty('size'))
	{
		data['size'] = [100, 100];
	}
	
	return data;
}

/**
 * @param {!Object} data
 * @return {!Object}
 */
function checkTipStyles(data) {
	const noProperty = (object, property) => !object.hasOwnProperty(property);
	const styles = ["titleStyle", "textStyle"];
	for (let style of styles)
	{
		if (noProperty(data, style))
		{
			data[style] =
			{
				font: "",
				size: 22,
				color: "#000000",
				backgroundColor: "#ffffff",
			};
		}
		else
		{
			if (noProperty(data[style], 'font'))
			{
				data[style].font = "";
			}
			if (noProperty(data[style], 'size'))
			{
				data[style].size = 22;
			}
			if (noProperty(data[style], 'color'))
			{
				data[style].color = "#000000";
			}
			if (noProperty(data[style], 'backgroundColor'))
			{
				data[style].backgroundColor = "#ffffff";
			}
		}
	}

	return data;

}
export {
	parseTipJson,
};