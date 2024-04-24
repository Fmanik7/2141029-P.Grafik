const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("Tidak Support WebGL");
}

const canvasWidth = 600;
const canvasHeight = 600;

canvas.width = canvasWidth;
canvas.height = canvasHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const initialPersegiPanjang = [
  -0.1, 0.35,
  -0.1, -0.35,
  0.1, 0.35,
  -0.1, -0.35,
  0.1, -0.35,
  0.1, 0.35
];

const persegiPanjang2 = [
  -1,  0.050,
  -1, -0.050,
  -0.25,  0.050,
  -1, -0.050,
  -0.25, -0.050,
  -0.25,  0.050
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

const positionBuffer1 = createAndBindBuffer(initialPersegiPanjang);
const positionBuffer2 = createAndBindBuffer(persegiPanjang2);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// Define a function to animate the square
function animate() {
  let currentYPosition = 0.9; // Initial Y position of the first square at the top

  function drawFrame() {
    currentYPosition -= 0.002; // Decrease Y position to move the square downwards

    // Check if the square has moved beyond the canvas height
    if (currentYPosition < -0.9) {
      currentYPosition = 0.9; // Reset Y position to the top
    }

    // Update the position of the first square
    const updatedPersegiPanjang = [
      -0.1, currentYPosition + 0.35,
      -0.1, currentYPosition - 0.35,
      0.1, currentYPosition + 0.35,
      -0.1, currentYPosition - 0.35,
      0.1, currentYPosition - 0.35,
      0.1, currentYPosition + 0.35
    ];

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the first square
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(updatedPersegiPanjang), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Draw the second square
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Request the next frame
    requestAnimationFrame(drawFrame);
  }

  // Start the animation
  drawFrame();
}

// Start the animation
animate();
