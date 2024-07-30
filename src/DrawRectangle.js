import * as THREE from "three";

class RectangleDrawer {
  constructor(rectWidth, rectHeight, scene) {
    this.width = rectWidth;
    this.height = rectHeight;
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

    const Geometry = new THREE.BufferGeometry();
    Geometry.setAttribute("position", new THREE.BufferAttribute(rectVertices, 3));
    this.material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Red color
    this.outline = new THREE.Line(Geometry, this.material);
    this.boundingBox = new THREE.Box3().setFromObject(this.outline);

    // this.outline.position.y = -1.99; // Slightly above the plane to avoid z-fighting
    // this.outline.position.x = 10;
    scene.add(this.outline);
  }
  changeColor(newColor) {
    if (this.material) {
      this.material.color.set(newColor);
    }
  }
  changePosition(x, y, z) {
    if (typeof x == "number") this.outline.position.x = x;
    if (typeof y == "number") this.outline.position.y = y;
    if (typeof z == "number") this.outline.position.z = z;
  }
  changeRotation(x, y, z) {
    if (typeof x == "number") this.outline.rotation.x = x;
    if (typeof y == "number") this.outline.rotation.y = y;
    if (typeof z == "number") this.outline.rotation.z = z;
  }
  checkPositionIsInside(x_start, z_start,x_end,z_end) {
    console.log('car :  ',x_end)
    console.log('park : ',-this.width / 2 + this.outline.position.x)
    return (
      x_end >= -this.width / 2 + this.outline.position.x &&
      x_start <= this.width / 2 + this.outline.position.x &&
      z_end >= -this.height / 2 + this.outline.position.z &&
      z_start <= this.height / 2 + this.outline.position.z
    );
  }
  updateBoundingBox() {
    this.boundingBox.setFromObject(this.outline);
  }

  checkCollided(boundingBox) {
    this.updateBoundingBox();
    return (
      boundingBox.min.x >= this.boundingBox.min.x &&
      boundingBox.max.x <= this.boundingBox.max.x &&
      boundingBox.min.z >= this.boundingBox.min.z &&
      boundingBox.max.z <= this.boundingBox.max.z
    );
  }
}

export default RectangleDrawer;
