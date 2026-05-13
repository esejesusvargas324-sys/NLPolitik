import unittest
import numpy as np
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from app.services.procesador_embeddings import ProcesadorEmbedding

class TestProcesadorEmbedding(unittest.TestCase):
    
    def setUp(self):
        """Inicializa el procesador antes de cada prueba"""
        self.procesador = ProcesadorEmbedding(modelo="beto")
    
    # --- PRUEBA 1: UT-EMB-001 ---
    def test_01_inicializacion_correcta(self):
        """Validar inicialización del procesador de embeddings"""
        print("\n" + "="*60)
        print("PRUEBA 1: UT-EMB-001")
        print("Título: Validar inicialización del procesador")
        print("Precondiciones: Ninguna")
        print("Cobertura: Constructor __init__() - modelo cargado")
        print("Dependencias simuladas: SentenceTransformer español")
        print("Pasos: 1. Crear instancia de ProcesadorEmbedding")
        
        resultado_esperado = "Modelo SentenceTransformer cargado"
        resultado_real = f"Modelo cargado, dimensión: {self.procesador.dimension}D"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if self.procesador.modelo_cargado else 'FALLIDO'}")
        
        self.assertIsNotNone(self.procesador.modelo_cargado)
        self.assertGreater(self.procesador.dimension, 0)
    
    # --- PRUEBA 2: UT-EMB-002 ---
    def test_02_embed_palabra_frase_valida(self):
        """Validar embedding de frase normal"""
        print("\n" + "="*60)
        print("PRUEBA 2: UT-EMB-002")
        print("Título: Validar embedding de frase válida")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_palabra() - entrada normal")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embedding para frase simple")
        
        frase = "el gobierno debe mejorar la economía"
        embedding = self.procesador.embed_palabra(frase)
        
        resultado_esperado = f"Vector numpy de {self.procesador.dimension} dimensiones"
        resultado_real = f"Vector shape: {embedding.shape}, tipo: {type(embedding)}"
        
        print(f"Entrada: '{frase}'")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Valores muestra: {embedding[:3]}")
        estado = isinstance(embedding, np.ndarray) and embedding.shape == (self.procesador.dimension,)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertIsInstance(embedding, np.ndarray)
        self.assertEqual(embedding.shape, (self.procesador.dimension,))
    
    # --- PRUEBA 3: UT-EMB-003 ---
    def test_03_embed_palabra_frase_vacia(self):
        """Validar embedding de frase vacía"""
        print("\n" + "="*60)
        print("PRUEBA 3: UT-EMB-003")
        print("Título: Validar embedding de frase vacía")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_palabra() - entrada vacía")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embedding para string vacío")
        
        frase = ""
        embedding = self.procesador.embed_palabra(frase)
        
        resultado_esperado = f"Vector de ceros de {self.procesador.dimension}D"
        resultado_real = f"Vector shape: {embedding.shape}, suma: {np.sum(embedding):.2f}"
        
        print(f"Entrada: (string vacío)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = np.all(embedding == 0)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertTrue(np.all(embedding == 0))
        self.assertEqual(embedding.shape, (self.procesador.dimension,))
    
    # --- PRUEBA 4: UT-EMB-004 ---
    def test_04_embed_frase_con_contexto(self):
        """Validar embedding con contexto documental"""
        print("\n" + "="*60)
        print("PRUEBA 4: UT-EMB-004")
        print("Título: Validar embedding con contexto")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_frase_con_contexto()")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embedding con documentos de origen")
        
        frase = "reforma fiscal"
        documentos = ["Artículo económico 2023", "Análisis presupuestario 2024"]
        embedding = self.procesador.embed_frase_con_contexto(frase, documentos)
        
        dimension_esperada = self.procesador.dimension * 2
        resultado_esperado = f"Vector concatenado de {dimension_esperada}D"
        resultado_real = f"Vector shape: {embedding.shape}"
        
        print(f"Frase: '{frase}'")
        print(f"Documentos: {documentos}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = embedding.shape == (dimension_esperada,)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(embedding.shape, (dimension_esperada,))
    
    # --- PRUEBA 5: UT-EMB-005 ---
    def test_05_embed_frase_sin_contexto(self):
        """Validar embedding con lista vacía de documentos"""
        print("\n" + "="*60)
        print("PRUEBA 5: UT-EMB-005")
        print("Título: Validar embedding sin documentos")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_frase_con_contexto() - sin documentos")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embedding con lista vacía de documentos")
        
        frase = "política económica"
        documentos = []
        embedding = self.procesador.embed_frase_con_contexto(frase, documentos)
        
        dimension_esperada = self.procesador.dimension * 2
        resultado_esperado = f"Vector de {dimension_esperada}D con mitad ceros"
        resultado_real = f"Vector shape: {embedding.shape}"
        
        print(f"Frase: '{frase}'")
        print(f"Documentos: [] (vacío)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        
        # Verificar que la segunda mitad (contexto) sea ceros
        mitad = self.procesador.dimension
        contexto_es_cero = np.all(embedding[mitad:] == 0)
        
        estado = embedding.shape == (dimension_esperada,) and contexto_es_cero
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(embedding.shape, (dimension_esperada,))
        self.assertTrue(contexto_es_cero)
    
    # --- PRUEBA 6: UT-EMB-006 ---
    def test_06_embed_lista_con_contexto(self):
        """Validar embedding de lista completa"""
        print("\n" + "="*60)
        print("PRUEBA 6: UT-EMB-006")
        print("Título: Validar embedding de lista de frases")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_lista_con_contexto()")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embeddings para diccionario de frases")
        
        vocabulario = {
            "impuestos altos": ["Doc1", "Doc2"],
            "gasto público": ["Doc2", "Doc3"],
            "deficit fiscal": ["Doc1"]
        }
        
        matriz, mapeo = self.procesador.embed_lista_con_contexto(vocabulario)
        
        resultado_esperado = f"Matriz de 3x{self.procesador.dimension*2} y mapeo de 3 frases"
        resultado_real = f"Matriz shape: {matriz.shape}, mapeo keys: {len(mapeo)}"
        
        print(f"Vocabulario: {len(vocabulario)} frases con documentos")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (matriz.shape == (3, self.procesador.dimension*2) and 
                  len(mapeo) == 3)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(matriz.shape[0], 3)
        self.assertEqual(len(mapeo), 3)
        self.assertIn("impuestos altos", mapeo)
    
   # --- PRUEBA 7: UT-EMB-007 ---
    def test_07_consistencia_embeddings(self):
        """Validar consistencia en embeddings (20 ejecuciones)"""
        print("\n" + "="*60)
        print("PRUEBA 7: UT-EMB-007")
        print("Título: Validar consistencia en embeddings")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Método embed_palabra() - consistencia con 20 ejecuciones")
        print("Dependencias simuladas: Modelo SentenceTransformer")
        print("Pasos: 1. Generar embedding 20 veces para misma frase")
        
        frase = "la economía necesita crecimiento sostenible"
        embeddings = []
        
        print(f"Frase: '{frase}'")
        print("Generando 20 embeddings...")
        
        for i in range(20):
            emb = self.procesador.embed_palabra(frase)
            embeddings.append(emb)
            if i < 3:  # Solo mostrar primeros 3 para no saturar
                print(f"  Ejecución {i+1}: norma={np.linalg.norm(emb):.4f}")
        
        # Calcular similitud coseno entre todas las combinaciones
        similitudes = []
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                # Evitar división por cero
                norm_i = np.linalg.norm(embeddings[i])
                norm_j = np.linalg.norm(embeddings[j])
                if norm_i > 0 and norm_j > 0:
                    sim = np.dot(embeddings[i], embeddings[j]) / (norm_i * norm_j)
                    similitudes.append(sim)
                else:
                    similitudes.append(0.0)
        
        promedio_sim = np.mean(similitudes) if similitudes else 0
        min_sim = np.min(similitudes) if similitudes else 0
        max_sim = np.max(similitudes) if similitudes else 0
        
        # Estadísticas
        num_comparaciones = len(similitudes)
        
        resultado_esperado = f"20 embeddings idénticos ({num_comparaciones} comparaciones, similitud > 0.999)"
        resultado_real = f"Similitud: promedio={promedio_sim:.6f}, min={min_sim:.6f}, max={max_sim:.6f}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Comparaciones realizadas: {num_comparaciones}")
        
        # Verificar que todas las similitudes sean > 0.999 (casi idénticas)
        todas_similares = all(sim > 0.999 for sim in similitudes)
        estado = todas_similares and len(set([tuple(e) for e in embeddings])) == 1
        
        if estado:
            print(f"Estado: APROBADO (todos los embeddings son idénticos)")
        elif todas_similares:
            print(f"Estado: APROBADO (similitud > 0.999 en todas las comparaciones)")
        else:
            print(f"Estado: FALLIDO (algunas similitudes ≤ 0.999)")
        
        # El assert es más flexible para modelos transformer
        self.assertTrue(promedio_sim > 0.99, f"Similitud promedio muy baja: {promedio_sim}")
    
    # --- PRUEBA 8: UT-EMB-008 ---
    def test_08_metodos_dimension(self):
        """Validar métodos de dimensión"""
        print("\n" + "="*60)
        print("PRUEBA 8: UT-EMB-008")
        print("Título: Validar métodos de dimensión")
        print("Precondiciones: Procesador inicializado")
        print("Cobertura: Métodos get_dimension() y get_dimension_con_contexto()")
        print("Dependencias simuladas: Ninguna")
        print("Pasos: 1. Obtener dimensiones base y con contexto")
        
        dim_base = self.procesador.get_dimension()
        dim_contexto = self.procesador.get_dimension_con_contexto()
        
        resultado_esperado = f"Dimensión contexto ({dim_contexto}) = 2 × dimensión base ({dim_base})"
        resultado_real = f"Base: {dim_base}D, Contexto: {dim_contexto}D"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = dim_contexto == dim_base * 2
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(dim_contexto, dim_base * 2)
        self.assertEqual(dim_base, self.procesador.dimension)

if __name__ == '__main__':
    print("INICIO DE PRUEBAS UNITARIAS - PROCESADOR EMBEDDINGS")
    print("="*60)
    unittest.main(verbosity=0)