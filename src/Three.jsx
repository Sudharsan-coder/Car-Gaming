import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import moonImg from "./assets/Moon_texture.jpg";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useState } from "react";
import utils from "./utils.js";
import DrawRectangle from "./DrawRectangle.js";
import { moonPosition, moonlightPosition, avaliableCarNames, rectWidth, rectHeight, acceleration, deceleration, maxSpeed, breakPower } from "./constants.js";
function Three({ setParked }) {
  const [loading, setLoading] = useState(true);
  const refContainer = useRef(null);
  const scenes = useRef(null);
  const render = useRef(null);
  const cam = useRef(null);
  const moon = useRef(null);
  const clock = useRef(null);
  const velocity = useRef(null);
  const [cars, setCars] = useState({});
  const [option, setOption] = useState(1);
  const parkingRectangle = useRef(null);
  let moveForward = false;
  let moveBackward = false;
  let turnLeft = false;
  let turnRight = false;
  let breakButton = false;
  let boost = false;
  console.log(loading);
  const handleOnClick = (event) => {
    const newOption = Number(event.target.value);
    if (cars[option]) {
      utils.removeObjectFromScene(cars[option], scenes.current); //removing the previous car
    }
    setOption(newOption);
  };
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        moveBackward = true;
        break;
      case "ArrowUp":
        moveForward = true;
        break;
      case "ArrowLeft":
        turnLeft = true;
        break;
      case "ArrowRight":
        turnRight = true;
        break;
      case " ":
        breakButton = true;
        break;
      case "Shift":
        boost = true;
      default:
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.key) {
      case "ArrowDown":
        moveBackward = false;
        break;
      case "ArrowUp":
        moveForward = false;
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
      case "Shift":
        boost = false;
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
    controls.maxPolarAngle = Math.PI / 2; //To not rotate under the plane
    scenes.current = scene;
    render.current = renderer;
    cam.current = camera;

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat (horizontal)
    plane.position.y = -2;
    plane.receiveShadow = true; // Allow the plane to receive shadows
    planeMaterial.shadowSide = THREE.DoubleSide;
    scene.add(plane);

    clock.current = new THREE.Clock();
    velocity.current = new THREE.Vector3();
    // Rectangle
    parkingRectangle.current = new DrawRectangle(rectWidth, rectHeight, scene);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(2, 30, 30);
    const moonText = new THREE.TextureLoader().load(moonImg);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonText });
    const moonModel = new THREE.Mesh(moonGeometry, moonMaterial);
    moonModel.position.set(...moonPosition);
    scenes.current.add(moonModel);
    moon.current = moonModel;

    // Light
    const light = new THREE.PointLight(0xffffff, 700, 1000); // White light with full intensity, range of 100, decay of 2
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

    //car models
    const loader = new GLTFLoader();
    const getAllCarModels = async () => {
      await Promise.all(
        avaliableCarNames.map((item, index) => {
          return new Promise((resolve, reject) =>
            loader.load(
              item,
              function (gltf) {
                const car = gltf.scene;
                car.position.y = -2;
                car.rotation.y = -4.75;
                car.castShadow = true;
                car.receiveShadow = false;
                cars[index + 1] = car;
                resolve();
              },
              function () {},
              function (error) {
                console.log(error);
                console.log(item);
                reject();
              }
            )
          );
        })
      );
      setCars({ ...cars });
      setLoading(false);
    };
    getAllCarModels();
    camera.position.set(0, 5, 18);
    return () => {
      renderer.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (cam.current && render.current && scenes.current) {
      console.log("render");
      console.log(cars);
      if (cars[option]) {
        scenes.current.add(cars[option]);
      }

      const updateCarPosition = (delta) => {
        if (!cars[option]) return;
        const velocityValue = velocity.current;
        // Handle turning
        if (velocityValue.z != 0 && turnLeft) cars[option].rotation.y += 0.02;
        if (velocityValue.z != 0 && turnRight) cars[option].rotation.y -= 0.02;

        // Handle forward/backward movement
        if (moveForward) {
          if (boost) velocityValue.z += 2 * acceleration * delta;
          else velocityValue.z += acceleration * delta;
        }
        if (moveBackward) {
          velocityValue.z -= acceleration * delta;
        }

        // Apply deceleration
        if (breakButton) {
          if (velocityValue.z > 0) {
            velocityValue.z = Math.max(velocityValue.z - breakPower * deceleration * delta, 0);
          } else {
            velocityValue.z = Math.min(velocityValue.z + breakPower * deceleration * delta, 0);
          }
        } else if (!moveForward && !moveBackward) {
          if (velocityValue.z > 0) {
            velocityValue.z = Math.max(velocityValue.z - deceleration * delta, 0);
          } else {
            velocityValue.z = Math.min(velocityValue.z + deceleration * delta, 0);
          }
        }

        // Limiting speed
        velocityValue.z = Math.max(-maxSpeed, Math.min(maxSpeed, velocityValue.z));

        // Update car position
        cars[option].translateZ(velocityValue.z * delta);

        // Check if the car is parked
        const carLocation = cars[option].position;
        if (parkingRectangle.current?.checkPositionIsInside(carLocation.x, carLocation.z)) {
          setParked(true);
          if (parkingRectangle.current) {
            parkingRectangle.current.changeColor(0xff0000);
            parkingRectangle.current.changePosition(null, -1, null);
            parkingRectangle.current.changeRotation(0.1, null, null);
          }
        } else {
          setParked(false);
          if (parkingRectangle.current) {
            parkingRectangle.current.changeColor(0xffffff);
            parkingRectangle.current.changePosition(null, -1.99, null);
            parkingRectangle.current.changeRotation(0, null, null);
          }
        }
      };

      function animate() {
        const delta = clock.current.getDelta(); // Time elapsed since the last frame
        updateCarPosition(delta);
        moon.current.rotation.x += 0.01;
        moon.current.rotation.y += 0.01;
        render.current.render(scenes.current, cam.current);
      }
      render.current.setAnimationLoop(animate);
    }
  }, [option, loading]);
  return (
    <>
      <canvas ref={refContainer}></canvas>
      {loading ? (
        <div className="buttons">"Loading"</div>
      ) : (
        <>
          <div className="buttons">
            <button value="1" onClick={handleOnClick}>
              1
            </button>
            <button value="2" onClick={handleOnClick}>
              2
            </button>
            <button value="3" onClick={handleOnClick}>
              3
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default Three;
