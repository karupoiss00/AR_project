var scene, camera, renderer, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1;
var mesh1;

function initialize()
{
	scene = new THREE.Scene();
	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.0 );
	scene.add( ambientLight );
	
	var canv0 = document.createElement("canvas");
	var tip = "This is cat. Cat can run at night, eat and scratch you.";
	canv0.id = "tip0";
	canv0.width = 100;
	canv0.height = 100;
	tip0ctx = canv0.getContext('2d');
	tip0ctx.fillStyle = '#ffffff';
	tip0ctx.fillRect(0, 0, canv0.width, canv0.height);
	tip0ctx.fillStyle = '#000000';
	tip0ctx.textAlign = "center";
	wrapText(tip0ctx, tip, canv0.width / 2, 20, 80, 10);
	
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
	
	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
		  var testLine = line + words[n] + ' ';
		  var metrics = context.measureText(testLine);
		  var testWidth = metrics.width;
		  if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		  }
		  else {
			line = testLine;
		  }
		}
		context.fillText(line, x, y);
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

	var tip0Texture = new THREE.CanvasTexture(canv0);
	var geometry = new THREE.BoxGeometry(50, 50, 1)
	var material = new THREE.MeshBasicMaterial({
		map : tip0Texture
	});
	var tipMesh = new THREE.Mesh(geometry, material);
	tipMesh.scale.set(0.01,0.01,0.001);
	tipMesh.position.x = 0.2;
	tipMesh.position.y = 0.2;
	tipMesh.position.z = 0.5;
	markerRoot1.add(tipMesh);
				
	new THREE.MTLLoader()
		.setPath( '/AR/models/' )
		.load( 'cat.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( '/AR/models/' )
				.load( 'cat.obj', function ( group ) {
					catMesh = group.children[0];
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

initialize();
animate();