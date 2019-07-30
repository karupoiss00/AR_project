import {parseTipJson} from './tips/parsetipjson.js';
import {createTipMesh} from './tips/tips.js';

let scene, camera, renderer, clock, deltaTime, totalTime;
let arToolkitSource, arToolkitContext;
let markerRoot;
const tipMeshes = [];

function initialize()
{
    initArea();
    initRenderer(1440, 1080);
    initClock();
    initArToolKit('/AR/data/camera_para.dat');
    initMarker("/AR/data/hiro.patt");

	loadModel(markerRoot, '/AR/models/', 'cat.mtl', 'cat.obj', 0.06);
    loadTips(markerRoot, 'js/tips/tips.json');
}

/**
 * @param {string} url
 */
function initArToolKit(url) {
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam',
    });

    arToolkitSource.init(function onReady(){
        onResize()
    });

    window.addEventListener('resize', function(){
        onResize()
    });

    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: url,
        detectionMode: 'mono'
    });

    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
}


function initArea() {
    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);
}
/**
 * @param {number} screenWidth
 * @param {number} screenHeight
 */
function initRenderer(screenWidth, screenHeight) {
    renderer = new THREE.WebGLRenderer({
        antialias : true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(screenWidth, screenHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);
}

function initClock() {
    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;
}
/**
 * @param {string} markerUrl
 */
function initMarker(markerUrl) {
    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: markerUrl,
    });
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
                    cat.material.side = THREE.DoubleSide;
                    cat.position.set(0, 0, 0);
                    cat.scale.set(scale, scale, scale);
                    marker.add(cat);
                }, onProgress, onError);
        });

    function onProgress(request) {
        console.log((request.loaded / request.total * 100) + '% loaded');
    }

    function onError(request) {
        alert('An error happened');
    }
}

/**
 * @param {!THREE.Group} marker
 * @param {string} url
 */
function loadTips(marker, url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
        const tips = parseTipJson(xhr.responseText);
        for (const tip of tips)
        {
            const tipMesh = createTipMesh(tip);
            tipMeshes.push(tipMesh);
            marker.add(tipMesh);
        }
    };
    xhr.onerror = () => {
        console.log("Failed to load tips.json");
    };

    xhr.send();
}

function onResize()
{
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null)
    {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
}

function update()
{
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
    {
        arToolkitContext.update(arToolkitSource.domElement);
        const worldScalex = new THREE.Vector3();
        tipMeshes[0].getWorldScale(worldScale);
        var scale = worldScale.x.toFixed(20);
        tipMeshes[1].getWorldScale(worldScale);
        scale += ' ' + worldScale.x.toFixed(20);
        console.log(scale);
    }
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