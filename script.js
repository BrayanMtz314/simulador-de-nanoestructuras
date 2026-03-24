let scene, camera, renderer, controls;
let currentAtoms = [];
let currentLines = [];

const AVOGADRO = 6.022e23;

const elements = {
  Fe: {
    name: "Hierro",
    symbol: "Fe",
    structure: "BCC",
    atomicMass: 55.845,      // g/mol
    density: 7.87,           // g/cm³
    lattice: 2.866,          // Å
    color: 0xffa500
  },
  Cu: {
    name: "Cobre",
    symbol: "Cu",
    structure: "FCC",
    atomicMass: 63.546,
    density: 8.96,
    lattice: 3.615,
    color: 0xb87333
  },
  Al: {
    name: "Aluminio",
    symbol: "Al",
    structure: "FCC",
    atomicMass: 26.9815,
    density: 2.70,
    lattice: 4.049,
    color: 0xc0c0c0
  },
  Ni: {
    name: "Níquel",
    symbol: "Ni",
    structure: "FCC",
    atomicMass: 58.6934,
    density: 8.90,
    lattice: 3.524,
    color: 0x8f8f8f
  },
  Ag: {
    name: "Plata",
    symbol: "Ag",
    structure: "FCC",
    atomicMass: 107.8682,
    density: 10.49,
    lattice: 4.086,
    color: 0xd9d9d9
  },
  Au: {
    name: "Oro",
    symbol: "Au",
    structure: "FCC",
    atomicMass: 196.9666,
    density: 19.32,
    lattice: 4.078,
    color: 0xffd700
  },
  W: {
    name: "Tungsteno",
    symbol: "W",
    structure: "BCC",
    atomicMass: 183.84,
    density: 19.25,
    lattice: 3.165,
    color: 0x708090
  },
  Pb: {
    name: "Plomo",
    symbol: "Pb",
    structure: "FCC",
    atomicMass: 207.2,
    density: 11.34,
    lattice: 4.950,
    color: 0x5f6a72
  }
};

function init() {
  const container = document.getElementById("viewer");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111827);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(6, 6, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(8, 10, 6);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.35);
  directionalLight2.position.set(-8, -5, -6);
  scene.add(directionalLight2);

  //const axesHelper = new THREE.AxesHelper(2.8);
  //scene.add(axesHelper);

  const selector = document.getElementById("elementSelect");
  selector.addEventListener("change", (e) => {
    updateMaterial(e.target.value);
  });

  window.addEventListener("resize", onWindowResize);

  updateMaterial(selector.value);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("viewer");
  if (!container || !renderer || !camera) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function clearStructure() {
  currentAtoms.forEach(atom => scene.remove(atom));
  currentLines.forEach(line => scene.remove(line));
  currentAtoms = [];
  currentLines = [];
}

function updateMaterial(symbol) {
  const materialData = elements[symbol];
  if (!materialData) return;

  clearStructure();
  buildCrystal(materialData.structure, materialData.color);
  updateInfo(materialData);
}

function buildCrystal(structure, baseColor) {
  const a = 3.2; // tamaño visual de la celda en escena

  // Esquinas
  const corners = [
    [0, 0, 0],
    [a, 0, 0],
    [0, a, 0],
    [a, a, 0],
    [0, 0, a],
    [a, 0, a],
    [0, a, a],
    [a, a, a]
  ];

  // Dibujar aristas de la celda
  addCubeEdges(a);

  // Átomos en esquinas
  corners.forEach(([x, y, z]) => {
    addAtom(x, y, z, 0.23, 0x3b82f6); // azul
  });

  if (structure === "BCC") {
    addAtom(a / 2, a / 2, a / 2, 0.26, 0xef4444); // rojo
  }

  if (structure === "FCC") {
    const faceCenters = [
      [a / 2, a / 2, 0],
      [a / 2, a / 2, a],
      [a / 2, 0, a / 2],
      [a / 2, a, a / 2],
      [0, a / 2, a / 2],
      [a, a / 2, a / 2]
    ];

    faceCenters.forEach(([x, y, z]) => {
      addAtom(x, y, z, 0.25, 0x22c55e); // verde
    });
  }

  centerStructure(a);
}

function addAtom(x, y, z, radius, color) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 100
  });

  const atom = new THREE.Mesh(geometry, material);
  atom.position.set(x, y, z);
  scene.add(atom);
  currentAtoms.push(atom);
}

function addCubeEdges(a) {
  const vertices = [
    [0, 0, 0], [a, 0, 0],
    [a, 0, 0], [a, a, 0],
    [a, a, 0], [0, a, 0],
    [0, a, 0], [0, 0, 0],

    [0, 0, a], [a, 0, a],
    [a, 0, a], [a, a, a],
    [a, a, a], [0, a, a],
    [0, a, a], [0, 0, a],

    [0, 0, 0], [0, 0, a],
    [a, 0, 0], [a, 0, a],
    [0, a, 0], [0, a, a],
    [a, a, 0], [a, a, a]
  ];

  const points = [];
  vertices.forEach(([x, y, z]) => {
    points.push(new THREE.Vector3(x, y, z));
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lineSegments = new THREE.LineSegments(geometry, material);

  scene.add(lineSegments);
  currentLines.push(lineSegments);
}

function centerStructure(a) {
  const offset = a / 2;

  [...currentAtoms, ...currentLines].forEach(obj => {
    obj.position.x -= offset;
    obj.position.y -= offset;
    obj.position.z -= offset;
  });
}

function updateInfo(data) {
  const massAtom = data.atomicMass / AVOGADRO; // g
  const radius = calculateAtomicRadius(data.structure, data.lattice); // Å

  document.getElementById("propElement").textContent = data.name;
  document.getElementById("propSymbol").textContent = data.symbol;
  document.getElementById("propStructure").textContent = data.structure;
  document.getElementById("propMass").textContent = massAtom.toExponential(4) + " g";
  document.getElementById("propDensity").textContent = data.density.toFixed(2) + " g/cm³";
  document.getElementById("propLattice").textContent = data.lattice.toFixed(3) + " Å";
  document.getElementById("propRadius").textContent = radius.toFixed(3) + " Å";
}

function calculateAtomicRadius(structure, lattice) {
  if (structure === "BCC") {
    return (Math.sqrt(3) * lattice) / 4;
  }
  if (structure === "FCC") {
    return (Math.sqrt(2) * lattice) / 4;
  }
  return lattice / 2;
}

document.addEventListener("DOMContentLoaded", init);