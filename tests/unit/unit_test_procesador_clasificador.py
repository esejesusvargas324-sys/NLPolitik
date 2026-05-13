import unittest
import sys
import os
import numpy as np
from collections import defaultdict

# Agregar el directorio raíz al path para importar módulos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.services.procesador_clasificador import ProcesadorClasificacion


class TestProcesadorClasificacion(unittest.TestCase):
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.clasificador = ProcesadorClasificacion()
        
        # Datos de prueba simulados
        self.etiquetas = np.array([0, 0, 0, 1, 1, 2])  # 3 clusters
        self.frases = ["frase1", "frase2", "frase3", "frase4", "frase5", "frase6"]
        
        # Mapeo palabra-vector simulado
        self.mapeo_palabra_vector = {
            "frase1": np.array([0.1, 0.2, 0.3]),
            "frase2": np.array([0.2, 0.3, 0.4]),
            "frase3": np.array([0.3, 0.4, 0.5]),
            "frase4": np.array([0.4, 0.5, 0.6]),
            "frase5": np.array([0.5, 0.6, 0.7]),
            "frase6": np.array([0.6, 0.7, 0.8]),
        }
        
        # Vocabulario simulado
        self.vocabulario = {
            "frase1": ["doc1"],
            "frase2": ["doc1", "doc2"],
            "frase3": ["doc2"],
            "frase4": ["doc3"],
            "frase5": ["doc3", "doc4"],
            "frase6": ["doc4"],
        }
    
    # --- PRUEBA 1: UT-CLAS-001 ---
    def test_01_inicializacion_correcta(self):
        """Validar inicialización del clasificador"""
        print("\n" + "="*60)
        print("PRUEBA 1: UT-CLAS-001")
        print("Título: Validar inicialización del clasificador")
        print("Precondiciones: Ninguna")
        print("Cobertura: Constructor __init__()")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Crear instancia de ProcesadorClasificacion")
        
        resultado_esperado = "Clasificador inicializado, SVM no cargado aún"
        resultado_real = f"SVM cargado: {self.clasificador._svm_cargado}, " \
                        f"Modelo: {'SÍ' if self.clasificador._svm_clasificador else 'NO'}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (self.clasificador._svm_clasificador is None and 
                  not self.clasificador._svm_cargado)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertIsNone(self.clasificador._svm_clasificador)
        self.assertFalse(self.clasificador._svm_cargado)
    
    # --- PRUEBA 2: UT-CLAS-002 ---
    def test_02_carga_modelo_svm_sin_excepcion(self):
        """Validar que carga de modelo no lanza excepción"""
        print("\n" + "="*60)
        print("PRUEBA 2: UT-CLAS-002")
        print("Título: Validar carga de modelo sin excepción")
        print("Precondiciones: Ninguna")
        print("Cobertura: Método cargar_modelo_svm() - manejo de errores")
        print("Dependencias simuladas: ProcesadorSVMClasificador real")
        print("Pasos: 1. Llamar cargar_modelo_svm() y verificar que no crashea")
        
        try:
            modelo = self.clasificador.cargar_modelo_svm()
            resultado_real = f"Método ejecutado, retornó tipo: {type(modelo).__name__}"
            exito = True
        except Exception as e:
            resultado_real = f"Excepción capturada: {type(e).__name__}: {str(e)}"
            exito = False
        
        resultado_esperado = "Método ejecutado sin excepción crítica (puede fallar silenciosamente)"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if exito else 'FALLIDO'}")
        
        self.assertTrue(exito, "El método lanzó una excepción inesperada")
    
    # --- PRUEBA 3: UT-CLAS-003 ---
    def test_03_obtener_palabras_representativas(self):
        """Validar obtención de palabras representativas"""
        print("\n" + "="*60)
        print("PRUEBA 3: UT-CLAS-003")
        print("Título: Validar palabras representativas")
        print("Precondiciones: Mapeo palabra-vector disponible")
        print("Cobertura: Método obtener_palabras_representativas()")
        print("Dependencias simuladas: numpy")
        print("Pasos: 1. Calcular palabras más cercanas al centroide")
        
        frases_cluster = ["frase1", "frase2", "frase3"]
        palabras_rep = self.clasificador.obtener_palabras_representativas(
            frases_cluster, self.mapeo_palabra_vector, top_n=2
        )
        
        resultado_esperado = "Lista de 2 frases más cercanas al centroide"
        resultado_real = f"{len(palabras_rep)} frases: {palabras_rep}"
        
        print(f"Frases en cluster: {frases_cluster}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (len(palabras_rep) == 2 and 
                  all(frase in frases_cluster for frase in palabras_rep))
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(len(palabras_rep), 2)
        self.assertTrue(all(frase in frases_cluster for frase in palabras_rep))
    
    # --- PRUEBA 4: UT-CLAS-004 ---
    def test_04_obtener_palabras_representativas_sin_vectores(self):
        """Validar palabras representativas sin mapeo"""
        print("\n" + "="*60)
        print("PRUEBA 4: UT-CLAS-004")
        print("Título: Validar palabras representativas sin vectores")
        print("Precondiciones: Frases sin vectores en mapeo")
        print("Cobertura: Método obtener_palabras_representativas() - caso vacío")
        print("Dependencias simuladas: numpy")
        print("Pasos: 1. Pasar frases no existentes en mapeo")
        
        frases_no_existentes = ["fraseX", "fraseY", "fraseZ"]
        palabras_rep = self.clasificador.obtener_palabras_representativas(
            frases_no_existentes, self.mapeo_palabra_vector, top_n=5
        )
        
        resultado_esperado = "Lista vacía (ninguna frase tiene vector)"
        resultado_real = f"Lista con {len(palabras_rep)} elementos: {palabras_rep}"
        
        print(f"Frases sin vectores: {frases_no_existentes}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = len(palabras_rep) == 0
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(len(palabras_rep), 0)
    
    # --- PRUEBA 5: UT-CLAS-005 ---
    def test_05_determinar_ideologia_mayoria_no_politico(self):
        """Validar clasificación como no político (umbral 90%)"""
        print("\n" + "="*60)
        print("PRUEBA 5: UT-CLAS-005")
        print("Título: Validar clasificación no político (90%+)")
        print("Precondiciones: Predicciones mayoritariamente no político")
        print("Cobertura: Método determinar_ideologia_final() - umbral 90%")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar 9 no_politico y 1 político")
        
        frases = [f"frase{i}" for i in range(10)]
        predicciones = {f"frase{i}": "no_politico" for i in range(9)}
        predicciones["frase9"] = "izquierda"  # Solo 1 político
        
        analisis_economico = {"es_economico": False}
        
        ideologia = self.clasificador.determinar_ideologia_final(
            frases, predicciones, analisis_economico
        )
        
        resultado_esperado = "no_politico (90% no político)"
        resultado_real = f"{ideologia}"
        
        print(f"Frases: 10 total (9 no_politico, 1 izquierda)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = ideologia == "no_politico"
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ideologia, "no_politico")
    
    # --- PRUEBA 6: UT-CLAS-006 ---
    def test_06_determinar_ideologia_mayoria_clara(self):
        """Validar clasificación con mayoría clara (60%+)"""
        print("\n" + "="*60)
        print("PRUEBA 6: UT-CLAS-006")
        print("Título: Validar clasificación con mayoría clara")
        print("Precondiciones: 7 izquierda, 3 derecha")
        print("Cobertura: Método determinar_ideologia_final() - umbral 60%")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar 7 izquierda, 3 derecha")
        
        frases = [f"frase{i}" for i in range(10)]
        predicciones = {f"frase{i}": "izquierda" for i in range(7)}
        for i in range(7, 10):
            predicciones[f"frase{i}"] = "derecha"
        
        analisis_economico = {"es_economico": True}
        
        ideologia = self.clasificador.determinar_ideologia_final(
            frases, predicciones, analisis_economico
        )
        
        resultado_esperado = "izquierda (70% > 60%)"
        resultado_real = f"{ideologia}"
        
        print(f"Frases: 10 total (7 izquierda, 3 derecha)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = ideologia == "izquierda"
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ideologia, "izquierda")
    
    # --- PRUEBA 7: UT-CLAS-007 ---
    def test_07_determinar_ideologia_empate(self):
        """Validar clasificación con empate"""
        print("\n" + "="*60)
        print("PRUEBA 7: UT-CLAS-007")
        print("Título: Validar clasificación con empate")
        print("Precondiciones: 5 izquierda, 5 derecha")
        print("Cobertura: Método determinar_ideologia_final() - empate")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar empate 5-5")
        
        frases = [f"frase{i}" for i in range(10)]
        predicciones = {f"frase{i}": "izquierda" for i in range(5)}
        for i in range(5, 10):
            predicciones[f"frase{i}"] = "derecha"
        
        analisis_economico = {"es_economico": True}
        
        ideologia = self.clasificador.determinar_ideologia_final(
            frases, predicciones, analisis_economico
        )
        
        resultado_esperado = "neutral (empate 5-5)"
        resultado_real = f"{ideologia}"
        
        print(f"Frases: 10 total (5 izquierda, 5 derecha)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = ideologia == "neutral"
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ideologia, "neutral")
    
    # --- PRUEBA 8: UT-CLAS-008 ---
    def test_08_determinar_ideologia_mayoria_debil_economico(self):
        """Validar clasificación con mayoría débil pero tema económico"""
        print("\n" + "="*60)
        print("PRUEBA 8: UT-CLAS-008")
        print("Título: Validar clasificación mayoría débil + económico")
        print("Precondiciones: 6 izquierda, 4 derecha, tema económico")
        print("Cobertura: Método determinar_ideologia_final() - mayoría débil")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar 6-4 con tema económico")
        
        frases = [f"frase{i}" for i in range(10)]
        predicciones = {f"frase{i}": "izquierda" for i in range(6)}
        for i in range(6, 10):
            predicciones[f"frase{i}"] = "derecha"
        
        analisis_economico = {"es_economico": True}
        
        ideologia = self.clasificador.determinar_ideologia_final(
            frases, predicciones, analisis_economico
        )
        
        resultado_esperado = "izquierda (60%, tema económico)"
        resultado_real = f"{ideologia}"
        
        print(f"Frases: 10 total (6 izquierda, 4 derecha)")
        print(f"Tema económico: SÍ")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = ideologia == "izquierda"
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ideologia, "izquierda")
    
    # --- PRUEBA 9: UT-CLAS-009 ---
    def test_09_determinar_ideologia_poco_politico_sin_economico(self):
        """Validar clasificación con poco contenido político y sin tema económico"""
        print("\n" + "="*60)
        print("PRUEBA 9: UT-CLAS-009")
        print("Título: Validar poco político sin económico")
        print("Precondiciones: 2 políticas, 8 no políticas, sin tema económico")
        print("Cobertura: Método determinar_ideologia_final() - mínimo 2 políticas")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar 2 políticas, 8 no políticas, sin económico")
        
        frases = [f"frase{i}" for i in range(10)]
        predicciones = {f"frase{i}": "no_politico" for i in range(8)}
        predicciones["frase8"] = "izquierda"
        predicciones["frase9"] = "derecha"
        
        analisis_economico = {"es_economico": False}
        
        ideologia = self.clasificador.determinar_ideologia_final(
            frases, predicciones, analisis_economico
        )
        
        resultado_esperado = "no_politico (solo 20% político, sin tema económico)"
        resultado_real = f"{ideologia}"
        
        print(f"Frases: 10 total (2 políticas, 8 no políticas)")
        print(f"Tema económico: NO")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = ideologia == "no_politico"
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ideologia, "no_politico")
    
    # --- PRUEBA 10: UT-CLAS-010 ---
    def test_10_consistencia_clasificacion_20_ejecuciones(self):
        """Validar consistencia en clasificación (20 ejecuciones)"""
        print("\n" + "="*60)
        print("PRUEBA 10: UT-CLAS-010")
        print("Título: Validar consistencia en clasificación")
        print("Precondiciones: Mismos datos de entrada")
        print("Cobertura: Método determinar_ideologia_final() - 20 ejecuciones")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Ejecutar 20 veces con mismos datos")
        
        frases = [f"frase{i}" for i in range(20)]
        predicciones = {f"frase{i}": "izquierda" for i in range(12)}
        for i in range(12, 20):
            predicciones[f"frase{i}"] = "derecha"
        
        analisis_economico = {"es_economico": True}
        
        resultados = []
        print("Ejecutando clasificación 20 veces...")
        
        for i in range(20):
            ideologia = self.clasificador.determinar_ideologia_final(
                frases, predicciones, analisis_economico
            )
            resultados.append(ideologia)
            if i < 3:
                print(f"  Ejecución {i+1}: {ideologia}")
        
        todos_iguales = all(r == resultados[0] for r in resultados)
        
        resultado_esperado = "20 resultados idénticos (algoritmo determinístico)"
        resultado_real = f"Resultados: {len(set(resultados))} único(s) - {set(resultados)}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if todos_iguales else 'FALLIDO'}")
        
        self.assertEqual(len(set(resultados)), 1, "Clasificación no es consistente")

if __name__ == '__main__':
    print("INICIO DE PRUEBAS UNITARIAS - PROCESADOR CLASIFICACIÓN")
    print("="*60)
    unittest.main(verbosity=0)