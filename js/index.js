import {parseTipJson} from './tips/parsetipjson.js';
import {createTipMesh} from './tips/tips.js';

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
/** @type {!THREEx.ArToolkitSource} */
let arToolkitSource;
/** @type {!THREEx.ArToolkitContext} */
let arToolkitContext;
/** @type {!THREE.Group} */
let markerRoot;
/** @const {!THREE.Mesh} */
const tipMeshes = [];
/** @const {!Array<string>} */
const tipsData = {
    tips: [],
};

function initialize() {
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
    const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
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
    /*
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

    xhr.send();*/
    for (const tip of tipsData.tips)
    {
        const tipMesh = createTipMesh(tip);
        tipMeshes.push(tipMesh);
        marker.add(tipMesh);
    }
}

function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);

    if (arToolkitContext.arController !== null)
    {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
}

function update() {
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
    {
        arToolkitContext.update(arToolkitSource.domElement);
        showTips();
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

function animate() {
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}

function start()
{
    document.body.innerHTML = "";
    initialize();
    animate();
}

function addTip() {
    const tipId = document.getElementById("tipId").value;

    const title = document.getElementById("title").value;
    const titleSize = document.getElementById("titleSize").value;
    const titleColor = document.getElementById("titleTextColor").value;
    const titleBackground = document.getElementById("titleBackgroundColor").value;

    const description = document.getElementById("description").value;
    const descriptionSize = document.getElementById("textSize").value;
    const descriptionColor = document.getElementById("descriptionTextColor").value;
    const descriptionBackground = document.getElementById("descriptionBackgroundColor").value;

    const tipColor = document.getElementById("tipColor").value;

    const positionX = document.getElementById("x").value;
    const positionY = document.getElementById("y").value;
    const positionZ = document.getElementById("z").value;

    const rotationX = document.getElementById("rx").value;
    const rotationY = document.getElementById("ry").value;
    const rotationZ = document.getElementById("rz").value;

    const width = document.getElementById("tipWidth").value;
    const height = document.getElementById("tipHeight").value;

    const coord = [positionX, positionY, positionZ];
    const rotation = [rotationX, rotationY, rotationZ];
    const size = [width, height];

    if (!(tipId.length == 0
        || title.length == 0
        || description.length == 0))
    {
        tipsData.tips.push(
            {
                id: tipId,
                title: title,
                text: description,
                titleStyle:
                    {
                        font: "",
                        size: titleSize,
                        color: titleColor,
                        backgroundColor: titleBackground,
                    },
                textStyle:
                    {
                        font: "",
                        size: descriptionSize,
                        color: descriptionColor,
                        backgroundColor: descriptionBackground,
                    },
                color: tipColor,
                coord: coord,
                rotation: rotation,
                size: size,
            }
        );
    }
}

window.onload = function() {
    const startButton = document.getElementById("start");
    const addButton = document.getElementById("add");
    addButton.onclick = addTip;
    startButton.onclick = start;
};