import React, { useContext, useEffect, useRef, useState } from "react";
import { CircularProgress } from "@nextui-org/react";
import { currentCar } from "./App.jsx";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import utils from "./utils.js";
import moonImg from "./assets/Moon_texture.jpg";
import DrawRectangle from "./DrawRectangle.js";
import BlockModel from "./BlockModels.js";
import CarMovement from "./CarMovement.js";
import { moonPosition, initalCameraPosition, moonlightPosition, avaliableCarNames, rectWidth, rectHeight } from "./constants.js";

function Three({ setParked }) {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const scenes = useRef(null);
  const cam = useRef(null);
  const clock = useRef(null);
  const velocity = useRef(null);
  const block = useRef([]);
  const [cars, setCars] = useState([]);
  const selectedCar=useRef(null)
  const { option } = useContext(currentCar);
  const parkingRectangle = useRef(null);
  const control=useRef(null)
  const carMovement = useRef(new CarMovement());

  useEffect(() => {
    // Boilerplate
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Light sky blue color
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.05; // Set damping factor
    controls.maxPolarAngle = Math.PI / 2; //To not rotate under the plane
    controls.minPolarAngle = 0;
    controls.enableZoom = true; // Allow zooming in and out
    controls.enablePan = true;
    scenes.current = scene;
    cam.current = camera;
    control.current=controls
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
    parkingRectangle.current.changePosition(10, 2);
    
    // Moon
    const moonGeometry = new THREE.SphereGeometry(2, 30, 30);
    const moonText = new THREE.TextureLoader().load(moonImg);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonText });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(...moonPosition);
    scene.add(moon);

    // Light
    const light = new THREE.PointLight(0xffffff, 700, 1000); // White light with full intensity, range of 100, decay of 2
    light.position.set(...moonlightPosition);
    light.castShadow = true; // Allow the light to cast shadows
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 512; // Default is 512
    light.shadow.mapSize.height = 512; // Default is 512
    light.shadow.camera.near = 0.5; // Default is 0.5
    light.shadow.camera.far = 500; // Default is 500
    
    scene.add(light);
    
    //light helper
    // const lightHelperGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    // const lightHelperMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    // const lightHelper = new THREE.Mesh(lightHelperGeometry, lightHelperMaterial);
    // lightHelper.position.copy(light.position); // Position the dot at the light's position
    // scene.add(lightHelper);
    // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(shadowHelper)
    
    //car models
    const getAllCarModels = async () => {
      let j=0;
      for(let i=10;i<60;i+=10){
      block.current[j] = new BlockModel(scene,"phone_both.glb",i,-2,-i);
      await block.current[j++].init()
      }
      const cars = await Promise.all(
        avaliableCarNames.map((item, index) => {
          return new Promise(async (resolve, reject) => {
            const car = await utils.loadModel(item);
            car.position.y = -2;
            car.rotation.y = -4.75;
            resolve(car);
          });
        })
      );
      setCars([...cars]);
      setLoading(false);
    };

    getAllCarModels();
    function animate() {
      const delta = clock.current.getDelta(); // Time elapsed since the last frame
      carMovement.current.updateCarPosition(delta, selectedCar.current, velocity.current, parkingRectangle.current, block.current, cam.current, setParked);
      moon.rotation.x += 0.01;
      moon.rotation.y += 0.01;
      renderer.render(scenes.current, cam.current);
    }
    renderer.setAnimationLoop(animate);
    camera.position.set(...initalCameraPosition);
    return () => {
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (cam.current && scenes.current) {
      let previousCarPosition = null;
      let previousCarRotation = null;
      for (const index in cars) {
        if (scenes.current.children.includes(cars[index])) {
          previousCarPosition = cars[index].position.clone();
          previousCarRotation = cars[index].rotation.clone(); // Clone the rotation vector to avoid reference issues
          utils.removeObjectFromScene(cars[index], scenes.current);
        }
      } // Removing the previous car

      scenes.current.add(cars[option]);
      if (previousCarPosition && previousCarRotation) {
        cars[option].position.copy(previousCarPosition);
        cars[option].rotation.copy(previousCarRotation);
      } // Adding the current car

      selectedCar.current=cars[option]
    }
  }, [option, loading]);

  return (
    <>
      <canvas style={{display:loading?"none":""}} ref={canvasRef}></canvas>
      {loading && <CircularProgress style={{ zIndex: 100, position: "absolute", bottom: "45%", left: "45%" }} aria-label="Loading..." />}
    </>
  );
}

export default Three;
