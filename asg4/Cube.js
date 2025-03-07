class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum=-2;
    this.cubeVerts32 = new Float32Array([
      // Front face
      0,0,0,   0,1,0,   1,1,0,
      1,1,0,   1,0,0,   0,0,0,

      // Back face
      0,0,1,   0,1,1,   1,1,1,
      1,1,1,   1,0,1,   0,0,1,

      // Top face
      0,1,0,   0,1,1,   1,1,1,
      1,1,1,   1,1,0,   0,1,0,

      // Bottom face
      0,0,0,   0,0,1,   1,0,1,
      1,0,1,   1,0,0,   0,0,0,

      // Right face
      1,1,0,   1,1,1,   1,0,1,
      1,0,1,   1,0,0,   1,1,0,

      // Left face
      0,1,0,   0,1,1,   0,0,1,
      0,0,1,   0,0,0,   0,1,0
    ]);

    this.cubeVerts = [
      // Front face
      0,0,0,   0,1,0,   1,1,0,
      1,1,0,   1,0,0,   0,0,0,

      // Back face
      0,0,1,   0,1,1,   1,1,1,
      1,1,1,   1,0,1,   0,0,1,

      // Top face
      0,1,0,   0,1,1,   1,1,1,
      1,1,1,   1,1,0,   0,1,0,

      // Bottom face
      0,0,0,   0,0,1,   1,0,1,
      1,0,1,   1,0,0,   0,0,0,

      // Right face
      1,1,0,   1,1,1,   1,0,1,
      1,0,1,   1,0,0,   1,1,0,

      // Left face
      0,1,0,   0,1,1,   0,0,1,
      0,0,1,   0,0,0,   0,1,0
    ];
  }

  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    gl.uniform1i(u_whichTexture, this.textureNum);

    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //front of cube
    drawTriangle3DUVNormal(
    [0,0,0 , 1,1,0,  1,0,0 ],
    [0,0 ,1,1, 1,0 ],
    [0,0,-1, 0,0,-1, 0,0,-1]);

    drawTriangle3DUVNormal(
    [0, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 1],
    [0, 0, -1, 0, 0, -1, 0, 0, -1]);

    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    //top of cube
    drawTriangle3DUVNormal(
    [0, 1, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0]);

    drawTriangle3DUVNormal(
    [0, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0]);

    // Right face
    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    drawTriangle3DUVNormal([1,1,0, 1,1,1, 1,0,0], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

    //Left face
    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 0,0,0], [0,0, 1,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
    
    // Bottom face
    gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

    // Back face
    gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);

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
