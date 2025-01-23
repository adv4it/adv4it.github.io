// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const drawButton = document.getElementById('drawButton');
  drawButton.addEventListener('click', () => handleDrawEvent(canvas));
  const operButton = document.getElementById('operButton');
  document.getElementById('operButton').addEventListener('click', () => handleDrawOperationEvent(canvas));


}

function handleDrawEvent(canvas) {
  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const x1 = parseFloat(document.getElementById('xCoord1').value);
  const y1 = parseFloat(document.getElementById('yCoord1').value);

  const x2 = parseFloat(document.getElementById('xCoord2').value);
  const y2 = parseFloat(document.getElementById('yCoord2').value);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);

  //Draw a blue rectangle
  //ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  //ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");
}

function angleBetween(v1, v2) {
    const dotProduct = Vector3.dot(v1, v2);
    const magV1 = v1.magnitude();
    const magV2 = v2.magnitude();

    const cosTheta = dotProduct / (magV1 * magV2);
    const angleRadians = Math.acos(Math.min(Math.max(cosTheta, -1), 1)); // Clamp cosTheta between -1 and 1
    return (angleRadians * 180) / Math.PI; // Convert to degrees
}

function areaTriangle(v1, v2) {
    const crossProduct = Vector3.cross(v1, v2);
    const area = crossProduct.magnitude() / 2; // Triangle area = 1/2 * ||v1 x v2||
    return area;
}

function handleDrawOperationEvent(canvas) {
  //const ctx = canvas.getContext('2d');
  //ctx.fillStyle. = 'black';
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalarValue').value);
  
  const x1 = parseFloat(document.getElementById('xCoord1').value);
  const y1 = parseFloat(document.getElementById('yCoord1').value);

  const x2 = parseFloat(document.getElementById('xCoord2').value);
  const y2 = parseFloat(document.getElementById('yCoord2').value);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");
  const v3 = new Vector3(v1.elements);

  if (operation === "area") {
        // Calculate the area of the triangle
        const area = areaTriangle(v1, v2);
        console.log(`Area of the triangle formed by v1 and v2: ${area.toFixed(2)}`);
    }

  if (operation === "angle") {
        // Calculate the angle between v1 and v2
        const angle = angleBetween(v1, v2);
        if (angle !== null) {
            console.log(`Angle between v1 and v2: ${angle.toFixed(2)} degrees`);
        }
    }

  if(operation === "add"){
    v3.add(v2);
    drawVector(ctx, v3, "green");
  }
  else if (operation === "sub") {
    v3.sub(v2);
    drawVector(ctx, v3, "green");
  }

  const v4 = new Vector3(v2.elements);
  if(operation === "mul") {
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  }
  else if(operation === "div") {
    v3.div(scalar);
    v4.div(scalar);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  }
  if (operation === "magnitude") {
        // Calculate and log magnitudes of v1 and v2
        const magV1 = v1.magnitude();
        const magV2 = v2.magnitude();
        console.log(`Magnitude of v1: ${magV1}`);
        console.log(`Magnitude of v2: ${magV2}`);
    } else if (operation === "normalize") {
        // Normalize v1 and v2, draw them in green
        const normV1 = new Vector3(v1.elements).normalize();
        const normV2 = new Vector3(v2.elements).normalize();
        drawVector(ctx, normV1, "green");
        drawVector(ctx, normV2, "green");
        console.log(`Normalized v1: (${normV1.elements[0]}, ${normV1.elements[1]}, ${normV1.elements[2]})`);
        console.log(`Normalized v2: (${normV2.elements[0]}, ${normV2.elements[1]}, ${normV2.elements[2]})`);
  }
}

function drawVector(ctx, v, color) {
    const scale = 20;
    const originX = 200; // Center of the canvas (400x400)
    const originY = 200;

    //Get the scaled vector coordinates
    const x = v.elements[0] * scale;
    const y = v.elements[1] * scale;

    //Draw the vector
    ctx.beginPath();
    //Start at the origin
    ctx.moveTo(originX, originY);
    // Line to the vector's endpoint
    ctx.lineTo(originX + x, originY - y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}