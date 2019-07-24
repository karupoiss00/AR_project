import {createTipMesh} from './tips/tips.js';

var scene, camera, renderer, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1;
var mesh1;

function initialize()
{
	scene = new THREE.Scene();
	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.0 );
	scene.add( ambientLight );
	
	camera = new THREE.Camera();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );
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
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
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
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});
	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////
	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "/AR/data/hiro.patt",
	})


	function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { alert( 'An error happened' ); }

	const tipMesh = createTipMesh({
		id: "tip0",
		text: "This is cat. Cat can run at night, eat and scratch you",
		coord: [0.2, 0.2, 0.5],
		size: 100,
	});
/*
	const canvas = createTipCanvas({
		id: "tip0",
		text: "This is cat. Cat can run at night, eat and scratch you",
		coord: [0.2, 0.2, 0.5],
		size: 100,
	});

	var tip0Texture = new THREE.CanvasTexture(canvas);
	var geometry = new THREE.BoxGeometry(50, 50, 1)
	var material = new THREE.MeshBasicMaterial({
		map : tip0Texture
	});
	var tipMesh = new THREE.Mesh(geometry, material);
	tipMesh.scale.set(0.01,0.01,0.001);
	tipMesh.position.x = 0.2;
	tipMesh.position.y = 0.2;
	tipMesh.position.z = 0.5;*/
	markerRoot1.add(tipMesh);
				
	new THREE.MTLLoader()
		.setPath( '/AR/models/' )
		.load( 'cat.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( '/AR/models/' )
				.load( 'cat.obj', function ( group ) {
					const catMesh = group.children[0];
					catMesh.material.side = THREE.DoubleSide;
					catMesh.position.x = -0.2;
					catMesh.position.y = -0.2;
					catMesh.position.z = 0.5;
					catMesh.scale.set(0.04,0.04,0.04);
					markerRoot1.add(catMesh);
				}, onProgress, onError );
		});
}

function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}

function render()
{
	renderer.render( scene, camera );
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

