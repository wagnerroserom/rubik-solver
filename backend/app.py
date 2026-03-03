from flask import Flask, request, jsonify
from flask_cors import CORS
from kociemba import solve

app = Flask(__name__)
CORS(app)

def validate_colors(cube_string):
    """Valida que el string tenga 54 caracteres y los colores correctos."""
    if len(cube_string) != 54:
        return False, "El cubo debe tener 54 stickers (6 caras x 9 stickers)."
    
    colors = "URFDLB"
    for color in colors:
        if cube_string.count(color) != 9:
            return False, f"Debe haber exactamente 9 stickers de color '{color}'. Actualmente hay {cube_string.count(color)}."
    
    return True, ""

@app.route('/api/solve', methods=['POST'])
def solve_cube():
    data = request.json
    cube_state = data.get('state')
    
    if not cube_state:
        return jsonify({"error": "No se proporcionó el estado del cubo"}), 400

    # Validar entrada
    is_valid, error_msg = validate_colors(cube_state)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    try:
        # El algoritmo de Kociemba devuelve los movimientos
        solution = solve(cube_state)
        
        # Formatear la solución en pasos legibles
        steps = solution.split()
        
        return jsonify({
            "status": "success",
            "solution": solution,
            "steps": steps,
            "move_count": len(steps)
        })
    except ValueError as e:
        return jsonify({
            "error": f"Cubo inválido: {str(e)}. Verifica que los colores sean físicamente posibles."
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Error inesperado: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)