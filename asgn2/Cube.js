class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
  }

  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
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
     drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
    drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

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
  }
  
}