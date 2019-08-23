import {parseTipJson} from './tips/parsetipjson.js';
import {createTipMesh, TipData} from './tips/tips.js';
import {isMobile} from './utils.js';
import {clearFields, randomId, getTitle, getDescription, getTipColor, getPosition, getRotation, getSize,
		showElement, hideElement, getNumberValue, setNumberValue, showSuccess} from '/js/UI.js';

/**
 * @typedef {{
 *   scene: (!THREE.Scene|undefined),
 *   camera: (!THREE.Camera|undefined),
 *   renderer: (!THREE.WebGLRenderer|undefined),
 *   clock: (!THREE.Clock|undefined),
 *   deltaTime: (number|undefined),
 *   totalTime: (number|undefined),
 *  }}
 */
let World;

/**
 * @typedef {{
 *   source: (!THREE.Scene|undefined),
 *   context: (!THREE.Camera|undefined),
 *   sensor: (!THREE.WebGLRenderer|undefined),
 *  }}
 */
let ArToolKit;

/**
 * @typedef {{
 *   meshes: !Array<!THREE.Mesh>,
 *   data: !Array<!TipData>,
 *   markerRoots: !Array<!THREE.Group>,
 *  }}
 */
let Tips;

/**
 * @typedef {{
 *   isFixed: boolean,
 *   hasSensor: boolean,
 *  }}
 */
let WorldState;

/** @type {!World}*/
let world = {};
/**@type {!ArToolKit}*/
let arToolkit = {};
/** @type {!WorldState}*/
let worldState = {
	isFixed: false,
	hasSensor: true,
};
/** @type {!Tips}*/
let tips = {
	meshes : [],
	data : [],
	markerRoots : [],
};

/**
 * @param {boolean} hasCamera
 */
function initialize(hasCamera) {
	tips.markerRoots = [];
	initArea(hasCamera);
	initRenderer(hasCamera,1440, 1080);
	initClock();
	initArToolKit(hasCamera, '/AR/data/camera_para.dat');

	attachModel(hasCamera,
		true,
		'/AR/data/hiro.patt',
		'/AR/models/',
		'10260_Workbench_max8_v1_iterations-2.mtl',
		'10260_Workbench_max8_v1_iterations-2.obj',
		0.015,
		[-90, 0, 0]
	);

	/*
	if (hasCamera) {
		attachModel(hasCamera,
			false,
			'/AR/data/kanji.patt',
			'/AR/models/',
			'cat.mtl',
			'cat.obj',
			0.08,
			[0, 0, 0]
		);
	}*/
}

function attachModel(hasCamera, hasTips, markerPath, modelPath, mtlName, objName, modelScale, rotation) {
	let marker = addMarker(hasCamera, markerPath);
	loadModel(marker, modelPath, mtlName, objName, modelScale, rotation);

	if (hasTips)
	{
		loadTips(marker);
	}
}

/**
 * @param {boolean} hasCamera
 * @param {string} url
 */
function initArToolKit(hasCamera, url) {
	if (hasCamera)
	{
		const arToolkitSource = new THREEx.ArToolkitSource({
			sourceType : 'webcam',
		});

		arToolkitSource.init(() => onResize(true));
		window.addEventListener('resize', () => onResize(true));

		const arToolkitContext = new THREEx.ArToolkitContext({
			cameraParametersUrl: url,
			detectionMode: 'mono'
		});

		const onCompleted = () => world.camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
		arToolkitContext.init(onCompleted);

		arToolkit.source = arToolkitSource;
		arToolkit.context = arToolkitContext;
	}
}

/**
 * @param {boolean} hasCamera
 */
function initArea(hasCamera) {
	const scene = new THREE.Scene();
	let camera;
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

    world.scene = scene;
	world.camera = camera;
}

/**
 * @param {boolean} hasCamera
 * @param {number} screenWidth
 * @param {number} screenHeight
 */
