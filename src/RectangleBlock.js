import * as THREE from "three";

class ReactangleBlock {
  constructor(scene, width, height, depth) {
    this.scene = scene;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x964b00 });
    this.block = new THREE.Mesh(geometry, material);
    this.boundingBox = new THREE.Box3().setFromObject(this.block);
    scene.add(this.block);
  }
  changePosition(x, y, z) {
    if (typeof x == "number") this.block.position.x = x;
    if (typeof y == "number") this.block.position.y = y;
    if (typeof z == "number") this.block.position.z = z;
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.block);
  }

  checkCollided(boundingBox) {
    this.updateBoundingBox();
    return this.boundingBox.intersectsBox(boundingBox);
  }
}

export default ReactangleBlock;
