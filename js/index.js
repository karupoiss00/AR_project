import {createTipMesh} from './tips/tips.js';
import {clearFields, randomId, getTitle, getDescription, getTipColor, getPosition, getRotation, getSize,
		showElement, hideElement, getNumberValue, setNumberValue} from '/js/UI.js';

/** @type {!THREE.Scene} */
let scene;
/** @type {!THREE.Camera} */
let camera;
/** @type {!THREE.WebGLRenderer} */
let renderer;
/** @type {!THREE.Clock} */
let clock;
/** @type {number} */
let deltaTime;
/** @type {number} */
let totalTime;
/** @type {!THREEx.ArToolkitSource|undefined} */
let arToolkitSource;
/** @type {!THREEx.ArToolkitContext} */
let arToolkitContext;
/** @type {boolean} */
let isFixed = false;
/** @type {boolean} */
let hasSensor = true;
/** @type {!RelativeOrientationSensor|undefined} */
let sensor;
/** @const {!Array<!THREE.Mesh>} */
const tipMeshes = [];
/** @const {!Array<!Object>} */
const tipsData = [];
/** @type {!Array<!THREE.Group>} */
let markerRoots = [];

/**
 * @param {boolean} hasCamera
 */
function initialize(hasCamera) {
	markerRoots = [];
	initArea(hasCamera);
	initRenderer(hasCamera,1440, 1080);
	initClock();
	initArToolKit(hasCamera, '/AR/data/camera_para.dat');
	addMarker(hasCamera, '/AR/data/hiro.patt');
	addMarker(hasCamera, '/AR/data/kanji.patt');

	loadModel(markerRoots[0], '/AR/models/', 'cat.mtl', 'cat.obj', 0.06);
	loadTips(markerRoots[0]);

	if (hasCamera) {
		loadModel(markerRoots[1], '/AR/models/', 'cat.mtl', 'cat.obj', 0.08);
	}
}

function attachModel(hasCamera, markerPath, modelPath, mtlName, objName, modelScale) {
	let marker = addMarker(hasCamera, markerPath);
	loadModel(marker, modelPath, mtlName, objName, modelScale);
	loadTips(marker);
}

/**
 * @param {boolean} hasCamera
 * @param {string} url
 */
function initArToolKit(hasCamera, url) {
	if (hasCamera)
	{
		arToolkitSource = new THREEx.ArToolkitSource({
			sourceType : 'webcam',
		});

		arToolkitSource.init(() => onResize(true));
		window.addEventListener('resize', () => onResize(true));

		arToolkitContext = new THREEx.ArToolkitContext({
			cameraParametersUrl: url,
			detectionMode: 'mono'
		});

		const onCompleted = () => camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
		arToolkitContext.init(onCompleted);
	}
}

/**
 * @param {boolean} hasCamera
 */
function initArea(hasCamera) {
	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
	scene.add(ambientLight);
	if (hasCamera)
	{
		camera = new THREE.Camera();
	}
	else {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 2, 4);
		camera.lookAt(scene.position);
		scene.background = new THREE.Color(0x000000);
	}

	scene.add(camera);
}

/**
 * @param {boolean} hasCamera
 * @param {number} screenWidth
 * @param {number} screenHeight
 */
function initRenderer(hasCamera, screenWidth, screenHeight) {
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize(screenWidth, screenHeight);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '60px';
	renderer.domElement.style.left = '0px';

	window.addEventListener('resize', () => onResize(hasCamera), false);

	if (!hasCamera)
	{
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	document.body.appendChild(renderer.domElement);
}

function initClock() {
	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
}

/**
 * @param {boolean} hasCamera
 * @param {string} markerUrl
 *
 * @return {THREE.Group()}
 */
function addMarker(hasCamera, markerUrl) {
	const marker = new THREE.Group();
	markerRoots.push(marker);

	if (hasCamera)
	{
		new THREEx.ArMarkerControls(arToolkitContext, marker, {
			type: 'pattern', patternUrl: markerUrl,
		});
	}

	scene.add(marker);

	return marker;
}
/**
 * @param {!THREE.Group} marker
 * @param {string} path
 * @param {string} mtlName
 * @param {string} objName
 * @param {number} scale
 */
function loadModel(marker, path, mtlName, objName, scale) {
	new THREE.MTLLoader()
		.setPath(path)
		.load(mtlName, function (materials) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials(materials)
				.setPath(path)
				.load(objName, function (group) {
					const cat = group.children[0];
					cat.position.set(0, 0, 0);
					cat.scale.set(scale, scale, scale);
					marker.add(cat);
				}, onProgress, onError);
		});

	const onProgress = (request) => console.log((request.loaded / request.total * 100) + '% loaded');
	const onError = (request) => alert('An error happened');
}

/**
 * @param {!THREE.Group} marker
 */
function loadTips(marker) {
	for (const tip of tipsData)
	{
		createTipMesh(tip).then((tipMesh) => {
			tipMeshes.push(tipMesh);
			marker.add(tipMesh);
		});
	}
}

/**
 * @param {boolean} hasCamera
 */
