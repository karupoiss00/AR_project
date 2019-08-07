function clearFields()
{
    setStringValue("title", "");
    setStringValue("description", "");
    setStringValue("titleTextColor", "#000000");
    setStringValue("titleBackgroundColor", "#ffffff");
    setStringValue("descriptionTextColor", "#000000");
    setStringValue("descriptionBackgroundColor", "#ffffff");
    setStringValue("tipColor", "#ffffff");
    setStringValue("tipWidth", "100");
    setStringValue("tipHeight", "100");
    setStringValue("titleSize", "10");
    setStringValue("textSize", "10");
    setStringValue("x", "0");
    setStringValue("y", "0");
    setStringValue("z", "0");
    setStringValue("rx", "0");
    setStringValue("ry", "0");
    setStringValue("rz", "0");
}

/**
 * * @return {string}
 */
function getTipId() {
    var x = 2147483648;
    return Math.floor(Math.random() * x).toString(36) +
        Math.abs(Math.floor(Math.random() * x) ^ +new Date()).toString(36);
}

/**
 * * @return {!Object}
 */
function getTitle() {
    return {
        text: getStringValue("title"),
        size: getNumberValue("titleSize"),
        color: getStringValue("titleTextColor"),
        background: getStringValue("titleBackgroundColor"),
    };
}

/**
 * * @return {!Object}
 */
function getDescription() {
    return {
        text: getStringValue("description"),
        size: getNumberValue("textSize"),
        color: getStringValue("descriptionTextColor"),
        background: getStringValue("descriptionBackgroundColor"),
    };
}

/**
 * * @return {string}
 */
function getTipColor() {
    return getStringValue("tipColor");
}

/**
 * * @return {!Array<number>}
 */
function getPosition() {
    return [
        getNumberValue("x"),
        getNumberValue("y"),
        getNumberValue("z"),
    ];
}

/**
 * * @return {!Array<Number>}
 */
function getRotation() {
    return [
        getNumberValue("rx"),
        getNumberValue("ry"),
        getNumberValue("rz"),
    ];
}

/**
 * * @return {!Array<number>}
 */
function getSize() {
    return [
        getNumberValue("tipWidth"),
        getNumberValue("tipHeight"),
    ];
}

/**
 * * @param {string} id
 * * @return {number}
 */
function getNumberValue(id) {
    return Number(document.getElementById(id).value);
}

/**
 * * @param {string} id
 * * @return {string}
 */
function getStringValue(id) {
    return document.getElementById(id).value;
}
/**
 * @param {string} id
 * @param {string} value
 */
function setStringValue(id, value) {
    document.getElementById(id).value = value;
}

export {
    clearFields,
    getTipId,
    getTitle,
    getDescription,
    getTipColor,
    getPosition,
    getRotation,
    getSize
}

