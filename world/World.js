// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
   gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2) {
      // Use solid color from u_FragColor
      gl_FragColor = u_FragColor;
    } 
    else if(u_whichTexture == -1) {
      // Use UV debug (displays the UV coordinates as color)
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } 
    else if(u_whichTexture == 0) {
      // Use texture 0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if(u_whichTexture == 1) {
      // Use texture 1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if(u_whichTexture == 2) {
      // Use texture 2
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if(u_whichTexture == 3) {
      // Use texture 3
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else {
      // "Error" or fallback case: show a reddish color
      gl_FragColor = vec4(1.2, 0.2, 0.2, 1.0);
    }
  }`



//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

function setUpWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_FragColor
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments = 5;
let g_globalAngle=0;

let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_magentaAnimation=false;
let g_yellowAnimation=false;

var g_isDragging = false;
var g_lastMouseX = 0;
var g_lastMouseY = 0;
var g_mouseRotX = 0;  // camera rotation x axis(looking up/down)
var g_mouseRotY = 0;  // Camera rotation y axis (looking left/right)
var g_mouseSensitivity = 0.5;  // sensitivity setting adjust



function addActionsForHtmlUI(){
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  //document.getElementById('red').onclick   = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  //document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};
  document.getElementById('magentaAnimationOnButton').onclick = function() {g_magentaAnimation=true};
  document.getElementById('magentaAnimationOffButton').onclick = function() {g_magentaAnimation=false};

  document.getElementById('yellowAnimationOnButton').onclick = function() {g_yellowAnimation=true};
  document.getElementById('yellowAnimationOffButton').onclick = function() {g_yellowAnimation=false};

  //document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  //document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('magSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value;});
}

function initTextures() {
    // Create a texture object
    /*
    var texture = gl.createTexture();
    if (!texture) {
        console.log("Failed to create the texture object");
        return false;
    }

    // Get the storage location of u_Sampler
    var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    if (!u_Sampler0) {
        console.log("Failed to get the storage location of u_Sampler0");
        return false;
    }
    */
  var image1 = new Image();
  if (!image1) {
    console.log("Failed to create the image object for texture 1");
    return false;
  }
  
  image1.onload = function() {
    sendImageToTexture(image1, gl.TEXTURE0, u_Sampler0, 0);
  };
  
  image1.src = "makotogigachad_imresizer.jpg";
  
  var image2 = new Image();
  if (!image2) {
    console.log("Failed to create the image object for texture 2");
    return false;
  }
  
  image2.onload = function() {
    sendImageToTexture(image2, gl.TEXTURE1, u_Sampler1, 1);
  };
  
  image2.src = "moon.jpg";
  
  var image3 = new Image();
  if (!image3) {
    console.log("Failed to create the image object for texture 3");
    return false;
  }
  
  image3.onload = function() {
    sendImageToTexture(image3, gl.TEXTURE2, u_Sampler2, 2);
  };
  
  image3.src = "ground.jpg"; 

  var image4 = new Image();
  if (!image4) {
    console.log("Failed to create the image object for texture 3");
    return false;
  }
  
  image4.onload = function() {
    sendImageToTexture(image4, gl.TEXTURE3, u_Sampler3, 3);
  };
  
  image4.src = "end.jpg";
  
  return true;
}

function sendImageToTexture(image, textureUnit, samplerLocation, samplerValue) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object');
    return false;
  }
  

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  

  gl.activeTexture(textureUnit);
  

  gl.bindTexture(gl.TEXTURE_2D, texture);
  

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(samplerLocation, samplerValue);
  
  console.log("finished loading texture " + samplerValue);
}


function main() {
  
  setUpWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = click;
  //canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
  canvas.onmousedown = function(ev) { mouseDown(ev) };
  document.onmouseup = function(ev) { mouseUp(ev) };
  document.onmousemove = function(ev) { mouseMove(ev) };
  canvas.onwheel = function(ev) { mouseWheel(ev) };
  document.onkeydown = keydown;

  initTriangle3D();

  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if(g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
}


var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);
  //let point = new Triangle();
  /*
  let point;
  if(g_selectedType==POINT){
    point = new Point();
    }
  else if(g_selectedType==TRIANGLE){
    point = new Triangle();
  }
  else{
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);
  */
  // Store the coordinates to g_points array
  //g_points.push([x, y]);
  //g_colors.push(g_selectedColor.slice());
  //g_sizes.push(g_selectedSize);
  //g_shapesList.push(point);
  `
  // Store the coordinates to g_points array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  `
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of mouse pointer
  var y = ev.clientY; // y coordinate of  mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];

var g_camera = new Camera();

function keydown(ev){
  if (ev.keyCode==68) { // D
    g_camera.right(5);
  }
  else if(ev.keyCode == 65){ // A
    g_camera.left(5);
  }
  else if(ev.keyCode == 87){ // W
    g_camera.forward(5);
  }
  else if(ev.keyCode == 83){ // S
    g_camera.back(5);
  }
  else if(ev.keyCode == 32){ // space - go up
    g_camera.eye.y += 1;
    g_camera.at.y += 1;
  }
  else if(ev.keyCode == 16){ // shift - go down
    g_camera.down(5);
  }
  else if(ev.keyCode == 81){ // Q pan left
    g_camera.pan(-5); 
  }
  else if(ev.keyCode == 69){ // E pan right
    g_camera.pan(5); 
  }
}

function mouseDown(ev) {
  g_isDragging = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
  
  // prevent default browser actions like text selection
  ev.preventDefault();
  

  canvas.style.cursor = 'grabbing';
}

function mouseUp(ev) {
  g_isDragging = false;
  
  // Restore cursor
  canvas.style.cursor = 'grab';
}

function mouseMove(ev) {
  if (!g_isDragging) return;
  
  var mouseX = ev.clientX;
  var mouseY = ev.clientY;
  
  // calc the change in mouse position
  var deltaX = mouseX - g_lastMouseX;
  var deltaY = mouseY - g_lastMouseY;
  
  // update camera movement on mouse movement
  g_mouseRotY += deltaX * g_mouseSensitivity;
  g_mouseRotX += deltaY * g_mouseSensitivity;
  
  // limitint vertical rotation to prevent camera flipping
  if (g_mouseRotX > 89) g_mouseRotX = 89;
  if (g_mouseRotX < -89) g_mouseRotX = -89;
  
  // saving current mouse position for the next frame
  g_lastMouseX = mouseX;
  g_lastMouseY = mouseY;
  
  // update the camera
  updateCamera();
  
  renderAllShapes();
}

function mouseWheel(ev) {
  var delta = Math.sign(ev.deltaY);
  
  if (delta > 0) {
    g_camera.forward(-2); // Zoom out
  } else {
    g_camera.forward(2);  // Zoom in
  }
  
  ev.preventDefault();
    updateCamera();
  renderAllShapes();
}

function  updateCamera() {
  // convert angles to radians
  var rotXRad = g_mouseRotX * Math.PI / 180;
  var rotYRad = g_mouseRotY * Math.PI / 180;
  
  // calc distance vector
  var dirX = Math.sin(rotYRad) * Math.cos(rotXRad);
  var dirY = Math.sin(rotXRad);
  var dirZ = Math.cos(rotYRad) * Math.cos(rotXRad);
  
  // camera pov 
  g_camera.at.x = g_camera.eye.x + dirX;
  g_camera.at.y = g_camera.eye.y + dirY;
  g_camera.at.z = g_camera.eye.z + dirZ;
}

var g_map = [
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0]
];

