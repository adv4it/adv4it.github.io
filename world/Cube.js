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

    //drawTriangle3DUV([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0], [1,0, 0,1, 1,1]);

    // Front face
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
    //drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
    //drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);
    //gl.uniform1f(u_Size, size);
    //drawTriangle([xy[0],xy[1],xy[0]+.1,xy[1],xy[0],xy[1]+.1]);
    //drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
    //drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
  /*
  var d = this.size/200.0;
  let angleStep=360/this.segments;
  for(var angle=0;angle<360;angle=angle+angleStep){
    let centerPt = [xy[0], xy[1]];
    let angle1=angle;
    let angle2=angle+angleStep;
    let vec1=[Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
    let vec2=[Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
    let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
    let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
  */
    //drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
    //drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);
    /*
    // UV Back face


    // Back face
    drawTriangle3D([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0]);
    drawTriangle3D([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);

    // Top face
    drawTriangle3D([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0]);
    drawTriangle3D([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);

    // Bottom face
    drawTriangle3D([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0]);
    drawTriangle3D([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0]);

    // Right face
    drawTriangle3D([1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0]);
    drawTriangle3D([1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0]);

    // Left face
    drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0]);
    drawTriangle3D([0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0]);
    */
    // Front face - already has UVs
    //drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 0,1, 1,0]);
    //drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
    
    //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    // Back face
    drawTriangle3DUV([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0], [1,0, 0,1, 0,0]);
    drawTriangle3DUV([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [1,0, 1,1, 0,1]);
    
    // Top face
    drawTriangle3DUV([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1]);
    
    // Bottom face
    drawTriangle3DUV([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0], [0,1, 1,0, 1,1]);
    drawTriangle3DUV([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0], [0,1, 0,0, 1,0]);
    
    // Right face
    drawTriangle3DUV([1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,0, 1,1, 0,1]);
    drawTriangle3DUV([1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0], [0,0, 1,0, 1,1]);
    
    // Left face
    drawTriangle3DUV([0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0], [1,0, 0,1, 0,0]);
    drawTriangle3DUV([0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0], [1,0, 1,1, 0,1]);
  }

  renderfast() {
  var rgba = this.color;

  // Set texture mode to use the texture (0 means “use the sampler”)
  gl.uniform1i(u_whichTexture, this.textureNum);
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
    var rgba = this.color;

    // Pass data to shaders
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Ensure buffer exists
    if (!g_vertexBuffer) {
      initTriangle3D();
    }

    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    
    // Write data to buffer
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
    
    // Set up attributes - for position-only data
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.disableVertexAttribArray(a_UV); // Disable UV if not using it
    
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    
    // Re-enable UV for other rendering methods
    gl.enableVertexAttribArray(a_UV);
  }
  }
