import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js'

// Constants
const sqrt = Math.sqrt(2);
const SCALE = 19.25 / 90;
const GRAVITY = 32 * SCALE;
const orbit = false;
const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: false });
const loader = new GLTFLoader();

const RESOLUTION_SCALE = 1;

var difficulty = parseInt(localStorage.getItem("difficulty"));
if (difficulty == null || String(difficulty) == "") {
    difficulty = 1;
}
console.warn(`Difficulty: ${difficulty}`);

/* MUSIC */
var musicNumber = parseInt(localStorage.getItem("music"));
if (musicNumber == null || isNaN(musicNumber)) {
    musicNumber = -1;
}
musicNumber++;
localStorage.setItem("music", musicNumber);
var music;
if (musicNumber % 2 == 0) {
    music = new Audio("audio/Punch Deck - Fluid Dynamics MASTER.wav");
} else if (musicNumber % 2 == 1) {
    music = new Audio("audio/anttisinstrumentals+bandinatube.mp3");
} else {
    //music = new Audio("audio/Punch Deck - Fluid Dynamics MASTER.wav");
}
clickToBegin.addEventListener('click', startGame);

var tempTransform;
var physicsWorld;
var rigidBodies = [];
var balls = [];
var ballRigidBodies = [];

var counter = 0;

// Scene
const scene = new THREE.Scene();

// Create clock
var clock = new THREE.Clock();

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.y = 1.5;
camera.position.z = 2.5;

// Sun
const light = new THREE.AmbientLight(0xffffff, 2);
light.position.y = 10;
scene.add(light);

// Current event
var pitching = false;
var hit = false;
var bounced = false;
var homerun = false;
var PAUSE = false;

var hitWindow = 4;
switch (difficulty) {
    case 0:
        hitWindow = 5.25;
        break;
    case 1:
        hitWindow = 4;
        break;
    case 2:
        hitWindow = 3.5;
        break;
    case 3:
        hitWindow = 2.7;
        break;
    case 4:
        hitWindow = 2;
        break;
    default:
        break;
}

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true
});

// Renderer setup
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * RESOLUTION_SCALE, window.innerHeight * RESOLUTION_SCALE);
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1;

var stadium;
var stadiumAbbr = "BOS";
if (localStorage.getItem("stadium") != null && localStorage.getItem("stadium") != "") {
    stadiumAbbr = localStorage.getItem("stadium");
}
localStorage.setItem("stadium", stadiumAbbr);

Ammo().then(start)

function start() {
    setUpPhysicsWorld();
}

addStadium();

function addStadium() {
    loadStadium();
}

function setUpStadiumPhysics(stadiumCollider) {
    let stadiumTransform = new Ammo.btTransform();
    stadiumTransform.setIdentity();
    stadiumTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
    stadiumTransform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

    let stadiumMotionState = new Ammo.btDefaultMotionState(stadiumTransform);

    let stadiumInertia = new Ammo.btVector3(0, 0, 0);

    //console.log(stadiumCollider);
    let verticiesPos = stadiumCollider.geometry.getAttribute('position').array;
    let triangles = [];
    for (let i = 0; i < verticiesPos.length; i += 3) {
        triangles.push({
            x: verticiesPos[i],
            y: verticiesPos[i + 1],
            z: verticiesPos[i + 2]
        });
    }

    let triangle, triangle_mesh = new Ammo.btTriangleMesh();
    let vecA = new Ammo.btVector3(0, 0, 0);
    let vecB = new Ammo.btVector3(0, 0, 0);
    let vecC = new Ammo.btVector3(0, 0, 0);


    for (let i = 0; i < triangles.length - 3; i += 3) {
        vecA.setX(triangles[i].x);
        vecA.setY(triangles[i].y);
        vecA.setZ(triangles[i].z);

        vecB.setX(triangles[i + 1].x);
        vecB.setY(triangles[i + 1].y);
        vecB.setZ(triangles[i + 1].z);

        vecC.setX(triangles[i + 2].x);
        vecC.setY(triangles[i + 2].y);
        vecC.setZ(triangles[i + 2].z);
        triangle_mesh.addTriangle(vecA, vecB, vecC);
    }

    Ammo.destroy(vecA);
    Ammo.destroy(vecB);
    Ammo.destroy(vecC);

    const shape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true);
    shape.setMargin(0.05);

    shape.calculateLocalInertia(100000000, stadiumInertia);

    let stadiumRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(100000000, stadiumMotionState, shape, stadiumInertia);
    let stadiumRigidbody = new Ammo.btRigidBody(stadiumRigidBodyInfo);

    stadiumRigidbody.setRestitution(0.25);

    physicsWorld.addRigidBody(stadiumRigidbody);
    stadium.userData.physicsBody = stadiumRigidbody;
    rigidBodies.push(stadium);

    stadiumRigidbody.setActivationState(4);
    stadiumRigidbody.setCollisionFlags(1);

    stadiumRigidbody.activate();

    stadium.userData.tag = "wall";

    stadiumRigidbody.threeObject = stadium;

    console.log("Stadium physics added");
}