function onResize(hasCamera) {
	if (hasCamera)
	{
		arToolkitSource.onResize();
		arToolkitSource.copySizeTo(renderer.domElement);

		if (arToolkitContext.arController !== null)
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
		}
	}
	else
	{
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

}

function fixGroupPosition() {
	isFixed = !isFixed;
	if (!isFixed)
	{
		for (const group of markerRoots)
		{
			rotateGroup(group, 0, 0, 0);
		}
	}
}

/**
 * @param {THREE.Group} group
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function rotateGroup(group, x, y, z) {
	for (var i = 0; i < group.children.length; i++)
	{
		group.children[i].rotation.set(x, y, z);
	}
}

/**
 * @param {boolean} hasCamera
 */
function update(hasCamera) {
	if (hasCamera)
	{
		if (arToolkitSource.ready !== false && !isFixed)
		{
			arToolkitContext.update(arToolkitSource.domElement);
			showTips();
		}
	}
	if (isFixed && !hasCamera)
	{
		showElement('rotator');
		markerRoots[0].rotation.y = THREE.Math.degToRad(getNumberValue('rotator'));
	}
	else
	{
		hideElement('rotator');
		markerRoots[0].rotation.y += 0.01;
		if (markerRoots[0].rotation.y > 2 * Math.PI)
		{
			markerRoots[0].rotation.y = 0;
		}
		setNumberValue('rotator', THREE.Math.radToDeg(markerRoots[0].rotation.y));
	}
}

function showTips() {
	for (const mesh of tipMeshes)
	{
		mesh.visible = false;
	}

	const {tipMesh, distance} = getNearestTip();

	if (distance < 25)
	{
		tipMesh.visible = true;
	}
}

/**
 * @return {{
 *   tipMesh: !THREE.Mesh,
 *   distance: number,
 * }}
 */
function getNearestTip() {
	let nearestTipId = 0;
	let distance = 0;
	let minDistance = 1000;

	for (let i = 0; i < tipMeshes.length; i++)
	{
		const tipPosition = new THREE.Vector3(tipMeshes[i].position.x, tipMeshes[i].position.y, Math.abs(tipMeshes[i].position.z));
		distance = tipMeshes[i].getWorldPosition().distanceToSquared(tipPosition);

		if (distance < minDistance)
		{
			nearestTipId = i;
			minDistance = distance;
		}
	}

	return {
		tipMesh: tipMeshes[nearestTipId],
		distance: minDistance
	};
}

function render() {
	renderer.render(scene, camera);
}

/**
 * @param {boolean} hasCamera
 */
function animate(hasCamera) {
	requestAnimationFrame(() => animate(hasCamera));
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update(hasCamera);
	render();
}

function start()
{
    try {
        sensorInit();
    }
    catch (e) {
        hasSensor = false;
    }

	document.body.style.background = "#000000";
	if (hasSensor || !isMobile.any())
	{
		showElement("fix");
		showElement("rotator");
	}
	showElement("edit");
	hideElement("UI");
	initialize(isMobile.any());
	animate(isMobile.any());
}

function addTip() {
	tipsData.push(
		{
			id: randomId(),
			title: getTitle().text,
			text: getDescription().text,
			titleStyle:
				{
					font: "",
					size: getTitle().size,
					color: getTitle().color,
					backgroundColor: getTitle().background,
				},
			textStyle:
				{
					font: "",
					size: getDescription().size,
					color: getDescription().color,
					backgroundColor: getDescription().background,
				},
			color: getTipColor(),
			coord: getPosition(),
			rotation: getRotation(),
			size: getSize(),
		});
	clearFields();
}

/**
 * @param {string} hasCamera
 */
function back(hasCamera) {
	isFixed = false;

	if (arToolkitSource !== undefined) {
		arToolkitSource.domElement.style.visibility = "hidden";
	}

	renderer.domElement.style.visibility = "hidden";
	document.body.style.background = "#ffffff";

	hideElement("edit");
	hideElement("fix");
	hideElement("rotator");
	showElement("UI");
}


function sensorInit() {
	try {
		sensor = new RelativeOrientationSensor({frequency: 60, referenceFrame: "screen"});
		sensor.onreading = () => {
			sensorOnReading(markerRoots[0]);
		};
		sensor.start();
	}
	catch (e) {
		throw new Error(e);
	}
}
/**
 * @param {!THREE.Group} marker
 */
function sensorOnReading(marker) {
	if (isFixed)
	{
		let rotationMatrix = new Float32Array(16);
		sensor.populateMatrix(rotationMatrix);
		rotationMatrix[12] = marker.getWorldPosition().x;
		rotationMatrix[13] = marker.getWorldPosition().y;
		rotationMatrix[14] = marker.getWorldPosition().z;
		marker.matrix.fromArray(rotationMatrix);
	}
}

const isMobile = {
	Android: () => {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: () => {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: () => {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: () => {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: () => {
		return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	},
	any: () => {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

window.onload = function() {
	const startButton = document.getElementById("start");
	const addButton = document.getElementById("add");
	const backButton = document.getElementById("edit");
	const fixButton = document.getElementById("fix");

	addButton.onclick = addTip;
	startButton.onclick = start;
	backButton.onclick = back;
	fixButton.onclick = fixGroupPosition;
};