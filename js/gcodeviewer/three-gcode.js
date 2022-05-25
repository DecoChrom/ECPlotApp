import * as THREE from './three.module.js';

// import { TrackballControls } from './TrackballControls.js';
import { OrbitControls } from "./OrbitControls.js"
import { GCodeLoader } from './GCodeLoader.js';

let camera, scene, renderer;
const loader = new GCodeLoader();


init();
render();


ipcRenderer.on("loadGCode", function(e, arg) {
    loadGCode("filePathCom")
    window.setTimeout(function() {
        $('ul.tabs').tabs("select", "swipe-gcode");
    }, 1)
})


function init() {

    // const container = document.createElement('div');
    const container = document.getElementById("gcodeRenderer")
        // document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(145, 221, 80);

    scene = new THREE.Scene();

    const paperGeometry = new THREE.BoxGeometry(297, 1, 210)
    const paperMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        // paperMaterial.color = "0xffffff"

    // const zeroPointGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const zeroPointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    let paperMesh = new THREE.Mesh(paperGeometry, paperMaterial)
    paperMesh.position.set(148, -0.5, -105)
        // let zeroPointMesh = new THREE.Mesh(zeroPointGeometry, zeroPointMaterial);

    // let zeroPointMesh5 = new THREE.Mesh(zeroPointGeometry, zeroPointMaterial);
    // let zeroPointMesh52 = new THREE.Mesh(zeroPointGeometry, zeroPointMaterial);
    // zeroPointMesh5.position.set(50, 0, 0)
    // zeroPointMesh52.position.set(0, 0, 50)

    scene.add(paperMesh)
        // scene.add(zeroPointMesh);
        // scene.add(zeroPointMesh5)
        // scene.add(zeroPointMesh52)
    loader.load('./generated.gcode', function(object) {

        // object.position.set(-100, -20, 100);
        // object.position.set(0, 0, 0);
        scene.add(object);

        render();

    });

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(1200, 600);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(145, 0, -80)
    controls.update()
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.listenToKeyEvents(window)
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.keys = {
        LEFT: 'KeyA', //left arrow
        UP: 'KeyW', // up arrow
        RIGHT: 'KeyD', // right arrow
        BOTTOM: 'KeyS' // down arrow
    }

}

function render() {

    renderer.render(scene, camera);
}



function loadGCode(layer) {
    let paths = ipcRenderer.sendSync('getFilePaths')

    let path = "";
    if (paths[layer].length > 0) {
        path = paths[layer]
        console.log("Trying to load gcode: " + path)
        path = path.substring(0, path.lastIndexOf("."))
        path += ".gcode"
    }




    if (path.indexOf(".gcode") != 0) {
        // console.log("Ready to load gcode")

        var selectedObject = scene.getObjectByName("gcode")
        scene.remove(selectedObject)

        loader.load(path, function(object) {
            scene.add(object)

            render()
        })


    }


}
(function($) {
    $("#btnAGGcode").on("click", function() {
        loadGCode("filePathAG")
    })
    $("#btnECGcode").on("click", function() {
        loadGCode("filePathEC")
    })
    $("#btnELGcode").on("click", function() {
        loadGCode("filePathEL")
    })
    $("#btnComGcode").on("click", function() {
        loadGCode("filePathCom")
    })

})(jQuery)