function initRenderer(hasCamera, screenWidth, screenHeight) {
	const renderer = new THREE.WebGLRenderer({
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
	world.renderer = renderer;
}

function initClock() {
	world.clock = new THREE.Clock();
	world.deltaTime = 0;
	world.totalTime = 0;
}

/**
 * @param {boolean} hasCamera
 * @param {string} markerUrl
 *
 * @return {!THREE.Group}
 */
function addMarker(hasCamera, markerUrl) {
	const marker = new THREE.Group();
	tips.markerRoots.push(marker);

	if (hasCamera)
	{
		new THREEx.ArMarkerControls(arToolkit.context, marker, {
			type: 'pattern', patternUrl: markerUrl,
		});
	}
	world.scene.add(marker);

	return marker;
}
/**
 * @param {!THREE.Group} marker
 * @param {string} path
 * @param {string} mtlName
 * @param {string} objName
 * @param {number} scale
 * @param {!Array<number>} scale
 */
function loadModel(marker, path, mtlName, objName, scale, rotation) {
    const [rx, ry, rz] = rotation;
	new THREE.MTLLoader()
		.setPath(path)
		.load(mtlName, function (materials) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials(materials)
				.setPath(path)
				.load(objName, function (group) {
					const model = group.children[0];
					model.position.set(0, 0, 0);
					model.scale.set(scale, scale, scale);
                    model.rotation.set(
                    	THREE.Math.degToRad(rx),
						THREE.Math.degToRad(ry),
						THREE.Math.degToRad(rz)
					);
					marker.add(model);
					removePreloader();
				}, onProgress, onError);
		});

	const onProgress = (request) => console.log((request.loaded / request.total * 100) + '% loaded');
	const onError = (request) => {
        removePreloader();
	    alert('An error happened');
	};
}

/**
 * @param {!THREE.Group} marker
 */
function loadTips(marker) {
	for (const tip of tips.data)
	{
		createTipMesh(tip).then((tipMesh) => {
			tips.meshes.push(tipMesh);
			marker.add(tipMesh);
		});
	}
}

function loadDefaultTips() {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/js/tips/tips.json');
	xhr.onload = () => {
		const parsedTips = parseTipJson(xhr.responseText);
		for (const tip of parsedTips)
		{
			createTipMesh(tip).then((tipMesh) => {
				tips.meshes.push(tipMesh);
				tips.markerRoots[0].add(tipMesh);
			});
		}
	};
	xhr.onerror = () => {
		console.log("Failed to load tips.json");
	};
	xhr.send();
}

/**
 * @param {boolean} hasCamera
 */
function onResize(hasCamera) {
	if (hasCamera)
	{
		arToolkit.source.onResize();
		arToolkit.source.copySizeTo(world.renderer.domElement);

		if (arToolkit.context.arController !== null)
		{
			arToolkit.source.copySizeTo(arToolkit.context.arController.canvas);
		}
	}
	else
	{
		world.camera.aspect = window.innerWidth / window.innerHeight;
		world.camera.updateProjectionMatrix();
		world.renderer.setSize(window.innerWidth, window.innerHeight);
	}

}

function fixGroupPosition() {
	worldState.isFixed = !worldState.isFixed;
	if (!worldState.isFixed)
	{
		for (const group of tips.markerRoots)
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
		if (arToolkit.source.ready !== false && !worldState.isFixed)
		{
			arToolkit.context.update(arToolkit.source.domElement);
			showTips();
		}
	}
	rotationUpdate(hasCamera);
}

/**
 * @param {boolean} hasCamera
 */
function rotationUpdate(hasCamera) {
	if (worldState.isFixed && !hasCamera)
	{
		showElement('rotator');
		tips.markerRoots[0].rotation.y = THREE.Math.degToRad(getNumberValue('rotator'));
	}
	else
	{
		hideElement('rotator');
		tips.markerRoots[0].rotation.y += 0.01;
		if (tips.markerRoots[0].rotation.y > 2 * Math.PI)
		{
			tips.markerRoots[0].rotation.y = 0;
		}
		setNumberValue('rotator', THREE.Math.radToDeg(tips.markerRoots[0].rotation.y));
	}
}

function showTips() {
	for (const mesh of tips.meshes)
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

	for (let i = 0; i < tips.meshes.length; i++)
	{
		const tipPosition = new THREE.Vector3(
			tips.meshes[i].position.x,
			tips.meshes[i].position.y,
			Math.abs(tips.meshes[i].position.z)
		);
		distance = tips.meshes[i].getWorldPosition().distanceToSquared(tipPosition);

		if (distance < minDistance)
		{
			nearestTipId = i;
			minDistance = distance;
		}
	}

	return {
		tipMesh: tips.meshes[nearestTipId],
		distance: minDistance
	};
}

function render() {
	world.renderer.render(world.scene, world.camera);
}

/**
 * @param {boolean} hasCamera
 */
function animate(hasCamera) {
	requestAnimationFrame(() => animate(hasCamera));
	world.deltaTime = world.clock.getDelta();
	world.totalTime += world.deltaTime;
	update(hasCamera);
	render();
}

function initPreloader() {
	const preloader = document.createElement("div");
	preloader.id = "preloader";
	preloader.width = "100%";
	preloader.height = "100%";
	preloader.style.color = "#000000";
	preloader.style.background = "#ffffff";
	preloader.style.zIndex = 1;
	preloader.innerText = "Loading, please wait..."
	document.body.appendChild(preloader);
}

function removePreloader() {
	const preloader = document.getElementById("preloader");
	preloader && preloader.remove();
	showInterface();
}

function showInterface() {
	document.body.style.background = "#000000";
	if (document.getElementById("withDefault").checked)
	{
		loadDefaultTips();
	}
	if (worldState.hasSensor || !isMobile.any())
	{
		showElement("fix");
		showElement("rotator");
	}
	showElement("edit");
}

function start() {
	initPreloader();
    try {
        sensorInit();
    }
    catch (e) {
        worldState.hasSensor = false;
    }

	hideElement("UI");
	initialize(isMobile.any());
	animate(isMobile.any());
}

function addTip() {
	tips.data.push(
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
    showSuccess();
}

/**
 * @param {string} hasCamera
 */
function back(hasCamera) {
	worldState.isFixed = false;

	if (arToolkit.source !== undefined) {
		arToolkit.source.domElement.style.visibility = "hidden";
	}

	world.renderer.domElement.style.visibility = "hidden";
	document.body.style.background = "#ffffff";

	hideElement("edit");
	hideElement("fix");
	hideElement("rotator");
	showElement("UI");
}


function sensorInit() {
	try {
		arToolkit.sensor = new RelativeOrientationSensor({frequency: 60, referenceFrame: "screen"});
		arToolkit.sensor.onreading = () => {
			sensorOnReading(tips.markerRoots[0]);
		};
		arToolkit.sensor.start();
	}
	catch (e) {
		throw new Error(e);
	}
}
/**
 * @param {!THREE.Group} marker
 */
function sensorOnReading(marker) {
	if (worldState.isFixed)
	{
		let rotationMatrix = new Float32Array(16);
		arToolkit.sensor.populateMatrix(rotationMatrix);
		rotationMatrix[12] = marker.getWorldPosition().x;
		rotationMatrix[13] = marker.getWorldPosition().y;
		rotationMatrix[14] = marker.getWorldPosition().z;
		marker.matrix.fromArray(rotationMatrix);
	}
}

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