import {parseTipJson} from './tips/parsetipjson.js';
import {createTipMesh} from './tips/tips.js';
import {clearFields, randomId,
        getTitle, getDescription,
        getTipColor, getPosition,
        getRotation, getSize} from '/js/UI.js';

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
/** @const {!Array<!Object>} */
const tipsData = [

];

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
    renderer.domElement.style.top = '20px';
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
    for (const tip of tipsData)
    {
        console.log(JSON.stringify(tip));
        const tipMesh = createTipMesh(tip);
        tipMeshes.push(tipMesh);
        marker.add(tipMesh);
    }

}
/**
 * @param {string} json
 */
function saveTips(json) {
    const workId = randomId();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/saveFile.php', true); // Открываем асинхронное соединение
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // Отправляем кодировку

    xhr.onload = () => {
        document.body.innerHTML += 'Your work saved to: https://karproject.herokuapp.com/saves/' + workId;
    };
    xhr.onerror = () => {
        console.log("Failed to load tips.json");
    };
    const request = "dir=" + encodeURIComponent('example')
        + "&filename=" + encodeURIComponent('tips.json')
            + "&content=" + encodeURIComponent(json);
    xhr.send(request);
}

/**
 * @param {!Array<!Object>} tipsData
 * @return {string}
 */
function getJSON(tipsData) {
    const tips = {
        tips: tipsData,
    }
    return JSON.stringify(tips);
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
    document.getElementById("UI").style.visibility = "hidden";
    document.getElementById("edit").style.visibility = "visible";
    initialize();
    animate();
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

function back()
{
    arToolkitSource.domElement.style.visibility = "hidden";
    renderer.domElement.style.visibility = "hidden";
    document.getElementById("edit").style.visibility = "hidden";
    document.getElementById("UI").style.visibility = "visible";
}

function save() {
    document.getElementById("save").style.visibility = 'hidden';
    saveTips(getJSON(tipsData));
}

window.onload = function() {
    const startButton = document.getElementById("start");
    const addButton = document.getElementById("add");
    const backButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    addButton.onclick = addTip;
    startButton.onclick = start;
    backButton.onclick = back;
    saveButton.onclick = save;
};