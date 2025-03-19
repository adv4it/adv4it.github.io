class Vector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  add(v) {
    return new Vector(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }

  subtract(v) {
    return new Vector(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }

  cross(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length() {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

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
    // start point
    this.eye = new Vector(-25, 2, -22.6); // starting position
    this.at = new Vector(-1.2, 0, -1.2);  // maze starting positon
    this.up = new Vector(0, 1, 0);
    this.moveSpeed = 0.2;
    this.collisionRadius = 0.4;
  }

  // Check for collisions with maze walls
  checkCollision(newPosition) {
    // Convert world coordinates to map grid coordinates
    const mapX = Math.floor((newPosition.x + 25) / 2.38);
    const mapZ = Math.floor((newPosition.z + 25) / 2.38);
    
    // Check if out of bounds
    if (mapX < 0 || mapX >= 21 || mapZ < 0 || mapZ >= 21) {
      return true; // Collision with boundary
    }
    
    // Check if the position corresponds to a wall (1) in the map
    return g_map[mapX][mapZ] === 1;
  }

  // secondary collision check
  advancedCollisionCheck(newPosition) {
    // Check collision at the camera position
    if (this.checkCollision(newPosition)) {
      return true;
    }
    
    // Check collision points around the camera (creating a collision volume)
    const checkPoints = [
      new Vector(newPosition.x + this.collisionRadius, newPosition.y, newPosition.z),
      new Vector(newPosition.x - this.collisionRadius, newPosition.y, newPosition.z),
      new Vector(newPosition.x, newPosition.y, newPosition.z + this.collisionRadius),
      new Vector(newPosition.x, newPosition.y, newPosition.z - this.collisionRadius)
    ];
    
    // If any check point collides, return true
    for (const point of checkPoints) {
      if (this.checkCollision(point)) {
        return true;
      }
    }
    
    return false; // No collision detected
  }

  // Move forward with collision detection
  forward(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    const direction = this.at.subtract(this.eye).normalize();
    
    const newPosition = this.eye.add(direction.multiply(moveAmount));
    
    if (!this.advancedCollisionCheck(newPosition)) {
      const movement = direction.multiply(moveAmount);
      this.eye = this.eye.add(movement);
      this.at = this.at.add(movement);
    }
  }

  // Move backward with collision detection
  back(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    const direction = this.eye.subtract(this.at).normalize();
    
    const newPosition = this.eye.add(direction.multiply(moveAmount));
    
    if (!this.advancedCollisionCheck(newPosition)) {
      const movement = direction.multiply(moveAmount);
      this.eye = this.eye.add(movement);
      this.at = this.at.add(movement);
    }
  }

  // Move left with collision detection
  left(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    const forward = this.at.subtract(this.eye).normalize();
    
    const side = this.up.cross(forward).normalize();
    
    const newPosition = this.eye.add(side.multiply(moveAmount));
    
    if (!this.advancedCollisionCheck(newPosition)) {
      const movement = side.multiply(moveAmount);
      this.eye = this.eye.add(movement);
      this.at = this.at.add(movement);
    }
  }

  // Move right with collision detection
  right(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    // calc direction from eye to at
    const forward = this.at.subtract(this.eye).normalize();
    
    // calc side vector
    const side = forward.cross(this.up).normalize();
    
    // Calc new position
    const newPosition = this.eye.add(side.multiply(moveAmount));
    
    if (!this.advancedCollisionCheck(newPosition)) {
      const movement = side.multiply(moveAmount);
      this.eye = this.eye.add(movement);
      this.at = this.at.add(movement);
    }
  }

  // Move up with collision detection
up(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    const upVector = new Vector(0, 1, 0);
    
    // Calc new position
    const newPosition = this.eye.add(upVector.multiply(moveAmount));

    if (!this.checkCollision(newPosition)) {
        // Apply movement
        const movement = upVector.multiply(moveAmount);
        this.eye = this.eye.add(movement);
        this.at = this.at.add(movement);
    }
}

  // Move down with collision detection
down(distance = 1) {
    const moveAmount = distance * this.moveSpeed;
    
    const downVector = new Vector(0, -1, 0);
    
    // calc new position
    const newPosition = this.eye.add(downVector.multiply(moveAmount));
    
    // ground collision check - prevent going below ground level
    if (newPosition.y < -0.5) {
        return;
    }
    
    if (!this.checkCollision(newPosition)) {
        // Apply movement
        const movement = downVector.multiply(moveAmount);
        this.eye = this.eye.add(movement);
        this.at = this.at.add(movement);
    }
}

  // Pan camera left/right
  pan(angle) {
    // Convert angle to radians
    const radians = angle * (Math.PI / 180);
    
    // Get the vector from eye to at
    const viewVector = this.at.subtract(this.eye);
    
    // calculate the direction vector
    const direction = viewVector.normalize();
    
    const right = direction.cross(this.up).normalize();
    
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);
    
    const rotatedX = direction.x * cosAngle + right.x * sinAngle;
    const rotatedY = direction.y * cosAngle + right.y * sinAngle;
    const rotatedZ = direction.z * cosAngle + right.z * sinAngle;
    
    const rotatedDirection = new Vector(rotatedX, rotatedY, rotatedZ);
    
    const scaledDirection = rotatedDirection.multiply(viewVector.length());
    
    this.at = this.eye.add(scaledDirection);
  }

  // tilt camera up/down
  tilt(angle) {
    // Convert angle to radians
    const radians = angle * (Math.PI / 180);
    
    // Get the vector from eye to at
    const viewVector = this.at.subtract(this.eye);
    
    const direction = viewVector.normalize();
    
    const right = direction.cross(this.up).normalize();
    
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);
    
    const upComponent = this.up.normalize();
    
    const rotatedX = direction.x * cosAngle + upComponent.x * sinAngle;
    const rotatedY = direction.y * cosAngle + upComponent.y * sinAngle;
    const rotatedZ = direction.z * cosAngle + upComponent.z * sinAngle;
    
    const rotatedDirection = new Vector(rotatedX, rotatedY, rotatedZ);
    
    const scaledDirection = rotatedDirection.multiply(viewVector.length());
    
    this.at = this.eye.add(scaledDirection);
    

    this.up = right.cross(rotatedDirection).normalize();
  }
}