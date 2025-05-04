class circularChannel {
  constructor(center, radius, channelWidth, phi0, phi1) {
    this.channelWidth = channelWidth; // width of the circular track
    this.center = center; // point on the circular track
    this.radius = radius; // radius of the circular track
    this.phi0 = phi0; // initial azimuth angle
    this.phi1 = phi1; // final azimuth angle

    this.phi_center = phi0 - (phi0 - phi1) / 2; // azimuth angle for the center of the track
    this.phi_disk = phi0 - (phi0 - phi1) / 10; // azimuth angle for the disk on the track
  }

  drawCircularTrack() {
    // Draw outer and inner arcs for the circular track
    noFill();
    stroke(0);
    strokeWeight(3);
    this.draw3DArc(
      this.center,
      this.phi0,
      this.phi1,
      this.radius + this.channelWidth / 2
    );
    this.draw3DArc(
      this.center,
      this.phi0,
      this.phi1,
      this.radius - this.channelWidth / 2
    );



  }

  draw3DArc(origin, azStart, azEnd, radius, res = 60) {
    noFill();
    beginShape();
    for (let i = 0; i <= res; i++) {
      let a = map(i, 0, res, azStart, azEnd);
      let x = origin.x + radius * cos(a);
      let y = origin.y + radius * sin(a);
      let z = origin.z;
      vertex(x, y, z);
    }
    endShape();
  }

  /**
   * Returns the 3D position of a disk moving along the arc at angle `theta`
   * @param {number} phi - Azimuthal angle (in radians)
   * @returns {p5.Vector} 3D position (x, y, z)
   */
  positionAtPhi(phi) {
    let r = this.radius; // centerline radius
    let x = this.center.x + r * Math.cos(phi);
    let y = this.center.y + r * Math.sin(phi);
    let z = this.center.z;
    return createVector(x, y, z);
  }

  drawDisk(phi = this.phi_disk, height = 10, colorVal = [255, 0, 0]) {
    const pos = this.positionAtPhi(phi);
    push();
    translate(pos.x, pos.y, pos.z + height / 2); // z offset to sit on table
    rotateX(HALF_PI); // flat in XY plane
    fill(colorVal);
    stroke(0);
    strokeWeight(0.5)
    cylinder(0.9 * this.channelWidth / 2, height);
    pop();
  }

  drawTabletop(sizeX = 320, sizeY = 320, colorVal = 230) {
    push();
    translate(this.center.x, this.center.y, this.center.z - 0.5); // slightly below Z=0
    // rotateX(HALF_PI); // XY plane
    fill(colorVal, colorVal, colorVal, 100); // R, G, B, A (alpha = 100 out of 255)

    noStroke();
    plane(sizeX, sizeY);
    pop();
  }

  drawLabeledPoints(labelSize = 24) {
    textSize(labelSize);
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
  
    // O (center)
    push();
    translate(this.center.x, this.center.y, this.center.z + 1);
    ellipse(0, 0, 6);  // small dot
    noLights();

    text("O", 5, -15);
    pop();
  
    // P (at phi0)
    this._drawLabeledPoint(this.phi0, "P", -35, -12); // -12,-12
  
    // Q (midpoint)
    const phiQ = (this.phi0 + this.phi1) / 2;
    this._drawLabeledPoint(phiQ, "Q", -12, 15);
  
    // R (at phi1)
    this._drawLabeledPoint(this.phi1, "R", 30, 0);
  }
  
  // Helper function to place labeled point at angle phi
  _drawLabeledPoint(phi, label, dx = 0, dy = 0) {
    const r = this.radius;
    const x = this.center.x + r * cos(phi);
    const y = this.center.y + r * sin(phi);
    const z = this.center.z;
  
    push();
    translate(x, y, z + 1);
    fill(0);
    ellipse(0, 0, 6);  // point marker
    noLights();
    text(label, dx, dy);  // label offset
    pop();
  }
  
}
