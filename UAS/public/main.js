var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");

// Cek browser
if (!gl) {
  console.log("Browser tidak mendukung WebGL");
} else {
  console.log("Browser mendukung WebGL.");
}

const canvasWidth = 800;
const canvasHeight = 800;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

gl.viewport(0, 0, canvas.width, canvas.height);

// Warna canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Hitam
gl.clear(gl.COLOR_BUFFER_BIT);

// Vertex shader source
var vertexShaderSource = `
        attribute vec2 a_position;
        uniform vec2 u_resolution;
        
        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
    `;

// Fragment shader source
var fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;
        void main() { 
            gl_FragColor = u_color;
        }
    `;

// Buat vertex shader
var vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, vertexShaderSource);
gl.compileShader(vShader);

// Buat fragment shader
var fShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fShader, fragmentShaderSource);
gl.compileShader(fShader);

// Program shader
var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vShader);
gl.attachShader(shaderProgram, fShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Variabel untuk resolusi dan warna
var resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");

// Fungsi untuk membuat buffer
function createBuffer(vertices) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return buffer;
}

// Fungsi untuk menggambar objek
function drawObject(buffer, color, vertexCount) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

// Data untuk balok
var brickWidth = 78; // Lebar balok
var brickHeight = 48; // Tinggi balok
var bricks = [];
var rows = 5;
var cols = Math.floor(canvasWidth / (brickWidth + 2)); // Menghitung jumlah kolom sesuai lebar kanvas
var brickBuffer;

for (var row = 0; row < rows; row++) {
  for (var col = 0; col < cols; col++) {
    var x = col * (brickWidth + 2) + 1;
    var y = row * (brickHeight + 2) + 1;
    var brick = {
      x: x,
      y: y,
      width: brickWidth,
      height: brickHeight,
      buffer: createBuffer([
        x,
        y,
        x + brickWidth,
        y,
        x,
        y + brickHeight,
        x,
        y + brickHeight,
        x + brickWidth,
        y,
        x + brickWidth,
        y + brickHeight,
      ]),
    };
    bricks.push(brick);
  }
}

// Data untuk pemukul
var paddleWidth = 100;
var paddleHeight = 20;
var paddleX = (canvasWidth - paddleWidth) / 2;
var paddleBuffer = createBuffer([
  paddleX,
  canvasHeight - paddleHeight,
  paddleX + paddleWidth,
  canvasHeight - paddleHeight,
  paddleX,
  canvasHeight,
  paddleX,
  canvasHeight,
  paddleX + paddleWidth,
  canvasHeight - paddleHeight,
  paddleX + paddleWidth,
  canvasHeight,
]);

// Data untuk bola
var ballRadius = 10;
var ballX = canvasWidth / 2;
var ballY = canvasHeight - paddleHeight - ballRadius;
var ballSpeedX = 2;
var ballSpeedY = -2;
var ballBuffer;

function createBallBuffer(x, y, radius) {
  var vertices = [];
  for (var i = 0; i <= 360; i += 10) {
    var angle = (i * Math.PI) / 180;
    vertices.push(x, y);
    vertices.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    vertices.push(
      x + Math.cos(angle + (10 * Math.PI) / 180) * radius,
      y + Math.sin(angle + (10 * Math.PI) / 180) * radius
    );
  }
  return createBuffer(vertices);
}
ballBuffer = createBallBuffer(ballX, ballY, ballRadius);

// Fungsi untuk update posisi bola dan deteksi tabrakan
function updateBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Deteksi tabrakan dengan dinding
  if (ballX < ballRadius || ballX > canvasWidth - ballRadius) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  }

  // Deteksi tabrakan dengan pemukul
  if (
    ballY > canvasHeight - paddleHeight - ballRadius &&
    ballX > paddleX &&
    ballX < paddleX + paddleWidth
  ) {
    ballSpeedY = -ballSpeedY;
  }

  // Deteksi tabrakan dengan balok
  for (var i = 0; i < bricks.length; i++) {
    var brick = bricks[i];
    if (
      ballX > brick.x &&
      ballX < brick.x + brick.width &&
      ballY > brick.y &&
      ballY < brick.y + brick.height
    ) {
      ballSpeedY = -ballSpeedY;
      bricks.splice(i, 1); // Hapus balok yang terkena
      break;
    }
  }

  // Reset permainan jika bola jatuh ke bawah
  if (ballY > canvasHeight) {
    ballX = canvasWidth / 2;
    ballY = canvasHeight - paddleHeight - ballRadius;
    ballSpeedX = 2;
    ballSpeedY = -2;
    bricks = []; // Reset balok
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var x = col * (brickWidth + 2) + 1;
        var y = row * (brickHeight + 2) + 1;
        var brick = {
          x: x,
          y: y,
          width: brickWidth,
          height: brickHeight,
          buffer: createBuffer([
            x,
            y,
            x + brickWidth,
            y,
            x,
            y + brickHeight,
            x,
            y + brickHeight,
            x + brickWidth,
            y,
            x + brickWidth,
            y + brickHeight,
          ]),
        };
        bricks.push(brick);
      }
    }
  }

  // Perbarui buffer bola
  ballBuffer = createBallBuffer(ballX, ballY, ballRadius);
}

// Fungsi untuk menggambar semua objek
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Gambar balok
  bricks.forEach(function (brick) {
    drawObject(brick.buffer, [1.0, 1.0, 0.0, 1.0], 6); // Kuning pekat
  });

  // Gambar pemukul
  paddleBuffer = createBuffer([
    paddleX,
    canvasHeight - paddleHeight,
    paddleX + paddleWidth,
    canvasHeight - paddleHeight,
    paddleX,
    canvasHeight,
    paddleX,
    canvasHeight,
    paddleX + paddleWidth,
    canvasHeight - paddleHeight,
    paddleX + paddleWidth,
    canvasHeight,
  ]);
  drawObject(paddleBuffer, [0.0, 0.0, 0.5, 1.0], 6); // Biru pekat

  // Gambar bola
  drawObject(ballBuffer, [0.0, 1.0, 0.0, 1.0], 108); // Hijau pekat
}

// Fungsi animasi
function animate() {
  updateBall();
  drawScene();
  requestAnimationFrame(animate);
}

// Kontrol pemukul
document.addEventListener("mousemove", function (event) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = event.clientX - rect.left - root.scrollLeft;
  paddleX = mouseX - paddleWidth / 2;
  if (paddleX < 0) {
    paddleX = 0;
  }
  if (paddleX + paddleWidth > canvasWidth) {
    paddleX = canvasWidth - paddleWidth;
  }
});

animate();
