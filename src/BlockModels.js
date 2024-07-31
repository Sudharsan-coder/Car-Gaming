import * as THREE from "three";
import utils from "./utils";

class BlockModel {
  constructor(scene, name, x, y, z) {
    this.scene = scene;
    this.name = name;
    this.position = new THREE.Vector3(x, y, z);
    this.boundingBox = new THREE.Box3();
    this.model = null;
  }

  async init() {
    this.model = await utils.loadModel(this.name);
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.model.scale.set(30,30,30); // Apply initial scale
    this.boundingBox.setFromObject(this.model);
    this.scene.add(this.model);
  }

  changePosition(x, y, z) {
    if (typeof x === "number") this.model.position.x = x;
    if (typeof y === "number") this.model.position.y = y;
    if (typeof z === "number") this.model.position.z = z;
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.model);
  }

  checkCollided(boundingBox) {
    this.updateBoundingBox();
    return this.boundingBox.intersectsBox(boundingBox);
  }
}

export default BlockModel;
