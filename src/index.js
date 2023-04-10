import * as THREE from 'three';
import ballUrl from '../public/ball-uv.png';
import floorURl from '../public/piso1.jpg';
import field1Url from '../public/pitch.png';
import stadiumUrl from '../public/stadium351.png';
import trajectoryJson from '../public/demo1.json';
import trajectoryJson2 from '../public/demo2.json';
import trajectoryJson3 from '../public/demo3.json';
import bowlerUrl from '../public/bowler.png';
import stumpsUrl from '../public/stumps.png';
import slipUrl from '../public/slip.png';
import wicketsUrl_IPL from '../public/adWickets_ipl2.png';
import gsap from 'gsap';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './index.css';


function getControlPoint (p1, p2) {
    return (1-.5) * p1 + (.5) * p2;
}

const textureLoader = new THREE.TextureLoader();
let ballsTogether = false;
let balls = [];
let indexBall = 0;
const velocity = 19;

function createTrajectory (data, ballMesh, ballsTogether) {
    const trajectoryData = data.match.delivery.trajectory; 
    const sphereGeometry = new THREE.SphereGeometry(0.1, 40, 20);
    const imgBall = textureLoader.load(ballUrl);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: imgBall, 
    });
    ballMesh.ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
    ballMesh.ball.visible = ballsTogether;
    scene.add(ballMesh.ball);
    const releasePosition = trajectoryData.releasePosition;
    const bouncePosition = trajectoryData.bouncePosition;
    const creasePosition = trajectoryData.creasePosition; 
    const vecRelease = new THREE.Vector3(releasePosition.x, releasePosition.z, releasePosition.y);
    const vecBounce = new THREE.Vector3(bouncePosition.x, bouncePosition.z, bouncePosition.y);
    const vecCrease = new THREE.Vector3(creasePosition.x, creasePosition.z, creasePosition.y);
    const distanceCurve1 = vecRelease.distanceTo(vecBounce);
    const distanceCurve2 = vecBounce.distanceTo(vecCrease);
    const curve = new THREE.QuadraticBezierCurve3(
        vecRelease,
        new THREE.Vector3(getControlPoint(releasePosition.x, bouncePosition.x), releasePosition.z, getControlPoint(releasePosition.y, bouncePosition.y)),
        vecBounce,
    );
    const numberPoints1 = Math.round(distanceCurve1 * velocity);
    const points = curve.getPoints( numberPoints1 );
    const curve2 = new THREE.QuadraticBezierCurve3(
        vecBounce,
        new THREE.Vector3(getControlPoint(bouncePosition.x, creasePosition.x), creasePosition.z, getControlPoint(bouncePosition.y, creasePosition.y)),
        vecCrease
    );
    const numberPoints2 = Math.round(distanceCurve2 * velocity);
    const points2 = curve2.getPoints( numberPoints2 );
    const directions = [...points, ...points2];
    const pointsLines = [];
    

    directions.map((element) => {
        pointsLines.push([element.x, element.y, element.z]);
    });
    const geometry = new MeshLine();
    geometry.setPoints(pointsLines.flat());
    const materialLine = new MeshLineMaterial({
        color: ballMesh.colorLine,
        lineWidth: 0.15,
        transparent: true,
        opacity: 0.5,
    });
    geometry.setDrawRange(0, 0);
    ballMesh.line = new THREE.Mesh(geometry, materialLine);
    ballMesh.line.geometry.attributes.position.needsUpdate = true;
    scene.add(ballMesh.line);
    ballMesh.directions = directions;
    ballMesh.render = true;
}

function playTheseBalls (ballsTogetherBoolean, data1, data2, data3, data4, data5, data6) {
    ballsTogether = ballsTogetherBoolean;
    if (data1) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff0000});
        createTrajectory(data1, balls[0], ballsTogetherBoolean);
    };
    if (data2) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0x2def33});
        createTrajectory(data2, balls[1], ballsTogetherBoolean);
    };
    if (data3) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xffe604});
        createTrajectory(data3, balls[2], ballsTogetherBoolean);
    };
    if (data4) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0x2018ff});
        createTrajectory(data4, balls[3], ballsTogetherBoolean);
    };
    if (data5) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff7c18});
        createTrajectory(data5, balls[4], ballsTogetherBoolean);
    };
    if (data6) {
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff186d});
        createTrajectory(data6, balls[5], ballsTogetherBoolean);
    };
}


const container = document.querySelector('.three-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA3A3A3);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -15;
camera.position.y = 3.5;
camera.position.z = 0;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGL1Renderer({
    antialias: true
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

playTheseBalls(false, trajectoryJson, trajectoryJson2, trajectoryJson3);

const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

let xField = 32;
let zField = -32;

for (let i = 1; i < 26; i++) {
    const floorImg = textureLoader.load(floorURl);
    const planeGeometry = new THREE.PlaneGeometry(17, 17);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        map: floorImg
    });
    const floor = new THREE.Mesh(planeGeometry, planeMaterial);
    floor.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), THREE.MathUtils.degToRad(90) );
    floor.position.set(xField, -.1, zField);
    scene.add(floor);
    xField -= 17;
    if (i % 5 === 0) {
        zField += 17;
        xField = 32;
    }
}

