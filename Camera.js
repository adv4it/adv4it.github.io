class Vector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  // Add two vectors and return a new vector
  add(v) {
    return new Vector(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }

  // Subtract vector v from this vector and return a new vector
  subtract(v) {
    return new Vector(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }

  // Calculate the cross product with another vector and return a new vector
  cross(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  // Calculate the length (magnitude) of this vector
  length() {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

  // Divide this vector by a scalar and return a new vector
  divide(scalar) {
    if (scalar === 0) {
      console.error("Division by zero!");
      return new Vector(0, 0, 0);
    }
    return new Vector(
      this.x / scalar,
      this.y / scalar,
      this.z / scalar
    );


  }

  // Normalize this vector (set its length to 1) and return a new vector
  normalize() {
    const len = this.length();
    if (len === 0) {
      return new Vector(0, 0, 0);
    }
    return this.divide(len);
  }
  multiply(scalar) {
  return new Vector(
    this.x * scalar,
    this.y * scalar,
    this.z * scalar
  );
}
}

class Camera {
  constructor() {
    //this.type='cube';
    //this.position = [0.0, 0.0, 0.0];
    //this.color = [1.0,1.0,1.0,1.0];
    this.eye = new Vector(0, 0, 3);
    this.at = new Vector(0, 0, -100);
    this.up = new Vector(0, 1, 0);
  }

  forward() {
    var f = this.at.subtract(this.eye);
    f = f.divide(f.length());
    this.at = this.at.add(f);
    this.eye = this.eye.add(f);
  }

  back() {
    var f = this.eye.subtract(this.at);
    f = f.divide(f.length());
    this.at = this.at.add(f);
    this.eye = this.eye.add(f);
  }

  left() {
    var f = this.eye.subtract(this.at);
    f = f.divide(f.length());
    var s = f.cross(this.up);
    s = s.divide(s.length());
    this.at = this.at.add(s);
    this.eye = this.eye.add(s);
  }

  right() {
    var f = this.eye.subtract(this.at);
    f = f.divide(f.length());
    var s = this.up.cross(f);
    s = s.divide(s.length());
    this.at = this.at.add(s);
    this.eye = this.eye.add(s);
  }

  up() {
    var f = this.eye.subtract(this.at);
    f = f.divide(f.length());
    var s = f.cross(this.up);
    s = s.divide(s.length());
    var u = s.cross(f);
    u = u.divide(u.length());
    this.at = this.at.add(u);
    this.eye = this.eye.add(u);
  }

  down() {
    var f = this.eye.subtract(this.at);
    f = f.divide(f.length());
    var s = f.cross(this.up);
    s = s.divide(s.length());
    var u = f.cross(s);
    u = u.divide(u.length());
    this.at = this.at.subtract(u);
    this.eye = this.eye.subtract(u);
  }

  // Function to convert camera to lookAt matrix
  getLookAtMatrix() {
    // This could be used to get a matrix for gl.uniformMatrix4fv
    // Implementation would depend on your matrix library
    // Example pseudocode:
    // return createLookAtMatrix(this.eye, this.at, this.up);
  }

  // Pan camera left/right
  pan(angle) {
  // Convert angle to radians
  const radians = angle * (Math.PI / 180);
  
  // Get the vector from eye to at
  const viewVector = this.at.subtract(this.eye);
  
  // Calculate the direction vector
  const direction = viewVector.normalize();
  
  // Calculate the right vector (perpendicular to up and direction)
  const right = direction.cross(this.up).normalize();
  
  // Calculate the rotated view vector
  // We rotate around the up vector
  const cosAngle = Math.cos(radians);
  const sinAngle = Math.sin(radians);
  
  // Apply rotation formula (around up axis)
  const rotatedX = direction.x * cosAngle + right.x * sinAngle;
  const rotatedY = direction.y * cosAngle + right.y * sinAngle;
  const rotatedZ = direction.z * cosAngle + right.z * sinAngle;
  
  const rotatedDirection = new Vector(rotatedX, rotatedY, rotatedZ);
  
  // Scale back to original length
  const scaledDirection = rotatedDirection.multiply(viewVector.length());
  
  // Update at point based on the new direction
  this.at = this.eye.add(scaledDirection);
}

  // Tilt camera up/down
  tilt(angle) {
    // Rotate camera around side vector
    // Implementation would need to calculate side vector and rotate
  }
}