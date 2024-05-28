var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');

// Cek browser
if (!gl) { 
    console.log('Browser tidak mendukung WebGL'); 
} else { 
    console.log('Browser mendukung WebGL.'); 
}

const canvasWidth = 650;
const canvasHeight = 650;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

gl.viewport(0, 0, canvas.width, canvas.height);

// Warna canvas 
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Mengubah warna latar belakang menjadi hitam pekat
gl.clear(gl.COLOR_BUFFER_BIT);

// Vertex shader source 
var vertexShaderSource = `
    attribute vec2 a_position;
    uniform float u_rotationAngle; // Menambahkan uniform untuk sudut rotasi
    
    void main() {
        // Membuat matriks rotasi
        float c = cos(u_rotationAngle);
        float s = sin(u_rotationAngle);
        mat2 rotationMatrix = mat2(c, -s, s, c);
        
        // Mengalikan posisi dengan matriks rotasi
        vec2 rotatedPosition = rotationMatrix * a_position;
        
        gl_Position = vec4(rotatedPosition, 0.0, 1.0);
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

// Variabel untuk menyimpan sudut rotasi dan kecepatan
var rotationAngle = 0;
var rotationSpeed = 0.1; // Kecepatan rotasi
var time = 0; // Variabel waktu untuk gerakan sinusoidal

// Tetapkan warna tetap untuk baling-baling
var defaultColor = [0.0, 1.0, 0.0, 1.0]; // Warna hijau pekat (R, G, B, A)
var colorLocation = gl.getUniformLocation(shaderProgram, 'u_color');
gl.uniform4fv(colorLocation, defaultColor);

function drawBlades(rotationAngle, centerX, centerY) {
    // Jumlah bilah baling-baling
    var numBlades = 4;
    var angleIncrement = (2 * Math.PI) / numBlades;

    for (var i = 0; i < numBlades; i++) {
        var angle = rotationAngle + i * angleIncrement;

        // Titik pusat baling-baling 
        var center = [centerX, centerY]; // Mengatur pusat objek secara horizontal

        // Titik-titik untuk segitiga dengan ukuran lebih kecil
        var p1 = [Math.cos(angle) * 0.05 + center[0], Math.sin(angle) * 0.05 + center[1]];
        var p2 = [Math.cos(angle + angleIncrement) * 0.15 + center[0], Math.sin(angle + angleIncrement) * 0.15 + center[1]];
        var p3 = [center[0], center[1]];

        // Menggabungkan titik-titik untuk membentuk segitiga
        var vertices = [center[0], center[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]];

        // Buffer segitiga
        var vBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Location
        var positionLocation = gl.getAttribLocation(shaderProgram, 'a_position'); 
        gl.enableVertexAttribArray(positionLocation);

        // Gambar segitiga.
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0); 
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Menggunakan TRIANGLE_STRIP untuk menggambar segitiga
    }
}

function updatePosition() { 
    rotationAngle += rotationSpeed; // Gunakan kecepatan rotasi
    time += 0.03; // Increment waktu

    // Menghitung posisi untuk lintasan melengkung
    var horizontalPosition = Math.cos(time) * 0.8;
    var verticalPosition = Math.sin(time) * 0.2;

    return [horizontalPosition, verticalPosition];
}

function animateBlades() { 
    gl.clear(gl.COLOR_BUFFER_BIT);
    var [horizontalPosition, verticalPosition] = updatePosition();
    
    // Menggambar baling-baling tunggal
    drawBlades(rotationAngle, horizontalPosition, verticalPosition); 
    
    requestAnimationFrame(animateBlades);
}

// Fungsi untuk menangani penekanan tombol "space"
function handleSpaceKeyDown(event) {
    if (event.code === 'Space') {
        // Ubah arah rotasi
        rotationSpeed = -rotationSpeed;

        // Ubah warna baling-baling
        var newColor = generateRandomColor();
        gl.uniform4fv(colorLocation, newColor);
    }
}

// Tambahkan event listener untuk tombol "space"
document.addEventListener('keydown', handleSpaceKeyDown);

animateBlades();

// Fungsi untuk menghasilkan warna acak
function generateRandomColor() {
    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    return [r, g, b, 1.0];
}
