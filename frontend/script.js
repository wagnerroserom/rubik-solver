// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
let selectedColor = 'U'; // Color seleccionado (por defecto: Blanco/Up)
let cubeState = {}; // Estado del cubo: {face: [9 colores]}
let scene, camera, renderer, controls;
let cubeGroup; // Grupo que contiene los 27 cubies
let stickers = []; // Array de todos los stickers (54 total)
const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
const faceNormals = {
    'U': { x: 0, y: 1, z: 0 },
    'D': { x: 0, y: -1, z: 0 },
    'L': { x: -1, y: 0, z: 0 },
    'R': { x: 1, y: 0, z: 0 },
    'F': { x: 0, y: 0, z: 1 },
    'B': { x: 0, y: 0, z: -1 }
};

// Colores en formato Three.js
const colors = {
    'U': 0xFFFFFF, // Blanco
    'D': 0xFFD500, // Amarillo
    'L': 0xFF5800, // Naranja
    'R': 0x009E60, // Verde
    'F': 0xC41E3A, // Rojo
    'B': 0x0051BA, // Azul
    'core': 0x1a1a1a // Negro (interior del cubo)
};

// ============================================
// INICIALIZACIÓN DE THREE.JS
// ============================================
function initThreeJS() {
    const container = document.getElementById('cubeViewer');
    
    // Escena
    scene = new THREE.Scene();
    
    // Cámara
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 7);
    camera.lookAt(0, 0, 0);
    
    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Controles de órbita (rotar con mouse)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    
    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, -10, -10);
    scene.add(directionalLight2);
    
    // Crear el cubo
    createRubiksCube();
    
    // Loop de animación
    animate();
    
    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

// ============================================
// CREAR CUBO RUBIK 3D
// ============================================
function createRubiksCube() {
    cubeGroup = new THREE.Group();
    stickers = [];
    
    // Inicializar estado del cubo (todo sin pintar = gris)
    faces.forEach(face => {
        cubeState[face] = Array(9).fill(null);
    });
    
    // Crear los 27 cubies (3x3x3)
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                // Material base (negro para el interior)
                const materials = Array(6).fill(new THREE.MeshPhongMaterial({ color: colors.core }));
                
                // Crear mesh
                const cubelet = new THREE.Mesh(geometry, materials);
                cubelet.position.set(x, y, z);
                
                // Guardar posición original
                cubelet.userData = { 
                    originalPosition: new THREE.Vector3(x, y, z),
                    isCubelet: true
                };
                
                // Crear stickers para las caras externas
                createStickers(cubelet, x, y, z);
                
                cubeGroup.add(cubelet);
            }
        }
    }
    
    scene.add(cubeGroup);
    updateStickersCount();
}

// ============================================
// CREAR STICKERS EN LAS CARAS
// ============================================
function createStickers(cubelet, x, y, z) {
    const stickerGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const positions = [
        { face: 'R', normal: { x: 1, y: 0, z: 0 }, pos: { x: 0.48, y: 0, z: 0 }, rot: { y: -Math.PI / 2 } },
        { face: 'L', normal: { x: -1, y: 0, z: 0 }, pos: { x: -0.48, y: 0, z: 0 }, rot: { y: Math.PI / 2 } },
        { face: 'U', normal: { x: 0, y: 1, z: 0 }, pos: { x: 0, y: 0.48, z: 0 }, rot: { x: -Math.PI / 2 } },
        { face: 'D', normal: { x: 0, y: -1, z: 0 }, pos: { x: 0, y: -0.48, z: 0 }, rot: { x: Math.PI / 2 } },
        { face: 'F', normal: { x: 0, y: 0, z: 1 }, pos: { x: 0, y: 0, z: 0.48 }, rot: {} },
        { face: 'B', normal: { x: 0, y: 0, z: -1 }, pos: { x: 0, y: 0, z: -0.48 }, rot: { y: Math.PI } }
    ];
    
    positions.forEach(({ face, normal, pos, rot }) => {
        // Solo crear sticker si esta cara es externa
        if (
            (face === 'R' && x === 1) ||
            (face === 'L' && x === -1) ||
            (face === 'U' && y === 1) ||
            (face === 'D' && y === -1) ||
            (face === 'F' && z === 1) ||
            (face === 'B' && z === -1)
        ) {
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x333333, // Gris inicial (sin pintar)
                side: THREE.DoubleSide
            });
            
            const sticker = new THREE.Mesh(stickerGeometry, material);
            sticker.position.set(pos.x, pos.y, pos.z);
            sticker.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);
            sticker.userData = {
                face: face,
                isSticker: true,
                cubelet: cubelet,
                stickerIndex: getStickerIndex(x, y, z, face)
            };
            
            // Hacer el sticker interactivo
            sticker.material.emissive = new THREE.Color(0x000000);
            sticker.material.emissiveIntensity = 0;
            
            cubelet.add(sticker);
            stickers.push(sticker);
        }
    });
}

// ============================================
// CALCULAR ÍNDICE DEL STICKER (0-8 por cara)
// ============================================
function getStickerIndex(x, y, z, face) {
    // Mapear posición 3D a índice 0-8 en la cara
    // Orden: izquierda→derecha, arriba→abajo
    switch(face) {
        case 'U': return (1 - x) * 3 + (1 - z);
        case 'D': return (1 - x) * 3 + (1 + z);
        case 'L': return (1 + z) * 3 + (1 - y);
        case 'R': return (1 - z) * 3 + (1 - y);
        case 'F': return (1 - x) * 3 + (1 - y);
        case 'B': return (1 + x) * 3 + (1 - y);
        default: return 0;
    }
}

