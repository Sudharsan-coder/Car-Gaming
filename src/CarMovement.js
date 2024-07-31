import { acceleration, breakPower, maxSpeed, deceleration, initalCameraPosition } from "./constants";
import * as THREE from "three";
class CarMovement {
  constructor() {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          this.moveBackward = true;
          break;
        case "ArrowUp":
          this.moveForward = true;
          break;
        case "ArrowLeft":
          this.turnLeft = true;
          break;
        case "ArrowRight":
          this.turnRight = true;
          break;
        case " ":
          this.breakButton = true;
          break;
        case "Shift":
          this.boost = true;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowDown":
          this.moveBackward = false;
          break;
        case "ArrowUp":
          this.moveForward = false;
          break;
        case "ArrowLeft":
          this.turnLeft = false;
          break;
        case "ArrowRight":
          this.turnRight = false;
          break;
        case " ":
          this.breakButton = false;
          break;
        case "Shift":
          this.boost = false;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  updateCarPosition(delta, car, velocityValue, parkingRectangle, block, camera, setParked) {
    if (!car) return;
    // const velocityValue = velocity;
    console.log(velocityValue);
    // Handle turning
    if (velocityValue.z != 0 && this.turnLeft) car.rotation.y += 0.02;
    if (velocityValue.z != 0 && this.turnRight) car.rotation.y -= 0.02;

    // Handle forward/backward movement
    if (this.moveForward) {
      if (this.boost) velocityValue.z += 2 * acceleration * delta;
      else velocityValue.z += acceleration * delta;
    }
    if (this.moveBackward) {
      velocityValue.z -= acceleration * delta;
    }

    // Apply deceleration
    if (this.breakButton) {
      if (velocityValue.z > 0) {
        velocityValue.z = Math.max(velocityValue.z - breakPower * deceleration * delta, 0);
      } else {
        velocityValue.z = Math.min(velocityValue.z + breakPower * deceleration * delta, 0);
      }
    } else if (!this.moveForward && !this.moveBackward) {
      if (velocityValue.z > 0) {
        velocityValue.z = Math.max(velocityValue.z - deceleration * delta, 0);
      } else {
        velocityValue.z = Math.min(velocityValue.z + deceleration * delta, 0);
      }
    }
    // Limiting speed
    velocityValue.z = Math.max(-maxSpeed, Math.min(maxSpeed, velocityValue.z));
    // Update car position
    const boundingBox = new THREE.Box3().setFromObject(car);
    for (const singleBlock in block)
      if (block[singleBlock].checkCollided(boundingBox)) {
        car.translateZ(-velocityValue.z * delta);
        velocityValue.z = -velocityValue.z / 2;
        break;
      }
    car.translateZ(velocityValue.z * delta);
    if (parkingRectangle.checkCollided(boundingBox)) {
      setParked(true);
      if (parkingRectangle) {
        parkingRectangle.changeColor(0xff0000);
        parkingRectangle.changePosition(null, -1, null);
        parkingRectangle.changeRotation(0.1, null, null);
      }
    } else {
      setParked(false);
      if (parkingRectangle) {
        parkingRectangle.changeColor(0xffffff);
        parkingRectangle.changePosition(null, -1.99, null);
        parkingRectangle.changeRotation(0, null, null);
      }
    }
    const carPosition = new THREE.Vector3();
    car.getWorldPosition(carPosition);

    const carQuaternion = new THREE.Quaternion();
    car.getWorldQuaternion(carQuaternion);
    const carRotation = new THREE.Euler().setFromQuaternion(carQuaternion);

    // Calculate the new camera position based on the offset
    const cameraPosition = new THREE.Vector3().applyEuler(carRotation).add(carPosition);
    // Set the camera's position and look at the car

    // if(this.moveForward || this.moveBackward){
    camera.position.x = cameraPosition.x;
    camera.position.z = cameraPosition.z + 15;
    // }
    // camera.position=cameraPosition.position
    // camera.position.copy(cameraPosition);
    // camera.lookAt(carPosition);
  }
}
export default CarMovement;
