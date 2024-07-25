import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import moonImg from "./assets/Moon_texture.jpg";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useState } from "react";

function Three({ setParked, parked }) {
  const refContainer = useRef(null);
  const scenes = useRef(null);
  const render = useRef(null);
  const cam = useRef(null);
  const moon = useRef(null);
  const parkingMaterial = useRef(null);
  const parkingOutline = useRef(null);
  const clock = useRef(null);
  const velocity = useRef(null);
  const [cars, setCars] = useState({});
  const [option, setOption] = useState(1);

  const removeCar = (car) => {
    if (car) {
      console.log(car);
      scenes.current.remove(car);
      car.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    }
  };
  const handleOnClick = (event) => {
    const newOption = Number(event.target.value);

    if (cars[option]) {
      removeCar(cars[option]);
    }

    // Update the option state first
    setOption(newOption);
    // setOption((pre)=>{removeCar(cars[pre]); return Number(event.target.value)});
  };
  // Locations
  const moonPosition = [15, 8, -6];
  const moonlightPosition = [11, 6, 0];
  const avaliableCarNames = ["/supra.glb", "lambo.glb", "ambasiter.glb"];
  let moveForward = false;
  let moveBackward = false;
  let turnLeft = false;
  let turnRight = false;
  let breakButton = false;
  const rectWidth = 7;
  const rectHeight = 4;

  const acceleration = 0.5; // Acceleration value
  const deceleration = 0.5; // Deceleration value
  const maxSpeed = 5; // Maximum speed

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        // console.log('first')
        moveForward = true;
        break;
      case "ArrowUp":
        moveBackward = true;
        break;
      case "ArrowLeft":
        turnLeft = true;
        break;
      case "ArrowRight":
        turnRight = true;
        break;
      case " ":
        breakButton = true;
      default:
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.key) {
      case "ArrowDown":
        moveForward = false;
        break;
      case "ArrowUp":
        moveBackward = false;
        break;
      case "ArrowLeft":
        turnLeft = false;
        break;
      case "ArrowRight":
        turnRight = false;
        break;
      case " ":
        breakButton = false;
        break;
      default:
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  useEffect(() => {
    // Boilerplate
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Light sky blue color
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: refContainer.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    const controls = new OrbitControls(camera, refContainer.current);
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.05; // Set damping factor
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    scenes.current = scene;
    render.current = renderer;
    cam.current = camera;
    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat (horizontal)
    plane.position.y = -2; // Position the plane slightly below the car model
    plane.receiveShadow = true; // Allow the plane to receive shadows
    planeMaterial.shadowSide = THREE.DoubleSide;
    scene.add(plane);

    clock.current = new THREE.Clock();
    velocity.current = new THREE.Vector3();
    // Rectangle
    const rectVertices = new Float32Array([
      -rectWidth / 2,
      0,
      -rectHeight / 2,
      rectWidth / 2,
      0,
      -rectHeight / 2,
      rectWidth / 2,
      0,
      rectHeight / 2,
      -rectWidth / 2,
      0,
      rectHeight / 2,
      -rectWidth / 2,
      0,
      -rectHeight / 2,
    ]);
    const rectGeometry = new THREE.BufferGeometry();
    rectGeometry.setAttribute("position", new THREE.BufferAttribute(rectVertices, 3));
    const rectMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff }); // Red color
    const rectOutline = new THREE.Line(rectGeometry, rectMaterial);
    rectOutline.position.y = -1.99; // Slightly above the plane to avoid z-fighting
    scenes.current.add(rectOutline);
    parkingOutline.current = rectOutline;
    parkingMaterial.current = rectMaterial;
    // Moon
    const moonGeometry = new THREE.SphereGeometry(2, 30, 30);
    const moonText = new THREE.TextureLoader().load(moonImg);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonText });
    const moonModel = new THREE.Mesh(moonGeometry, moonMaterial);
    moonModel.position.set(...moonPosition);
    scenes.current.add(moonModel);
    moon.current = moonModel;
    // Light
    const light = new THREE.PointLight(0xffffff, 100, 500); // White light with full intensity, range of 100, decay of 2
    light.position.set(...moonlightPosition);
    light.castShadow = true; // Allow the light to cast shadows
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 512; // Default is 512
    light.shadow.mapSize.height = 512; // Default is 512
    light.shadow.camera.near = 0.5; // Default is 0.5
    light.shadow.camera.far = 500; // Default is 500

    scenes.current.add(light);

    //light helper
    // const lightHelperGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    // const lightHelperMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    // const lightHelper = new THREE.Mesh(lightHelperGeometry, lightHelperMaterial);
    // lightHelper.position.copy(light.position); // Position the dot at the light's position
    // scene.add(lightHelper);
    // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(shadowHelper  )

    // Movement variables

    

    const loader = new GLTFLoader();

    avaliableCarNames.forEach((item, index) => {
      loader.load(
        item,
        function (gltf) {
          const car = gltf.scene;
          car.position.y = -2;
          car.rotation.y = 4.75;
          car.castShadow = true;
          car.receiveShadow = false;
          cars[index + 1] = car;
          setCars({ ...cars });
          // setParked(true);
        },
        function () {
          // setParked(false);
        },
        function (error) {
          console.log(error);
          console.log(item);
        }
      );
    });

    return () => {
      renderer.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  // Car model
  // useEffect(() => {

  // }, [option]);

  useEffect(() => {
    if (cam.current && render.current && scenes.current) {
      console.log("render");
      // console.log(cars)
      // for(const key in cars){
      //   if(cars[key])
      //     scenes.current.remove(cars[key])
      //     console.log(cars[key])
      // }

      if (cars[option]) {
        scenes.current.add(cars[option]);
      }

      const updateCarPosition = (delta) => {
        // console.log('first')
        if (!cars[option]) return;
        const velocityValue = velocity.current;
        // Handle turning
        if (turnLeft) cars[option].rotation.y += 0.02;
        if (turnRight) cars[option].rotation.y -= 0.02;

        // Handle forward/backward movement
        if (moveForward) {
          console.log("forward");
          velocityValue.z -= acceleration * delta;
        }
        if (moveBackward) {
          velocityValue.z += acceleration * delta;
        }

        // Apply deceleration
        if (!moveForward && !moveBackward) {
          if (velocityValue.z > 0) {
            velocityValue.z = Math.max(velocityValue.z - deceleration * delta, 0);
          } else {
            velocityValue.z = Math.min(velocityValue.z + deceleration * delta, 0);
          }
        }

        // Limit speed
        velocityValue.z = Math.max(-maxSpeed, Math.min(maxSpeed, velocityValue.z));

        // Update car position
        if (!breakButton) cars[option].translateZ(velocityValue.z * delta);

        // Check if the car is parked
        const carLocation = cars[option].position;
        if (Math.abs(carLocation.x) <= rectWidth / 2 && Math.abs(carLocation.z) <= rectHeight / 2) {
          setParked(true);
          if (parkingOutline.current) {
            parkingMaterial.current.color.set(0xff0000);
            parkingOutline.current.position.y = -1;
            parkingOutline.current.rotation.x = 0.1;
          }
        } else {
          setParked(false)
          if (parkingOutline.current) {
            parkingMaterial.current.color.set(0xffffff);
            parkingOutline.current.position.y = -1.99;
            parkingOutline.current.rotation.x = 0;
          }
        }
      };

      cam.current.position.set(0, 3, 12);

      function animate() {
        const delta = clock.current.getDelta(); // Time elapsed since the last frame
        updateCarPosition(delta);
        moon.current.rotation.x += 0.01;
        moon.current.rotation.y += 0.01;
        render.current.render(scenes.current, cam.current);
      }
      render.current.setAnimationLoop(animate);
    }
  }, [option]);
  return (
    <>
      <canvas ref={refContainer}></canvas>
      <div className="buttons">
        <button value="1" onClick={handleOnClick}>
          {" "}
          1{" "}
        </button>
        <button value="2" onClick={handleOnClick}>
          2
        </button>
        <button value="3" onClick={handleOnClick}>
          3
        </button>
      </div>
    </>
  );
}

export default Three;