const fieldImg = textureLoader.load(field1Url);
const fieldGeometry = new THREE.PlaneGeometry(22.49, 6);
const fieldMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
    map: fieldImg
});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.position.set(0, -0.06, 0);
field.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), THREE.MathUtils.degToRad(90) );
scene.add(field);


const imgStadium = textureLoader.load(stadiumUrl);
const geometryC = new THREE.CylinderGeometry( 40, 40, 35, 32, 40, true );
const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: imgStadium,
    transparent: true
});
const cylinder = new THREE.Mesh( geometryC, material );
cylinder.position.y = 17;
scene.add( cylinder );

const wicketsImg = textureLoader.load(wicketsUrl_IPL);
const wicketsGeometry = new THREE.PlaneGeometry(0.22, 0.72);
const wicketsMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    map: wicketsImg
});

const wickets = new THREE.Mesh(wicketsGeometry, wicketsMaterial); 
wickets.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(270) ); 
wickets.rotateOnAxis( new THREE.Vector3( 1, 0, 0  ), THREE.MathUtils.degToRad(-12) ); 
wickets.position.set(-9.9, 0.3, 0); 
scene.add(wickets); 

const wickets2 = new THREE.Mesh(wicketsGeometry, wicketsMaterial);
wickets2.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(90) );
wickets2.position.set(10.03, 0.3, 0);
scene.add(wickets2);


function resetAnimation () {
    if (ballsTogether) {
        for (let i = 0; i < balls.length; i++) {
            balls[i].animation = 0;
            balls[i].countDrawn = 0;
        };
    } else {
        for (let i = 0; i < balls.length; i++) {
            balls[i].animation = 0;
            balls[i].countDrawn = 0;
            balls[i].line.visible = false;
            balls[i].ball.visible = false;
        }
        indexBall = 0;
    }
}

const containerReset = document.querySelector('.container-reset');
containerReset.addEventListener('click', resetAnimation);

const containerViews = document.querySelector('.views-container');
const viewButton = document.querySelector('.container-view');
let isViews = false;
const divViews = document.createElement('div');
divViews.className = 'views';
const divBowler = document.createElement('div');
divBowler.className = 'bowler-view';
const imgBowler = document.createElement('img');
imgBowler.className = 'view-image';
imgBowler.src = bowlerUrl;
divBowler.appendChild(imgBowler);
const divSlip = document.createElement('div');
divSlip.className = 'slip-view';
const imgSlip = document.createElement('img');
imgSlip.className = 'view-image';
imgSlip.src = slipUrl;
divSlip.appendChild(imgSlip);
const divStupm = document.createElement('div');
divStupm.className = 'stumps-view';
const imgStumps = document.createElement('img');
imgStumps.className = 'view-image';
imgStumps.src = stumpsUrl;
divStupm.appendChild(imgStumps);

divViews.appendChild(divBowler);
divViews.appendChild(divSlip);
divViews.appendChild(divStupm);

viewButton.addEventListener('click', () => {
    isViews = !isViews;
    if (isViews) {
        containerViews.appendChild(divViews);
    } else {
        containerViews.removeChild(divViews);
    }
});

divBowler.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: 11, 
        y: 2.4, 
        z: 0,
        ease: 'power3.inOut',
        duration: 2,
        onUpdate: () => {
            camera.lookAt(new THREE.Vector3(0, 0, 0))
        },
    });
});

divSlip.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: -12.5, 
        y: 1.5, 
        z: 3,
        duration: 2,
        ease: 'power3.inOut',
        onUpdate: () => {
            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
    });
});

divStupm.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: -15, 
        y: 3.5,
        z: 0,
        duration: 2,
        ease: 'power3.inOut',
        onUpdate: () => {
            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
    });
});

function animateBall (ball) {
    if (ball.animation < ball.directions.length) {
        const position = ball.directions[ball.animation];
        ball.ball.position.x = position.x;
        ball.ball.position.y = position.y;
        ball.ball.position.z = position.z;
        ball.line.geometry.setDrawRange( 0, ball.countDrawn );
        const countDrawn = ball.countDrawn + 6;
        ball.countDrawn = countDrawn;
        const animation = ball.animation + 1;
        ball.animation = animation;
    }
}


function animate() {
    if (ballsTogether) {
        if (balls[0]) {
            animateBall(balls[0]);
        };
        if (balls[1]) {
            animateBall(balls[1]);
        };
        if (balls[2]) {
            animateBall(balls[2]);
        };
        if (balls[3]) {
            animateBall(balls[3]);
        };
        if (balls[4]) {
            animateBall(balls[4]);
        };
        if (balls[5]) {
            animateBall(balls[5]);
        };
    } else {
        if (balls[indexBall]) {
            balls[indexBall].ball.visible = true;
            balls[indexBall].line.visible = true;
            animateBall(balls[indexBall]);
            if (balls[indexBall].animation === balls[indexBall].directions.length - 1) {
                indexBall++;
            };
        }
    };

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
