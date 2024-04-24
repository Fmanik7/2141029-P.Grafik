const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("Tidak Support WebGL");
}

alert("Silahkan Klik OK");

const canvasWidth = 600;
const canvasHeight = 600;

canvas.width = canvasWidth;
canvas.height = canvasHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const segitiga = [
  0.0, 0.1, // titik 1
  0.5, 0.1, // titik 2
  0.3, -0.1, // titik 3
];

const kotak = [
  -0.5, -0.3, // titik 1
  -0.1, -0.3, // titik 2
  -0.5, -0.7, // titik 3
  -0.1, -0.7, // titik 4
];

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;  

  void main() {
      gl_FragColor = vec4(1.0, 0, 0, 1);
  }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const positionAttributeLocation = gl.getAttribLocation(
  shaderProgram,
  "a_position"
);
gl.enableVertexAttribArray(positionAttributeLocation);

function createAndBindBuffer(data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

const positionBuffer1 = createAndBindBuffer(segitiga);
const positionBuffer2 = createAndBindBuffer(kotak);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
