import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export default {
  removeObjectFromScene: (property, scene) => {
    scene.remove(property);
    property.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
  },
  loadModel(path){
    return new Promise((resolve, reject) =>
      loader.load(
        path,
        function (gltf) {
          const car = gltf.scene;
          resolve(car);
        },
        function () {},
        function (error) {
          console.log(error);
          console.log(path);
          reject();
        }
      )
    );
  }
};

