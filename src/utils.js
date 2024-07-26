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
};