function setUpHomerunColliders(stadiumCollider) {
    let stadiumTransform = new Ammo.btTransform();
    stadiumTransform.setIdentity();
    stadiumTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
    stadiumTransform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

    let stadiumMotionState = new Ammo.btDefaultMotionState(stadiumTransform);

    let stadiumInertia = new Ammo.btVector3(0, 0, 0);

    //console.log(stadiumCollider);
    let verticiesPos = stadiumCollider.geometry.getAttribute('position').array;
    let triangles = [];
    for (let i = 0; i < verticiesPos.length; i += 3) {
        triangles.push({
            x: verticiesPos[i],
            y: verticiesPos[i + 1],
            z: verticiesPos[i + 2]
        });
    }

    let triangle, triangle_mesh = new Ammo.btTriangleMesh();
    let vecA = new Ammo.btVector3(0, 0, 0);
    let vecB = new Ammo.btVector3(0, 0, 0);
    let vecC = new Ammo.btVector3(0, 0, 0);


    for (let i = 0; i < triangles.length - 3; i += 3) {
        vecA.setX(triangles[i].x);
        vecA.setY(triangles[i].y);
        vecA.setZ(triangles[i].z);

        vecB.setX(triangles[i + 1].x);
        vecB.setY(triangles[i + 1].y);
        vecB.setZ(triangles[i + 1].z);

        vecC.setX(triangles[i + 2].x);
        vecC.setY(triangles[i + 2].y);
        vecC.setZ(triangles[i + 2].z);
        triangle_mesh.addTriangle(vecA, vecB, vecC);
    }

    Ammo.destroy(vecA);
    Ammo.destroy(vecB);
    Ammo.destroy(vecC);

    const shape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true);
    shape.setMargin(0.05);

    shape.calculateLocalInertia(100000000, stadiumInertia);

    let stadiumRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(100000000, stadiumMotionState, shape, stadiumInertia);
    let stadiumRigidbody = new Ammo.btRigidBody(stadiumRigidBodyInfo);

    physicsWorld.addRigidBody(stadiumRigidbody);
    stadium.userData.physicsBody = stadiumRigidbody;
    rigidBodies.push(stadium);

    stadiumRigidbody.setActivationState(4);
    stadiumRigidbody.setCollisionFlags(5);

    stadiumRigidbody.activate();

    homerunColliderObject.userData.tag = "homerun";

    stadiumRigidbody.threeObject = homerunColliderObject;

    console.log("Stadium physics added");
}

// ___________________________STATE
//  1  : ACTIVE
//  2  : ISLAND_SLEEPING
//  3  : WANTS_DEACTIVATION
//  4  : DISABLE_DEACTIVATION
//  5  : DISABLE_SIMULATION

// ___________________________FLAG
//  0  : RIGIDBODY
//  1  : STATIC_OBJECT
//  2  : KINEMATIC_OBJECT
//  4  : NO_CONTACT_RESPONSE
//  8  : CUSTOM_MATERIAL_CALLBACK
//  16 : CHARACTER_OBJECT
//  32 : DISABLE_VISUALIZE_OBJECT
//  64 : DISABLE_SPU_COLLISION_PROCESSING

async function loadBall() {
    await loader.load(`models/baseball.glb`, function (model) {
        let ball = model.scene;
        ball.name = "ball";
        ball.rotation.y = 0 * Math.PI / 180;
        ball.position.set(0, 6.5 * SCALE, -61 * SCALE * sqrt);
        scene.add(ball);
        balls.push(ball);
        createBall();
    });
}

function setUpPhysicsWorld() {
    tempTransform = new Ammo.btTransform();

    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -33 * SCALE, 0));

    console.log("Physics initialized");
}

function startGame() {
    clickToBegin.style.display = "none";
    music.play();
    music.loop = true;
    loadBall();
    animate();
}

