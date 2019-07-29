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
	
	if (noProperty('id') || noProperty('text'))
	{
		throw new Error('incorrect tip data');
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

export {
	parseTipJson,
};