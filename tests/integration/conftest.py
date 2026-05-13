"""
Configuración común para pruebas de integración
"""

import pytest
import sys
import os

# Agregar directorio raíz al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

@pytest.fixture
def datos_prueba_tres_tipos():
    """Artículos de prueba: izquierda, derecha, no político"""
    return {
        'articulos': [
            "El gobierno debe aumentar el gasto social.",
            "La reducción de impuestos estimula la inversión.",
            "El equipo ganó el campeonato."
        ],
        'titulos': ["izquierda", "derecha", "no_politico"],
        'tipos_esperados': ['izquierda', 'derecha', 'no_politico']
    }