async function createBall() {
    if (outCount >= 10) {
        gameOver();
        return;
    }

    let ballTransform = new Ammo.btTransform();
    ballTransform.setIdentity();
    ballTransform.setOrigin(new Ammo.btVector3(0, 6.5 * SCALE, -61 * SCALE * sqrt));
    ballTransform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

    let ballMotionState = new Ammo.btDefaultMotionState(ballTransform);

    let ballInertia = new Ammo.btVector3(0, 0, 0);

    let ballAmmoShape = new Ammo.btSphereShape(0.075);
    ballAmmoShape.setMargin(0.05);
    ballAmmoShape.calculateLocalInertia(149, ballInertia);

    let ballRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(149, ballMotionState, ballAmmoShape, ballInertia);
    let ballRigidbody = new Ammo.btRigidBody(ballRigidBodyInfo);

    balls[balls.length - 1].userData.physicsBody = ballRigidbody;

    ballRigidbody.setActivationState(0);

    ballRigidbody.setRestitution(0.8);
    ballRigidbody.setFriction(1);
    ballRigidbody.setDamping(0, 0.5); // linear damping, rotational damping

    ballRigidBodies.push(ballRigidbody);

    balls[balls.length - 1].userData.tag = "ball" + String(balls.length - 1);
    ballRigidbody.threeObject = balls[balls.length - 1];

    rigidBodies.push(balls[balls.length - 1]);
    physicsWorld.addRigidBody(ballRigidbody);

    console.log("Ball created");

    for (let i = 0; i < ballRigidBodies.length; i++) {
        ballRigidBodies[i].setActivationState(0);
    }

    await sleep(1000);

    pitch();
}

// Hit ball
window.addEventListener('mousedown', function (event) {
    if (pitching && !hit) {
        let width = window.innerWidth, height = window.innerHeight;
        let widthHalf = width / 2, heightHalf = height / 2;

        let pos = balls[balls.length - 1].position.clone();
        pos.project(camera);
        pos.x = (pos.x * widthHalf) + widthHalf;
        pos.y = - (pos.y * heightHalf) + heightHalf;

        let xRatio = (event.clientX - pos.x) / width;
        let yRatio = (event.clientY - pos.y) / height;

        console.log(yRatio);

        var sprayRatio = ((hitWindow / 2) - (balls[balls.length - 1].position.z * -1)) / hitWindow;
        console.log(sprayRatio);

        if (Math.abs(sprayRatio) > 1) {
            return;
        }

        console.log("Hit");
        hit = true;
        pitching = false;

        var spray = (sprayRatio * 50) * Math.PI / 180;

        var exitVelocity;
        if (difficulty <= 1) {
            exitVelocity = (112.5 - (Math.abs(xRatio) * 150) - (Math.abs(yRatio) * 150)) * 5280 / 3600;
        } else if (difficulty == 2) {
            exitVelocity = (112.5 - Math.pow(Math.sqrt(Math.abs(xRatio) * 140), 3) - Math.pow(Math.sqrt(Math.abs(yRatio) * 80), 3)) * 5280 / 3600;
        } else if (difficulty == 3) {
            exitVelocity = (112.5 - Math.pow((Math.abs(xRatio) * 110), 2) - Math.pow((Math.abs(yRatio) * 100), 2)) * 5280 / 3600;
        } else {
            exitVelocity = (112.5 - Math.pow((Math.abs(xRatio) * 130), 2) - Math.pow((Math.abs(yRatio) * 100), 2)) * 5280 / 3600;
        }

        exitVelocity = clamp(exitVelocity, -80 * 5280 / 3600, 115 * 5280 / 3600);

        var launchAngle = (25 + (yRatio * 120)) * Math.PI / 180;
        var exitVelocityHorizontal = Math.cos(launchAngle) * exitVelocity;
        var exitVelocityVertical = Math.sin(launchAngle) * exitVelocity;

        console.log(exitVelocity / 5280 * 3600);

        ballRigidBodies[ballRigidBodies.length - 1].setLinearVelocity(new Ammo.btVector3(Math.sin(spray) * exitVelocityHorizontal * SCALE, exitVelocityVertical * SCALE, Math.cos(spray) * exitVelocityHorizontal * -1 * SCALE));

        updateHitMetrics(Math.round(exitVelocity * 10 / 5280 * 3600) / 10, Math.round((25 + (yRatio * 120)) * 10) / 10);
    }
});

