import { World, System, TagComponent } from "ecsy";
import * as THREE from 'three';

const NUM_ELEMENTS = 10;
const SPEED_MULTIPLIER = 0.1;
const SHAPE_SIZE = 50;
const SHAPE_HALF_SIZE = SHAPE_SIZE / 2;
const SCENE_RADIUS = 4;

// Initialize canvas
// let canvas = document.querySelector("canvas");
// let canvasWidth = canvas.width = window.innerWidth;
// let canvasHeight = canvas.height = window.innerHeight;
// let ctx = canvas.getContext("2d");
// const renderer = new THREE.WebGLRenderer({canvas});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
camera.position.z = 5;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//----------------------
// Components
//----------------------


// Velocity component
class Velocity {
  constructor() {
    this.x = this.y = 0;
  }
}

// Position component
class Position {
  constructor() {
    this.value = new THREE.Vector3( 0, 0, 0 );
  }
}

class Shape extends TagComponent {}

// Shape component
class Cube {
  constructor() {
    var cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    console.log('adding cube')
    scene.add( cube );
    this.primative = 'cube';
    this.mesh = cube;
  }
}

class Sphere {
  constructor() {
    var sphereGeometry = new THREE.SphereGeometry( 0.5, 16, 16 );
    var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    console.log('adding sphere')
    scene.add( sphere );
    this.primative = 'sphere';
    this.mesh = sphere;
  }
}


//----------------------
// Systems
//----------------------

// MovableSystem
class MovableSystem extends System {
  // This method will get called on every frame by default
  execute(delta, time) {
    // Iterate through all the entities on the query
    this.queries.moving.results.forEach(entity => {
      var velocity = entity.getComponent(Velocity);
      var position = entity.getMutableComponent(Position);
      // console.log('position', position)
      var shape = entity.getMutableComponent(Cube) || entity.getMutableComponent(Sphere)
      // console.log('shape', shape.position)
      var newX = shape.mesh.position.x + velocity.x;
      var newY = shape.mesh.position.y + velocity.y;
      shape.mesh.position.set(Math.abs(newX) > SCENE_RADIUS ? newX * -1 : newX, Math.abs(newY) > SCENE_RADIUS ? newY * -1 : newY , 0);
      // shape.mesh.position.set(position.value.x > 10 ? 0 : position.value.x, position.value.y > 10 ? 0 : position.value.y, position.value.z > 10 ? 0 : position.value.z);
    });

  }
}

// Define a query of entities that have "Velocity" and "Position" components
MovableSystem.queries = {
  moving: {
    components: [Velocity, Position]
  }
}


// Create world and register the systems on it
var world = new World();
world
  .registerSystem(MovableSystem);

// Some helper functions when creating the components
function getRandomVelocity() {
  return {
    x: SPEED_MULTIPLIER * (2 * Math.random() - 1), 
    y: SPEED_MULTIPLIER * (2 * Math.random() - 1)
  };
}

function getRandomPosition() {
  return { 
    value: new THREE.Vector3(Math.random(), Math.random(), 0)
  };
}

function getRandomShape() {
   return Math.random() >= 0.5 ? Cube : Sphere;
}

for (let i = 0; i < NUM_ELEMENTS; i++) {
  world
    .createEntity()
    .addComponent(Velocity, getRandomVelocity())
    .addComponent(getRandomShape())
    .addComponent(Shape)
    .addComponent(Position, getRandomPosition())
}
      
// Run!
function run() {
  // Compute delta and elapsed time
  var time = performance.now();
  var delta = time - lastTime;

  // Run all the systems
  world.execute(delta, time);

  lastTime = time;
  requestAnimationFrame(run);
  renderer.render( scene, camera );
  
}

var lastTime = performance.now();
run();