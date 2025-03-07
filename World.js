// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_NormalMatrix;
void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    v_VertPos = u_ModelMatrix * a_Position;
}
`

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
varying vec4 v_VertPos;
uniform bool u_lightOn;  

void main() {
    if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);  // Use normal data
    } else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;  // Use color
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug color
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
    } else {
        gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);  // Error, put reddish
    }
  vec3 lightVector = vec3(v_VertPos)-u_lightPos;
  float r=length(lightVector);
  // if(r<1.0){
  //   gl_FragColor = vec4(1,0,0,1);
  // }
  // else if(r<2.0){
  //   gl_FragColor = vec4(0,1,0,1);
  // }

  //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
  //N dot L
  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N,L), 0.0);

  //Reflection
  vec3 R = reflect(-L,N);

  //eye 
  vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
  
  //gl_FragColor = gl_FragColor * nDotL;
  //gl_FragColor.a = 1.0;

  float specular = pow(max(dot(E,R), 0.0), 64.0)*0.8;

  vec3 diffuse = vec3(1,1,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
  vec3 ambient = vec3(gl_FragColor) * 0.2;
  //gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
  if(u_lightOn){
    if (u_whichTexture == 0){
      gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
    }
  else {
    gl_FragColor = vec4(diffuse+ambient, 1.0);
  }
  }
}
`

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
let u_whichTexture;
let a_Normal;
let u_lightPos;
let u_cameraPos;
let u_NormalMatrix;
let u_lightOn;

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
  
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }
  
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
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
let g_yellowAnimation=true;
let g_normalOn=false;
let g_lightOn=true;
let g_lightPos=[0,1,-2];



function addActionsForHtmlUI(){
  document.getElementById('lightOn').onclick = function() {g_lightOn=true;}
  document.getElementById('lightOff').onclick = function() {g_lightOn=false;}
  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick   = function() { g_normalOn= false; };
  //document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};
  document.getElementById('magentaAnimationOnButton').onclick = function() {g_magentaAnimation=true};
  document.getElementById('magentaAnimationOffButton').onclick = function() {g_magentaAnimation=false};

  document.getElementById('yellowAnimationOnButton').onclick = function() {g_yellowAnimation=true};
  document.getElementById('yellowAnimationOffButton').onclick = function() {g_yellowAnimation=false};

  //document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  //document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('magSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1)  {g_magentaAngle = this.value; renderAllShapes();}});
  document.getElementById('yellowSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1)  {g_yellowAngle = this.value; renderAllShapes();}});
  
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1)  {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1)  {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1)  {g_lightPos[2] = this.value/100; renderAllShapes();}});

  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
  
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
    var image0 = new Image(); // Create an image object
    if (!image0) {
        console.log("Failed to create the image object");
        return false;
    }

    // Register the event handler to be called on loading the image
    image0.onload = function() {
        sendImageToTEXTURE0(image0);
    };

    // Specify the image source
    image0.src = "moon.jpg";

    return true;
}

function sendImageToTEXTURE0(image) {

    var texture = gl.createTexture();
    if (!texture) {
      console.log('Failed to create texture object');
      return false;
    }

    // Flip the image's y-axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0)

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Set the image to the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    // Clear the canvas
    //gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the rectangle (or whatever shape you have)
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    console.log("finished loadTexture");
}

function main() {
  
  setUpWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = click;
  //canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
  document.onkeydown = keydown;

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
  g_lightPos[0] = Math.cos(g_seconds); // Fixed from 'cos' to 'Math.cos'
  g_lightPos[2] = Math.sin(g_seconds); // Fixed from 'sin' to 'Math.sin'
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
  /*
  // Store the coordinates to g_points array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
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
    g_camera.up(6);
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

var g_map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,0,1],
  [1,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,1],
  [1,1,1,1,1,1,1,1]
];
/*
function drawMap() {
  var body = new Cube();
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      // console.log(x, y);
      if (x === 0 || x === 31 || y === 0 || y === 31) {
        body.color = [0.8, 1.0, 1.0, 1.0];
        body.matrix.translate(x - 0.16, -0.75, y - 0.16);
        body.matrix.scale(0.5, 0.5, 0.5);
        body.matrix.translate(x - 16, 0, y - 16);
        body.renderfaster();
      }
    }
  }
}
*/
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
  projMat.setPerspective(90, 1*canvas.width / canvas.height, 1, 100);
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
  
  // Set the normal matrix
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(viewMat.multiply(globalRotMat));
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);

  gl.uniform1i(u_lightOn, g_lightOn);
    //draw light
  var light=new Cube();
  light.color=[2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  var sp = new Sphere();
  if(g_normalOn) sp.textureNum=-3;
  sp.matrix.translate(-1,-1.5,-1.5);
  sp.render();
  
    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.textureNum=0;
    body.matrix.translate(0,-2.49,0.0);
    //body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(10,0,10);
    body.matrix.translate(-.5,0,-0.5);
    body.render();

    //draw the sky
    var sky = new Cube();
    sky.color = [0.8,0.8,0.8,1.0];
    if (g_normalOn) sky.textureNum=-3;
    sky.matrix.scale(5,5,5);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.render();

    var yellow = new Cube();
    yellow.color = [1,0.5,0.5,1];
    if (g_normalOn) yellow.textureNum=-3;
    yellow.matrix.translate(.25,-1.75,-1.0);
    yellow.matrix.rotate(-5,1,0,0);
    yellow.matrix.rotate(g_yellowAngle,0,0,1);
    
    if(g_yellowAnimation){
      yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      yellow.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    
    var yellowCoordinatesMat=new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25,.7,.5);
    yellow.matrix.translate(-.5,0,0);
    yellow.render();



    var magenta = new Cube();
    magenta.color = [1,0,1,1];
    magenta.textureNum=0;
    magenta.matrix = yellowCoordinatesMat;
    magenta.matrix.translate(0,0.65,0);
    magenta.matrix.rotate(g_magentaAngle,0,0,1);
    magenta.matrix.scale(.3,.3,.3);
    magenta.matrix.translate(-.5,0,-0.001);
    magenta.render();

    //ground plane
    // var ground = new Cube();
    // ground.color = [1.0, 0.0, 0.0, 1.0]; 
    // ground.textureNum = 1;              
    // ground.matrix.translate(0, 0, -1);
    // ground.matrix.scale(2, 0.1, 2);
    // ground.render();

    //drawMap();
    
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