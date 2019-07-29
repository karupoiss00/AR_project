import {parseTipJson} from './tips/parsetipjson.js';
import {createTipMesh} from './tips/tips.js';

let scene, camera, renderer, clock, deltaTime, totalTime;
let arToolkitSource, arToolkitContext;
let markerRoot;

function initialize()
{
	scene = new THREE.Scene();
	let ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
	scene.add(ambientLight);
	
	camera = new THREE.Camera();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize(1280, 1024);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild(renderer.domElement);
	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////
	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});
	
	function onResize()
	{
		arToolkitSource.onResize();
		arToolkitSource.copySizeTo(renderer.domElement);
		if (arToolkitContext.arController !== null)
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	
	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	
	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: '/AR/data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init(function onCompleted(){
		camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
	});
	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////
	// build markerControls
	markerRoot = new THREE.Group();
	scene.add(markerRoot);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type: 'pattern', patternUrl: "/AR/data/hiro.patt",
	});

	function onProgress(request) {
		console.log((request.loaded / request.total * 100) + '% loaded');
	}

	function onError(request) {
		alert('An error happened');
	}

	new THREE.MTLLoader()
		.setPath('/AR/models/')
		.load('cat.mtl', function (materials) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials(materials)
				.setPath('/AR/models/')
				.load('cat.obj', function (group) {
					const cat = group.children[0];
					cat.material.side = THREE.DoubleSide;
					cat.position.set(0, 0, 0);
					cat.scale.set(0.04,0.04,0.04);
					markerRoot.add(cat);
				}, onProgress, onError);
		});
	
	const xhr = new XMLHttpRequest();

	xhr.open('GET', 'js/tips/tips.json');
	xhr.onload = () => {
		const tips = parseTipJson(xhr.responseText);
		for (const tip of tips)
		{
			const tipMesh = createTipMesh(tip);
			markerRoot.add(tipMesh);
		}
	};
	xhr.onerror = () => {
		console.log("Failed to load tips.json");
	};
	
	xhr.send();
}

function update()
{
	// update artoolkit on every frame
	if (arToolkitSource.ready !== false)
	{
		arToolkitContext.update(arToolkitSource.domElement);
	}
	console.log(camera.positionX);
}

function render()
{
	renderer.render(scene, camera);
}

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}

window.onload = function() {
	initialize();
	animate();
};