// ============================================
// MANEJAR CLICK EN STICKERS
// ============================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', onMouseClick);

function onMouseClick(event) {
    // Calcular posición del mouse
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Intersectar con stickers
    const intersects = raycaster.intersectObjects(stickers);
    
    if (intersects.length > 0) {
        const sticker = intersects[0].object;
        if (sticker.userData.isSticker) {
            paintSticker(sticker);
        }
    }
}

// ============================================
// PINTAR STICKER
// ============================================
function paintSticker(sticker) {
    const face = sticker.userData.face;
    const index = sticker.userData.stickerIndex;
    
    // Actualizar estado
    cubeState[face][index] = selectedColor;
    
    // Actualizar color visual
    sticker.material.color.setHex(colors[selectedColor]);
    sticker.material.emissive = new THREE.Color(colors[selectedColor]);
    sticker.material.emissiveIntensity = 0.3;
    
    // Actualizar contador
    updateStickersCount();
    
    // Efecto visual de click
    sticker.scale.set(1.1, 1.1, 1.1);
    setTimeout(() => {
        sticker.scale.set(1, 1, 1);
    }, 150);
}

// ============================================
// ACTUALIZAR CONTADOR DE STICKERS
// ============================================
function updateStickersCount() {
    let painted = 0;
    faces.forEach(face => {
        painted += cubeState[face].filter(c => c !== null).length;
    });
    
    document.getElementById('stickersCount').textContent = 
        `Stickers pintados: ${painted}/54`;
    
    const statusEl = document.getElementById('cubeStatus');
    if (painted === 54) {
        statusEl.textContent = 'Estado: ✅ Completo';
        statusEl.style.color = '#00b894';
    } else {
        statusEl.textContent = 'Estado: ⚠️ Incompleto';
        statusEl.style.color = '#e74c3c';
    }
}

// ============================================
// SELECTOR DE COLORES
// ============================================
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
    });
});

// ============================================
// BOTÓN RESOLVER
// ============================================
document.getElementById('solveBtn').addEventListener('click', async () => {
    // Verificar que todos los stickers estén pintados
    let painted = 0;
    faces.forEach(face => {
        painted += cubeState[face].filter(c => c !== null).length;
    });
    
    if (painted < 54) {
        alert(`⚠️ Faltan ${54 - painted} stickers por pintar. ¡Completa el cubo primero!`);
        return;
    }
    
    // Mostrar loading
    document.getElementById('loadingOverlay').classList.remove('hidden');
    
    // Construir string del estado (orden: U, R, F, D, L, B)
    const order = ['U', 'R', 'F', 'D', 'L', 'B'];
    const stateString = order.map(f => cubeState[f].join('')).join('');
    
    try {
        const response = await fetch('http://localhost:5000/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: stateString })
        });
        
        const data = await response.json();
        
        document.getElementById('loadingOverlay').classList.add('hidden');
        
        if (response.ok && data.status === 'success') {
            showSolution(data);
        } else {
            alert('❌ Error: ' + (data.error || 'Respuesta inválida del servidor'));
        }
    } catch (error) {
        document.getElementById('loadingOverlay').classList.add('hidden');
        alert('❌ Error de conexión. Verifica que el backend esté corriendo con Docker.');
        console.error(error);
    }
});

// ============================================
// MOSTRAR SOLUCIÓN
// ============================================
function showSolution(data) {
    const panel = document.getElementById('solutionPanel');
    const info = document.getElementById('solutionInfo');
    const container = document.getElementById('stepsContainer');
    
    info.textContent = `Solución en ${data.move_count} movimientos:`;
    container.innerHTML = '';
    
    data.steps.forEach((step, idx) => {
        const badge = document.createElement('span');
        badge.className = 'step-badge';
        badge.textContent = `${idx + 1}. ${step}`;
        badge.title = `Paso ${idx + 1}`;
        container.appendChild(badge);
    });
    
    panel.classList.remove('hidden');
}

document.getElementById('closeSolution').addEventListener('click', () => {
    document.getElementById('solutionPanel').classList.add('hidden');
});

// ============================================
// BOTÓN REINICIAR
// ============================================
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('¿Reiniciar todo el cubo? Se perderá el progreso.')) {
        // Resetear estado
        faces.forEach(face => {
            cubeState[face] = Array(9).fill(null);
        });
        
        // Resetear visual
        stickers.forEach(sticker => {
            sticker.material.color.setHex(0x333333);
            sticker.material.emissive = new THREE.Color(0x000000);
        });
        
        // Ocultar solución
        document.getElementById('solutionPanel').classList.add('hidden');
        
        updateStickersCount();
        
        // Resetear cámara
        camera.position.set(5, 5, 7);
        camera.lookAt(0, 0, 0);
        controls.reset();
    }
});

// ============================================
// BOTÓN MEZCLAR (Scramble)
// ============================================
document.getElementById('scrambleBtn').addEventListener('click', () => {
    // Generar movimientos aleatorios
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scramble = [];
    
    for (let i = 0; i < 20; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
        scramble.push(move + mod);
    }
    
    alert('🔀 Mezcla generada: ' + scramble.join(' ') + '\n\nAplica estos movimientos a tu cubo físico y luego píntalo en la app.');
});

// ============================================
// ANIMACIÓN Y RENDER
// ============================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('cubeViewer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ============================================
// INICIALIZAR AL CARGAR
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
});