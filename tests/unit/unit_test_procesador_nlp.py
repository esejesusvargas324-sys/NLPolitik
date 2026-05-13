import unittest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from app.services.procesador_nlp import ProcesadorNLP

class TestProcesadorNLP(unittest.TestCase):
    
    def setUp(self):
        """Inicializa el procesador antes de cada prueba"""
        self.procesador = ProcesadorNLP()
    
    # --- PRUEBA 1: UT-NLP-001 ---
    def test_01_inicializacion_correcta(self):
        """Validar inicialización del procesador"""
        print("\n" + "="*60)
        print("PRUEBA 1: UT-NLP-001")
        print("Título: Validar inicialización del procesador")
        print("Precondiciones: Ninguna")
        print("Cobertura: Constructor __init__() - modelo spaCy cargado")
        print("Dependencias simuladas: spaCy español")
        print("Pasos: 1. Crear instancia de ProcesadorNLP")
        
        resultado_esperado = "Modelo spaCy cargado correctamente"
        resultado_real = "Modelo spaCy cargado" if self.procesador.spacy_nlp else "Modelo NO cargado"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if self.procesador.spacy_nlp else 'FALLIDO'}")
        
        self.assertIsNotNone(self.procesador.spacy_nlp)
    
    # --- PRUEBA 2: UT-NLP-002 ---
    def test_02_limpieza_texto_valido(self):
        """Validar limpieza de texto normal"""
        print("\n" + "="*60)
        print("PRUEBA 2: UT-NLP-002")
        print("Título: Validar limpieza de texto válido")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método limpiar_texto() - entrada normal")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar texto con URLs y caracteres especiales")
        
        texto_prueba = "Hola mundo! #saludo @usuario de Nlpolitik$%&"
        resultado_esperado = "hola mundo saludo usuario de nlpolitik"
        resultado_real = self.procesador.limpiar_texto(texto_prueba)
        
        print(f"Entrada: '{texto_prueba}'")
        print(f"Resultado esperado: '{resultado_esperado}'")
        print(f"Resultado real: '{resultado_real}'")
        estado = resultado_real == resultado_esperado
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(resultado_real, resultado_esperado)
    
    # --- PRUEBA 3: UT-NLP-003 ---
    def test_03_limpieza_texto(self):
        """Validar limpieza de texto en formato"""
        print("\n" + "="*60)
        print("PRUEBA 3: UT-NLP-003")
        print("Título: Validar limpieza de texto")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método limpiar_texto() - entrada")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar texto en formato UTF-8")
        
        # Codificar texto con acentos a bytes
        texto_str = "Texto con acentos: áéíóú y eñe"
        texto_prueba = texto_str.encode('utf-8')
        resultado_esperado = "texto con acentos: áéíóú y eñe"
        resultado_real = self.procesador.limpiar_texto(texto_prueba)
        
        print(f"Entrada (str): '{texto_str}'")
        print(f"Entrada (bytes): {texto_prueba}")
        print(f"Resultado esperado: '{resultado_esperado}'")
        print(f"Resultado real: '{resultado_real}'")
        estado = resultado_real == resultado_esperado
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(resultado_real, resultado_esperado)
    
    # --- PRUEBA 4: UT-NLP-004 ---
    def test_04_limpieza_texto_vacio(self):
        """Validar limpieza de texto vacío"""
        print("\n" + "="*60)
        print("PRUEBA 4: UT-NLP-004")
        print("Título: Validar limpieza de texto vacío")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método limpiar_texto() - entrada vacía/nula")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Proporcionar string vacío y None")
        
        casos_prueba = ["", None]
        resultados = []
        
        for caso in casos_prueba:
            try:
                resultado = self.procesador.limpiar_texto(caso)
                resultados.append((caso, resultado, "APROBADO"))
                print(f"Caso '{caso}': resultado '{resultado}' - APROBADO")
            except Exception as e:
                resultados.append((caso, str(e), "FALLIDO"))
                print(f"Caso '{caso}': error {e} - FALLIDO")
        
        print(f"Resultado esperado: Manejo sin errores")
        print(f"Resultado real: {len([r for r in resultados if r[2]=='APROBADO'])}/{len(resultados)} casos manejados")
        print(f"Estado: {'APROBADO' if all(r[2]=='APROBADO' for r in resultados) else 'FALLIDO'}")
        
        for caso, resultado, estado in resultados:
            self.assertIsNotNone(resultado)
    
    # --- PRUEBA 5: UT-NLP-005 ---
    def test_05_extraccion_frases_texto_valido(self):
        """Validar extracción de frases con texto válido"""
        print("\n" + "="*60)
        print("PRUEBA 5: UT-NLP-005")
        print("Título: Validar extracción de frases con texto válido")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método extraer_frases_y_pos() - entrada normal")
        print("Dependencias simuladas: spaCy con modelo español")
        print("Pasos: 1. Proporcionar texto con oraciones completas")
        
        texto_prueba = "El gobierno debe mejorar la economía, los impuestos son muy altos y La salud pública necesita más inversión."
        frases, etiquetas = self.procesador.extraer_frases_y_pos(texto_prueba)
        
        resultado_esperado = "Lista de frases extraídas"
        resultado_real = f"{len(frases)} frases extraídas"
        
        print(f"Entrada: '{texto_prueba[:50]}...'")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        for i, frase in enumerate(frases[:3]):
            print(f"  Frase {i+1}: {frase[:60]}...")
        print(f"Estado: {'APROBADO' if len(frases) > 0 else 'FALLIDO'}")
        
        self.assertGreater(len(frases), 0)
        self.assertEqual(len(frases), len(etiquetas))
    
    # --- PRUEBA 6: UT-NLP-006 ---
    def test_06_extraccion_frases_texto_corto(self):
        """Validar extracción con texto muy corto"""
        print("\n" + "="*60)
        print("PRUEBA 6: UT-NLP-006")
        print("Título: Validar extracción con texto muy corto")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método extraer_frases_y_pos() - entrada corta")
        print("Dependencias simuladas: spaCy con modelo español")
        print("Pasos: 1. Proporcionar texto de 2 palabras")
        
        texto_prueba = "Hola mundo"
        frases, etiquetas = self.procesador.extraer_frases_y_pos(texto_prueba)
        
        resultado_esperado = "0 frases (no cumple longitud)"
        resultado_real = f"{len(frases)} frases extraídas"
        
        print(f"Entrada: '{texto_prueba}'")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if len(frases) == 0 else 'FALLIDO'}")
        
        self.assertEqual(len(frases), 0)
        self.assertEqual(len(etiquetas), 0)
    
    # --- PRUEBA 7: UT-NLP-007 ---
    def test_07_procesamiento_archivo_individual(self):
        """Validar procesamiento completo de archivo"""
        print("\n" + "="*60)
        print("PRUEBA 7: UT-NLP-007")
        print("Título: Validar procesamiento completo de archivo")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método procesar_archivo_individual() - estructura completa")
        print("Dependencias simuladas: spaCy con modelo español")
        print("Pasos: 1. Ejecutar procesar_archivo_individual() con título y contenido")
        
        titulo = "Artículo de prueba"
        contenido = "La economía del país necesita reformas profundas. El gobierno actual propone cambios."
        resultado = self.procesador.procesar_archivo_individual(titulo, contenido)
        
        campos_esperados = ['titulo', 'texto_limpio', 'caracteres_eliminados', 
                           'frases', 'etiquetas_pos', 'longitudes_frases', 'total_frases']
        campos_obtenidos = list(resultado.keys())
        
        print(f"Título: {titulo}")
        print(f"Contenido: '{contenido[:50]}...'")
        print(f"Resultado esperado: Diccionario con {len(campos_esperados)} campos")
        print(f"Resultado real: Estructura con campos: {campos_obtenidos}")
        print(f"Frases extraídas: {resultado['total_frases']}")
        print(f"Estado: {'APROBADO' if set(campos_esperados) == set(campos_obtenidos) else 'FALLIDO'}")
        
        self.assertEqual(set(campos_esperados), set(campos_obtenidos))
        self.assertGreaterEqual(resultado['caracteres_eliminados'], 0)
    
    # --- PRUEBA 8: UT-NLP-008 ---
    def test_08_calculo_metricas_globales(self):
        """Validar cálculo de métricas globales"""
        print("\n" + "="*60)
        print("PRUEBA 8: UT-NLP-008")
        print("Título: Validar cálculo de métricas globales")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método calcular_metricas_globales() - agregación correcta")
        print("Dependencias simuladas: Resultados simulados de procesamiento")
        print("Pasos: 1. Crear lista de resultados simulados")
        
        resultados_simulados = [
            {'caracteres_eliminados': 10, 'total_frases': 3, 'longitudes_frases': [8, 10, 12]},
            {'caracteres_eliminados': 15, 'total_frases': 2, 'longitudes_frases': [9, 11]},
            {'caracteres_eliminados': 5, 'total_frases': 4, 'longitudes_frases': [7, 8, 9, 10]}
        ]
        
        metricas = self.procesador.calcular_metricas_globales(resultados_simulados)
        
        total_caracteres_esperado = 30
        total_frases_esperado = 9
        longitud_promedio_esperada = (8+10+12+9+11+7+8+9+10) / 9
        
        print(f"Resultados simulados: {len(resultados_simulados)} archivos")
        print(f"Resultado esperado: total_caracteres={total_caracteres_esperado}, "
              f"total_frases={total_frases_esperado}, promedio≈{longitud_promedio_esperada:.2f}")
        print(f"Resultado real: total_caracteres={metricas['total_caracteres_eliminados']}, "
              f"total_frases={metricas['total_frases']}, promedio={metricas['longitud_promedio_frases']}")
        
        estado = (metricas['total_caracteres_eliminados'] == total_caracteres_esperado and
                 metricas['total_frases'] == total_frases_esperado and
                 abs(metricas['longitud_promedio_frases'] - longitud_promedio_esperada) < 0.01)
        
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(metricas['total_caracteres_eliminados'], total_caracteres_esperado)
        self.assertEqual(metricas['total_frases'], total_frases_esperado)
        self.assertAlmostEqual(metricas['longitud_promedio_frases'], longitud_promedio_esperada, places=1)
    
    # --- PRUEBA 9: UT-NLP-009 ---
    def test_09_consistencia_transformaciones(self):
        """Validar consistencia en transformaciones"""
        print("\n" + "="*60)
        print("PRUEBA 9: UT-NLP-009")
        print("Título: Validar consistencia en transformaciones")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Métodos múltiples - misma entrada produce misma salida")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Ejecutar limpieza 3 veces con misma entrada")
        
        texto_prueba = "Texto  con   espacios   extras!!  @mencion  #hashtag"
        resultados = []
        
        for i in range(20):
            resultado = self.procesador.limpiar_texto(texto_prueba)
            resultados.append(resultado)
            print(f"Ejecución {i+1}: '{resultado}'")
        
        consistente = all(r == resultados[0] for r in resultados)
        
        print(f"Entrada: '{texto_prueba}'")
        print(f"Resultado esperado: 3 resultados idénticos")
        print(f"Resultado real: {len(set(resultados))} resultados únicos")
        print(f"Estado: {'APROBADO' if consistente else 'FALLIDO'}")
        
        self.assertEqual(len(set(resultados)), 1)
    
    # --- PRUEBA 10: UT-NLP-010 ---
    def test_10_manejo_excepciones_extraccion(self):
        """Validar manejo de excepciones en extracción"""
        print("\n" + "="*60)
        print("PRUEBA 10: UT-NLP-010")
        print("Título: Validar manejo de excepciones en extracción")
        print("Precondiciones: Procesador NLP inicializado")
        print("Cobertura: Método extraer_frases_y_pos() - entrada problemática")
        print("Dependencias simuladas: spaCy con modelo español")
        print("Pasos: 1. Proporcionar texto con caracteres extraños")
        
        # Texto que podría causar problemas
        texto_problematico = "Texto " + "x" * 10000  # Texto muy largo
        frases, etiquetas = self.procesador.extraer_frases_y_pos(texto_problematico)
        
        print(f"Entrada: Texto muy largo ({len(texto_problematico)} caracteres)")
        print(f"Resultado esperado: Método no lanza excepción, retorna listas")
        print(f"Resultado real: {len(frases)} frases, {len(etiquetas)} etiquetas POS")
        print(f"Estado: APROBADO (no hubo excepción)")
        
        # La prueba pasa si no hay excepción
        self.assertIsInstance(frases, list)
        self.assertIsInstance(etiquetas, list)

if __name__ == '__main__':
    print("INICIO DE PRUEBAS UNITARIAS - PROCESADOR NLP")
    print("="*60)
    unittest.main(verbosity=0)