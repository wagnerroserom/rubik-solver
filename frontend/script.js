let selectedColor = 'U';
const faces = ['U', 'L', 'F', 'R', 'B', 'D'];
const cubeState = {};

// Inicializar el cubo
faces.forEach(face => {
    const faceEl = document.getElementById(`face-${face}`);
    cubeState[face] = Array(9).fill(face);
    
    for (let i = 0; i < 9; i++) {
        const sticker = document.createElement('div');
        sticker.classList.add('sticker', face);
        sticker.dataset.index = i;
        sticker.dataset.face = face;
        sticker.addEventListener('click', () => updateSticker(face, i));
        faceEl.appendChild(sticker);
    }
});

// Selector de colores
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
    });
});

function updateSticker(face, index) {
    cubeState[face][index] = selectedColor;
    const sticker = document.querySelector(`.sticker[data-face="${face}"][data-index="${index}"]`);
    sticker.className = `sticker ${selectedColor}`;
}

// Botón Reiniciar
document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm('¿Reiniciar todo el cubo?')) {
        location.reload();
    }
});

// Botón Resolver
document.getElementById('solveBtn').addEventListener('click', async () => {
    const resultBox = document.getElementById('result');
    const solutionText = document.getElementById('solution-text');
    const stepsContainer = document.getElementById('steps-container');
    
    resultBox.classList.remove('hidden');
    solutionText.textContent = "🔄 Calculando solución...";
    solutionText.style.color = "#2c3e50";
    stepsContainer.innerHTML = "";

    // Construir string en orden: U, R, F, D, L, B (estándar Kociemba)
    const order = ['U', 'R', 'F', 'D', 'L', 'B'];
    let stateString = order.map(f => cubeState[f].join("")).join("");

    try {
        const response = await fetch('http://localhost:5000/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: stateString })
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
            solutionText.textContent = `✅ Solución en ${data.move_count} movimientos:`;
            solutionText.style.color = "#27ae60";
            data.steps.forEach((step, idx) => {
                const badge = document.createElement('span');
                badge.className = 'step-badge';
                badge.textContent = `${idx+1}. ${step}`;
                badge.title = `Paso ${idx+1}`;
                stepsContainer.appendChild(badge);
            });
        } else {
            solutionText.textContent = "❌ Error: " + (data.error || "Respuesta inválida");
            solutionText.style.color = "#e74c3c";
            stepsContainer.innerHTML = "";
        }
    } catch (error) {
        console.error("Error:", error);
        solutionText.textContent = "❌ Error de conexión. ¿Está corriendo el backend con Docker?";
        solutionText.style.color = "#e74c3c";
        stepsContainer.innerHTML = "";
    }
});