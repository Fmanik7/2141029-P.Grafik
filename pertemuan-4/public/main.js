const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("Tidak Support WebGL");
}

// Set ukuran kanvas
const lebarKanvas = 400;
const tinggiKanvas = 400;
canvas.width = lebarKanvas;
canvas.height = tinggiKanvas;
gl.viewport(0, 0, canvas.width, canvas.height);

// Bersihkan kanvas dengan warna hijau kebiruan
gl.clearColor(0.0, 0.5, 0.5, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Tentukan koordinat garis
const garis = [
  -0.8, 0.8, // Titik 1 (atas)
  0.8, 0.8,  // Titik 2 (atas)
];

// Kode sumber vertex shader
const kodeVertexShader = `
  attribute vec2 posisi;
  void main() {
    gl_Position = vec4(posisi, 0.0, 1.0);
  }
`;

// Kode sumber fragment shader
const kodeFragmentShader = `
  precision mediump float;  
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0); // Warna biru tengah malam
  }
`;

// Buat dan kompilasi shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, kodeVertexShader);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, kodeFragmentShader);
gl.compileShader(fragmentShader);

// Buat program shader dan hubungkan shaders
const programShader = gl.createProgram();
gl.attachShader(programShader, vertexShader);
gl.attachShader(programShader, fragmentShader);
gl.linkProgram(programShader);
gl.useProgram(programShader);

// Buat buffer untuk koordinat garis
const bufferPosisi = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosisi);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(garis), gl.STATIC_DRAW);

// Dapatkan lokasi atribut dan aktifkan
const lokasiAtributPosisi = gl.getAttribLocation(programShader, "posisi");
gl.enableVertexAttribArray(lokasiAtributPosisi);

// Tunjuk atribut ke VBO yang saat ini terikat
gl.vertexAttribPointer(lokasiAtributPosisi, 2, gl.FLOAT, false, 0, 0);

// Variabel animasi
let posisiY = 0.8; // Posisi awal Y di bagian atas
let arah = -1; // Arah awal bergerak ke bawah
const kecepatan = 0.01;

// Fungsi animasi
function animasi() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Perbarui posisi untuk animasi
  posisiY += kecepatan * arah;

  // Ubah arah saat mencapai atas atau bawah
  if (posisiY > 0.8 || posisiY < -0.8) {
    arah *= -1;
  }

  // Tetapkan koordinat Y baru untuk garis
  const garisAnimasi = [
    -0.5, posisiY, // Titik 1 (kiri), koordinat Y diperbarui
    0.5, posisiY,  // Titik 2 (kanan), koordinat Y diperbarui
  ];

  // Perbarui data buffer dengan koordinat garis baru
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(garisAnimasi), gl.STATIC_DRAW);

  // Gambar garis dengan warna biru tengah malam
  gl.drawArrays(gl.LINES, 0, 2);

  // Mintalah bingkai animasi selanjutnya
  requestAnimationFrame(animasi);
}

// Mulai animasi
animasi();
