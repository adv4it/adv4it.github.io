function sin(x){
  return Math.sin(x);
}

function cos(x){
  return Math.cos(x);
}

class Sphere{
  constructor(){
    this.type='sphere';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum=-2;
    this.verts32 = new Float32Array([]);
      
  }

  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    gl.uniform1i(u_whichTexture, this.textureNum);

    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var d = Math.PI / 10;
    var dd = Math.PI / 10;
    for (var t = 0; t < (2*Math.PI); t += d) {
        for (var r = 0; r < 2 * Math.PI; r += d) {
          var p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];
          var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
          var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
          var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];


          var uv1 = [t / Math.PI, r / (2 * Math.PI)];
          var uv2 = [(t + dd) / Math.PI, r / (2 * Math.PI)];
          var uv3 = [t / Math.PI, (r + d) / (2 * Math.PI)];
          var uv4 = [(t + d) / Math.PI, (r + d) / (2 * Math.PI)];

          var v = [];
          var uv = [];
          v = v.concat(p1); uv = uv.concat([uv1]);
          v = v.concat(p2); uv = uv.concat([uv2]);
          //v = v.concat(p3); uv = uv.concat([0, 0]);
          v = v.concat(p4); uv = uv.concat([uv4]);

          gl.uniform4f(u_FragColor, 1, 1, 1, 1);
          drawTriangle3DUVNormal(v, uv, v);

          v = []; uv = [];
          v = v.concat(p1); uv = uv.concat([uv1]);
          v = v.concat(p4); uv = uv.concat([uv4]);
          v = v.concat(p3); uv = uv.concat([uv3]);

          gl.uniform4f(u_FragColor, 1, 0, 0, 1);
          drawTriangle3DUVNormal(v, uv, v);
      }
    }
  }

  renderfast() {
  var rgba = this.color;

  // Set texture mode to use the texture (0 means “use the sampler”)
  gl.uniform1i(u_whichTexture, 0);
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

  // Create an interleaved array: for each vertex, we store 3 position values and 2 UV values.
  // There are 36 vertices (6 faces * 2 triangles/face * 3 vertices/triangle = 36)
  var cubeInterleaved = new Float32Array([
    // Front face (z = 0)
    // Triangle 1:
    0,0,0,   0,0,   // Vertex 1: position (0,0,0), UV (0,0)
    1,1,0,   1,1,   // Vertex 2: position (1,1,0), UV (1,1)
    1,0,0,   1,0,   // Vertex 3: position (1,0,0), UV (1,0)
    // Triangle 2:
    0,0,0,   0,0,   // Vertex 1
    0,1,0,   0,1,   // Vertex 2: position (0,1,0), UV (0,1)
    1,1,0,   1,1,   // Vertex 3

    // Back face (z = 1)
    // Triangle 1:
    0,0,1,   0,0,
    1,1,1,   1,1,
    1,0,1,   1,0,
    // Triangle 2:
    0,0,1,   0,0,
    0,1,1,   0,1,
    1,1,1,   1,1,

    // Top face (y = 1)
    // Triangle 1:
    0,1,0,   0,0,
    0,1,1,   0,1,
    1,1,1,   1,1,
    // Triangle 2:
    0,1,0,   0,0,
    1,1,1,   1,1,
    1,1,0,   1,0,

    // Bottom face (y = 0)
    // Triangle 1:
    0,0,0,   0,0,
    0,0,1,   0,1,
    1,0,1,   1,1,
    // Triangle 2:
    0,0,0,   0,0,
    1,0,1,   1,1,
    1,0,0,   1,0,

    // Right face (x = 1)
    // Triangle 1:
    1,0,0,   0,0,
    1,1,1,   1,1,
    1,0,1,   1,0,
    // Triangle 2:
    1,0,0,   0,0,
    1,1,0,   0,1,
    1,1,1,   1,1,

    // Left face (x = 0)
    // Triangle 1:
    0,0,0,   1,0,
    0,1,1,   0,1,
    0,0,1,   0,0,
    // Triangle 2:
    0,0,0,   1,0,
    0,1,0,   1,1,
    0,1,1,   0,1
  ]);

  // Bind the global vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeInterleaved, gl.DYNAMIC_DRAW);

  var FSIZE = cubeInterleaved.BYTES_PER_ELEMENT;
  // Set up position attribute: 3 floats per vertex, stride = 5 * FSIZE, offset = 0
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  // Set up UV attribute: 2 floats per vertex, stride = 5 * FSIZE, offset = 3 * FSIZE
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_UV);

  // Draw all 36 vertices (12 triangles)
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
  renderfaster() {
    // var xy = this.position;  // (if needed)
    var rgba = this.color;

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum); 

    // Pass the color to the u_FragColor uniform
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the model matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // If the global vertex buffer hasn’t been created yet, initialize it
    //if (g_vertexBuffer == null) {
    //initTriangle3D();
    //}

    if (!g_vertexBuffer) {
      initTriangle3D();
    }

    // Assign the buffer object to a_Position (if not already done by initTriangle3D)
    // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Write the cube vertex data into the buffer object
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

    // Draw the cube (36 vertices total for 12 triangles)
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
}
