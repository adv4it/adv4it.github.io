// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
   gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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
let g_byellowAngle = 0;
let g_magentaAngle = 0;
let g_tailAngle = 0;
let g_magentaAnimation=false;
let g_yellowAnimation=false;
let g_tailAnimation=false;



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
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; g_byellowAngle = this.value; renderAllShapes();});

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
  canvas.addEventListener('mousedown', function(ev) {
  // Log to verify that the event is firing
  console.log("mousedown event, shiftKey:", ev.shiftKey);
  
  if (ev.shiftKey) {
    g_tailAnimation = true;
    console.log("Shift-click detected on canvas!");
    // Optionally, return here to prevent further processing if you don't want to create a shape.
    return;
  }
  // If not a shift-click, then handle the click normally:
  click(ev);
});
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value;});
}

function main() {
  
  setUpWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

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
    g_byellowAngle = (45*Math.sin(g_seconds-1));
  }
  if(g_magentaAnimation){
    g_magentaAngle = (45*Math.cos(0.5*g_seconds));
  }
  if(g_tailAnimation){
    g_tailAngle = (45*Math.cos(0.5*g_seconds));
  }
}

/*
class Point{
  constructor(){
    this.type='point';
    this.position=[0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = 5.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
*/
/*
class Point{
  constructor(){
    this.type='point';
    this.position=[0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = 5.0;
  }
}
*/
var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);
  //let point = new Triangle();
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
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {

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
    //var nose = drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);
    //nose.matrix.translate(-0.75,0,0.15);

    var jaw = new Cube();
    jaw.color = [0.8235, 0.7059, 0.5490, 1.0];
    jaw.matrix.translate(-0.75,0,0.15);
    jaw.matrix.rotate(10,0,0,9);
    jaw.matrix.scale(0.1,.1,.2);
    jaw.render();

    var skull = new Cube();
    skull.color = [0.8235, 0.7059, 0.5490, 1.0];
    skull.matrix.translate(-0.65,0,0.15);
    skull.matrix.rotate(10,0,0,9);
    skull.matrix.scale(0.3,.2,.2);
    skull.render();

    var mane = new Cube();
    mane.color = [0.6471, 0.1647, 0.1647, 1.0];
    mane.matrix.translate(-0.5,-0.07,-0.0001);
    //mane.matrix.rotate(-5,1,0,0);
    mane.matrix.scale(0.25,.45,.5);
    mane.render();

    var front_body = new Cube();
    front_body.color = [0.8235, 0.7059, 0.5490, 1.0];
    front_body.matrix.translate(-0.4,0,0);
    //front_body.matrix.rotate(-5,1,0,0);
    front_body.matrix.scale(0.5,.3,.5);
    front_body.render();

    var back_body = new Cube();
    back_body.color = [0.8235, 0.7059, 0.5490, 1.0];
    back_body.matrix.translate(0.1,0,0.0);
    //back_body.matrix.rotate(-5,1,0,0);
    back_body.matrix.scale(0.5,.2,.5);
    back_body.render();
    
    var leftArm = new Cube();
    leftArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    leftArm.matrix.setTranslate(-0.1,.15,0.0);
    leftArm.matrix.rotate(200,0,0,1);
    leftArm.matrix.rotate(g_yellowAngle,0,0,1);
    
    /*
    if(g_yellowAnimation){
      leftArm.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      leftArm.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    */
    
    var yellowCoordinatesMat=new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    leftArm.render();

    var leftForeArm = new Cube();
    leftForeArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    leftForeArm.matrix = yellowCoordinatesMat;
    leftForeArm.matrix.translate(-0.0,0.33,0.05);
    leftForeArm.matrix.rotate(-20,0,0,1);
    leftForeArm.matrix.rotate(g_magentaAngle,0,0,1);
    
    var l1CoordinatesMat=new Matrix4(leftForeArm.matrix);
    leftForeArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    leftForeArm.render();

    var leftFrontPaw = new Cube();
    leftFrontPaw.color = [0.8235, 0.7059, 0.5490, 1.0];
    leftFrontPaw.matrix = l1CoordinatesMat;
    leftFrontPaw.matrix.translate(-0.0,0.35,0.0);
    //leftFrontPaw.matrix.rotate(-20,0,0,1);
    //leftFrontPaw.matrix.rotate(g_yellowAngle,0,0,1);
    
    //var yellowCoordinatesMat=new Matrix4(leftFrontPaw.matrix);
    leftFrontPaw.matrix.scale(0.15,.1,.1);
    //leftArm.matrix.translate(-.8,0,0);
    leftFrontPaw.render();

    var rightArm = new Cube();
    rightArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    rightArm.matrix.setTranslate(0.5,.15,0.0);
    rightArm.matrix.rotate(200,0,0,1);
    rightArm.matrix.rotate(g_byellowAngle,0,0,1);
    
    /*
    if(g_yellowAnimation){
      leftArm.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      leftArm.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    */
    
    var r1CoordinatesMat=new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    rightArm.render();

    var rightForeArm = new Cube();
    rightForeArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    rightForeArm.matrix = r1CoordinatesMat;
    rightForeArm.matrix.translate(-0,0.33,0.0);
    rightForeArm.matrix.rotate(-20,0,0,1);
    rightForeArm.matrix.rotate(g_magentaAngle,0,0,1);
    
    var r1CoordinatesMat=new Matrix4(rightForeArm.matrix);
    rightForeArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    rightForeArm.render();

    var rightFrontPaw = new Cube();
    rightFrontPaw.color = [0.8235, 0.7059, 0.5490, 1.0];
    rightFrontPaw.matrix = r1CoordinatesMat;
    rightFrontPaw.matrix.translate(-0,0.35,0.0);
    //leftFrontPaw.matrix.rotate(-20,0,0,1);
    //leftFrontPaw.matrix.rotate(g_yellowAngle,0,0,1);
    
    //var yellowCoordinatesMat=new Matrix4(leftFrontPaw.matrix);
    rightFrontPaw.matrix.scale(0.15,.1,.1);
    //leftArm.matrix.translate(-.8,0,0);
    rightFrontPaw.render();

    var northArm = new Cube();
    northArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    northArm.matrix.setTranslate(-0.1,.15,0.35);
    northArm.matrix.rotate(200,0,0,1);
    northArm.matrix.rotate(g_yellowAngle,0,0,1);
    
    /*
    if(g_yellowAnimation){
      leftArm.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      leftArm.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    */
    
    var n1CoordinatesMat=new Matrix4(northArm.matrix);
    northArm.matrix.scale(0.1,.35,.1);
    northArm.matrix.translate(-.8,0,.4);
    northArm.render();

    var northForeArm = new Cube();
    northForeArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    northForeArm.matrix = n1CoordinatesMat;
    northForeArm.matrix.translate(-0.05,0.35,0.0);
    northForeArm.matrix.rotate(-20,0,0,1);
    northForeArm.matrix.rotate(g_magentaAngle,0,0,1);
    
    var s1CoordinatesMat=new Matrix4(northForeArm.matrix);
    northForeArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    northForeArm.render();

    var northFrontPaw = new Cube();
    northFrontPaw.color = [0.8235, 0.7059, 0.5490, 1.0];
    northFrontPaw.matrix = s1CoordinatesMat;
    northFrontPaw.matrix.translate(-0.0,0.35,0.0);
    //leftFrontPaw.matrix.rotate(-20,0,0,1);
    //leftFrontPaw.matrix.rotate(g_yellowAngle,0,0,1);
    
    //var yellowCoordinatesMat=new Matrix4(leftFrontPaw.matrix);
    northFrontPaw.matrix.scale(0.15,.1,.1);
    //leftArm.matrix.translate(-.8,0,0);
    northFrontPaw.render();


    /*
    var rightArm = new Cube();
    rightArm.color = [1,1,0,1];
    rightArm.matrix.setTranslate(-0.2,-.5,.4);
    rightArm.matrix.rotate(0,1,0,0);
    rightArm.matrix.rotate(g_yellowAngle,0,0,1);
    
    var yellowCoordinatesMat=new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.1,.7,.1);
    //leftArm.matrix.translate(-.8,0,0);
    rightArm.render();

    var leftLeg = new Cube();
    leftLeg.color = [1,1,0,1];
    leftLeg.matrix.setTranslate(0.5,-.5,0);
    leftLeg.matrix.rotate(0,1,0,0);
    leftLeg.matrix.rotate(g_yellowAngle,0,0,1);
    
    var yellowCoordinatesMat=new Matrix4(leftLeg.matrix);
    leftLeg.matrix.scale(0.1,.7,.1);
    //leftArm.matrix.translate(-.8,0,0);
    leftLeg.render();

    var rightLeg = new Cube();
    rightLeg.color = [1,1,0,1];
    rightLeg.matrix.setTranslate(0.5,-.5,.4);
    rightLeg.matrix.rotate(0,1,0,0);
    rightLeg.matrix.rotate(g_yellowAngle,0,0,1);
    
    var yellowCoordinatesMat=new Matrix4(rightLeg.matrix);
    rightLeg.matrix.scale(0.1,.7,.1);
    //leftArm.matrix.translate(-.8,0,0);
    rightLeg.render();

    */

    var southArm = new Cube();
    southArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    southArm.matrix.setTranslate(0.5,.15,0.3);
    southArm.matrix.rotate(200,0,0,1);
    southArm.matrix.rotate(g_byellowAngle,0,0,1);
    
    /*
    if(g_yellowAnimation){
      leftArm.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else{
      leftArm.matrix.rotate(-g_yellowAngle,0,0,1)
    }
    */
    
    var x1CoordinatesMat=new Matrix4(southArm.matrix);
    southArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    southArm.render();

    var southForeArm = new Cube();
    southForeArm.color = [0.8235, 0.7059, 0.5490, 1.0];
    southForeArm.matrix = x1CoordinatesMat;
    southForeArm.matrix.translate(-0,0.33,0.0);
    southForeArm.matrix.rotate(-20,0,0,1);
    southForeArm.matrix.rotate(g_magentaAngle,0,0,1);
    
    var y1CoordinatesMat=new Matrix4(southForeArm.matrix);
    southForeArm.matrix.scale(0.1,.35,.1);
    //leftArm.matrix.translate(-.8,0,0);
    southForeArm.render();

    var southFrontPaw = new Cube();
    southFrontPaw.color = [0.8235, 0.7059, 0.5490, 1.0];
    southFrontPaw.matrix = y1CoordinatesMat;
    southFrontPaw.matrix.translate(-0,0.35,0.0);
    //leftFrontPaw.matrix.rotate(-20,0,0,1);
    //leftFrontPaw.matrix.rotate(g_yellowAngle,0,0,1);
    
    //var yellowCoordinatesMat=new Matrix4(leftFrontPaw.matrix);
    southFrontPaw.matrix.scale(0.15,.1,.1);
    //leftArm.matrix.translate(-.8,0,0);
    southFrontPaw.render();

    var tail = new Cube();
    tail.color = [0.8235, 0.7059, 0.5490, 1.0];
    tail.matrix.setTranslate(0.6,.11,0.2);
    tail.matrix.rotate(220,0,0,1);
    tail.matrix.rotate(0,g_tailAngle,0,1);
    var tailCoordinatesMat=new Matrix4(tail.matrix);
    tail.matrix.scale(0.05,.5,.05);
    //leftArm.matrix.translate(-.8,0,0);
    tail.render();



    /*
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,0.65,0);
    box.matrix.rotate(g_magentaAngle,0,0,1);
    box.matrix.scale(.3,.3,.3);
    box.matrix.translate(-.5,0,-0.001);
    box.render();
    */
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