function drawMap() {
  for (let x = 0; x < 21; x++) {
    for (let y = 0; y < 21; y++) {
      if (g_map[x][y] == 1) {
        var body = new Cube();
        body.color = [0.8, 1.0, 1.0, 1.0];
        body.textureNum = 0;  // Use solid color
        body.matrix.translate(2.38*x-25, -.75, 2.38*y-25);
        //body.matrix.setIdentity();
        body.matrix.scale(2.38, 2.38, 2.38);
        
        body.renderfast(); 
      }
    }
  }
}

function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();
  /*
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  var viewMat = new Matrix4();
  // Example: position camera at (0, 0, 5) looking at origin
  viewMat.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  // Create projection matrix
  var projMat = new Matrix4();
  // Example: 30 degree field of view, aspect ratio, near plane, far plane
  projMat.setPerspective(30, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
  */
  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Make your view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,   // Eye position
                    g_camera.at.x, g_camera.at.y, g_camera.at.z,   // Look-at point
                    g_camera.up.x, g_camera.up.y, g_camera.up.z);  // Up direction
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Make your global rotation matrix
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Render each shape in your shapes list (example)
  //  g_shapesList[i].render();
  //}
    /*
    var xy = g_shapesList[i].position;
    var rgba = g_shapesList[i].color;
    var size = g_shapesList[i].size;

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    */
    //drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);
    //draw the floor
    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.textureNum=2;
    body.matrix.translate(0,-.75,0.0);
    //body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(50,0,50);
    body.matrix.translate(-.5,4,-0.5);
    body.renderfast();

    //draw the sky
    var sky = new Cube();
    sky.color = [1.0,0.0,0.0,1.0];
    sky.textureNum=1;
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.renderfast();

    var yellow = new Cube();
    yellow.color = [1,1,0,1];
    yellow.matrix.setTranslate(5,5,0.0);
    yellow.matrix.rotate(-5,1,0,0);
    yellow.matrix.rotate(g_yellowAngle,0,0,1);
    
    if(g_yellowAnimation){
      yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      yellow.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    
    var yellowCoordinatesMat=new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25,.7,.5);
    yellow.matrix.translate(5,0,0);
    yellow.renderfast();



    var magenta = new Cube();
    magenta.color = [1,0,1,1];
    magenta.textureNum=0;
    //magenta.matrix = yellowCoordinatesMat;
    magenta.matrix.translate(0,0.65,0);
    magenta.matrix.rotate(g_magentaAngle,0,0,1);
    magenta.matrix.scale(.3,.3,.3);
    magenta.matrix.translate(-.5,0,-0.001);
    magenta.renderfast();

    //ground plane
    var ground = new Cube();
    ground.color = [1.0, 0.0, 0.0, 1.0]; 
    ground.textureNum = 1;              
    ground.matrix.translate(0, 0, -1);
    ground.matrix.scale(2, 0.1, 2);
    ground.renderfast();

    drawMap();

    var end = new Cube();
    end.color = [1.0, 0.0, 0.0, 1.0]; 
    end.textureNum = 3;              
    end.matrix.translate(22, -0.75, 22);
    //end.matrix.scale(2.38, 2.38, 2.38);
    end.matrix.scale(2.38, 2.38, 2.38);
    end.renderfast();
    
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