async function gameOver() {
    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = 2.5;

    while (Math.abs(camera.rotation.x - (60 * Math.PI / 180)) > 0.025) {
        camera.rotation.x += ((60 * Math.PI / 180 - (camera.rotation.x)) / 50);
        await sleep(10);
    }
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    fireworksOn = true;

    console.log("Game over");

    tl.fromTo(canvasFire, 1, { opacity: 0 }, { opacity: 1 });

    gameOverContainer.style.display = "flex";
    tl.fromTo(gameOverContainer, 1, { top: "-50vh", opacity: 0 }, { top: 0, opacity: 1 }, "-=1");

    homerunTotalText.innerText = `Home Runs: ${hrCount}`;
}

// Set ball speed
function pitch() {
    homerunContainer.style.display = "none";

    bounced = false;
    homerun = false;

    console.log("Pitched ball");

    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = 2.5;

    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    hit = false;
    pitching = true;

    ballRigidBodies[ballRigidBodies.length - 1].setActivationState(1);
    if (difficulty == 0) {
        ballRigidBodies[ballRigidBodies.length - 1].setLinearVelocity(new Ammo.btVector3((Math.random() - 0.5) * 1, (Math.random() + 0.5) * 2, ((Math.random()) * 4) + 25));
    } else if (difficulty == 1 || difficulty == 2) {
        ballRigidBodies[ballRigidBodies.length - 1].setLinearVelocity(new Ammo.btVector3((Math.random() - 0.5) * 2, (Math.random() + 0.5) * 1.5, ((Math.random()) * 12) + 37));
    } else if (difficulty == 3) {
        ballRigidBodies[ballRigidBodies.length - 1].setLinearVelocity(new Ammo.btVector3((Math.random() - 0.5) * 2.25, (Math.random() + 0.5) * 1.75, ((Math.random()) * 10) + 42));
    } else {
        ballRigidBodies[ballRigidBodies.length - 1].setLinearVelocity(new Ammo.btVector3((Math.random() - 0.5) * 2.25, (Math.random() + 0.5) * 1.25, ((Math.random()) * 10) + 46));
    }

    pitching = true;
}

function clamp(n, min, max) {
    if (n > max) {
        return max;
    } else if (n < min) {
        return min;
    } else {
        return n;
    }
}

//HDRI
new RGBELoader()
    .load('textures/syferfontein_0d_clear_puresky_4k.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        //scene.environment = texture;

        renderer.render(scene, camera);
    });

//Orbit Control for Debugging
if (orbit) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
}

// First render
renderer.render(scene, camera);

// Stadium
function loadStadium() {
    loader.load(`models/Stadium_${stadiumAbbr}.glb`, function (model) {
        stadium = model.scene;
        stadium.name = "stadium";
        stadium.rotation.y = 0 * Math.PI / 180;
        stadium.position.x = 0;
        scene.add(stadium);
        renderer.render(scene, camera);

        console.log("Stadium loaded");
        loadStadiumColliders();
    });
}

function loadStadiumColliders() {
    loader.load(`models/${stadiumAbbr}Colliders.glb`, function (model) {

        console.log("Stadium loaded");
        for (let i = 0; i < model.scene.children.length; i++) {
            setUpStadiumPhysics(model.scene.children[i]);
        }
    });
    loadHomerunColliders();
}

var homerunColliderObject;
function loadHomerunColliders() {
    loader.load(`models/${stadiumAbbr}HomerunColliders.glb`, function (model) {
        homerunColliderObject = model.scene;
        homerunColliderObject.name = "homerun";
        homerunColliderObject.rotation.y = 0 * Math.PI / 180;
        homerunColliderObject.position.x = 0;
        scene.add(homerunColliderObject);
        homerunColliderObject.visible = false;

        console.log("Homerun colliders loaded");
        for (let i = 0; i < model.scene.children.length; i++) {
            setUpHomerunColliders(model.scene.children[i]);
        }
        //console.log(stadium);

        loadingPanel.style.display = "none";
        clickToBegin.style.display = "flex";
        // Game is waiting to start at this point
    });
}

// Adjust window size
window.addEventListener('resize', () => {

    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth * RESOLUTION_SCALE, window.innerHeight * RESOLUTION_SCALE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Tell pitcher to pitch
window.addEventListener('keypress', function (event) {
    //pitch();
});

// Animate periodic function
function animate() {
    requestAnimationFrame(animate);

    // Delta time
    let delta = clock.getDelta();

    // Pause or update ball
    updateBall(delta);
    if (!PAUSE) {
    } else {
        console.log(ball.position.z);
    }

    renderer.render(scene, camera);
}

// Update scene/ball
function updateBall(delta) {
    physicsWorld.stepSimulation(delta, 10);

    for (let i = 0; i < rigidBodies.length; i++) {
        let threeObject = rigidBodies[i];
        let ammoObject = threeObject.userData.physicsBody;
        let ms = ammoObject.getMotionState();

        if (ms) {
            ms.getWorldTransform(tempTransform);
            let pos = tempTransform.getOrigin();
            let quat = tempTransform.getRotation();
            threeObject.position.set(pos.x(), pos.y(), pos.z());
            threeObject.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
        }

    }

    if (hit) {
        let hitBall = balls[balls.length - 1];
        if (!bounced) {
            camera.position.set(hitBall.position.x / 1.5, hitBall.position.y * 1.15 + 5, hitBall.position.z + 15);
        }
        camera.lookAt(hitBall.position);
    }

    if (balls.length > 0 && balls[balls.length - 1].position.z * -1 < -5 && !hit) {
        if (pitching || hit) {
            loadBall();
            pitching = false;
            hit = false;
            outCount++;
            bounced = true;
            updateOutCount();
        }
    }

    if (hit && balls.length > 0 && balls[balls.length - 1].position.y < -2) {
        bounced = true;
    }

    if (balls.length > 0 && hit) {
        detectCollision();
    }

    if (hit && bounced) {
        counter++;
    }
    if (counter > 75) {
        loadBall();
        pitching = false;
        hit = false;
        counter = 0;
        camera.position.x = 0;
        camera.position.y = 1.5;
        camera.position.z = 2.5;

        camera.rotation.x = 0;
        camera.rotation.y = 0;
        camera.rotation.z = 0;
    }
}

function detectCollision() {

    let dispatcher = physicsWorld.getDispatcher();
    let numManifolds = dispatcher.getNumManifolds();

    //console.log(numManifolds);
    for (let i = 0; i < numManifolds; i++) {

        let contactManifold = dispatcher.getManifoldByIndexInternal(i);

        let rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        let rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
        let threeObject0 = rb0.threeObject;
        let threeObject1 = rb1.threeObject;

        if (!threeObject0 && !threeObject1) continue;
        let userData0 = threeObject0 ? threeObject0.userData : null;
        let userData1 = threeObject1 ? threeObject1.userData : null;
        let tag0 = userData0 ? userData0.tag : "none";
        let tag1 = userData1 ? userData1.tag : "none";


        let numContacts = contactManifold.getNumContacts();

        //console.log((tag1));
        if (tag0 == balls[balls.length - 1].userData.tag && tag1 == balls[balls.length - 1].userData.tag) {
            continue;
        }

        for (let j = 0; j < numContacts; j++) {
            let contactPoint = contactManifold.getContactPoint(j);
            let distance = contactPoint.getDistance();

            if (distance > 0.0) continue;

            if (tag1 == "homerun" || tag0 == "homerun") {
                if (tag1 == balls[balls.length - 1].userData.tag || tag0 == balls[balls.length - 1].userData.tag) {
                    if (!bounced && !homerun) {
                        homerun = true;
                        console.log("Homerun");
                        hrCount++;
                        updateHomerunCount();
                    }
                }
            }

            if (tag1 == "wall" || tag0 == "wall") {
                if (tag1 == balls[balls.length - 1].userData.tag || tag0 == balls[balls.length - 1].userData.tag) {
                    if (!bounced && !homerun) {
                        console.log("Ball bounced");
                        outCount++;
                        updateOutCount();
                    }
                    bounced = true;
                }
            }

            let velocity0 = rb0.getLinearVelocity();
            let velocity1 = rb1.getLinearVelocity();
            let worldPos0 = contactPoint.get_m_positionWorldOnA();
            let worldPos1 = contactPoint.get_m_positionWorldOnB();
            let localPos0 = contactPoint.get_m_localPointA();
            let localPos1 = contactPoint.get_m_localPointB();

            break;

            console.log({
                manifoldIndex: i,
                contactIndex: j,
                distance: distance,
                object0: {
                    tag: tag0,
                    velocity: { x: velocity0.x(), y: velocity0.y(), z: velocity0.z() },
                    worldPos: { x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z() },
                    localPos: { x: localPos0.x(), y: localPos0.y(), z: localPos0.z() }
                },
                object1: {
                    tag: tag1,
                    velocity: { x: velocity1.x(), y: velocity1.y(), z: velocity1.z() },
                    worldPos: { x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z() },
                    localPos: { x: localPos1.x(), y: localPos1.y(), z: localPos1.z() }
                }
            });
        }
    }
}