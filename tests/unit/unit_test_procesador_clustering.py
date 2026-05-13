import unittest
import sys
import os
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.services.procesador_clustering import ProcesadorClustering

class TestProcesadorClustering(unittest.TestCase):
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        # Datos sintéticos para clustering: 3 clusters claros
        np.random.seed(42)
        self.n_muestras = 30
        self.n_features = 5
        
        # Cluster 1
        cluster1 = np.random.randn(10, self.n_features) + np.array([0, 0, 0, 0, 0])
        # Cluster 2
        cluster2 = np.random.randn(10, self.n_features) + np.array([5, 5, 5, 5, 5])
        # Cluster 3
        cluster3 = np.random.randn(10, self.n_features) + np.array([-5, -5, -5, -5, -5])
        
        self.X = np.vstack([cluster1, cluster2, cluster3])
        self.y_true = np.array([0]*10 + [1]*10 + [2]*10)
        
        # Datos muy separados para DBSCAN
        self.X_separados = np.array([
            [0, 0], [0.1, 0.1], [0, 0.2], [0.2, 0], [0.15, 0.15],  # Cluster 1 (5 puntos)
            [5, 5], [5.1, 5], [5, 5.2], [5.2, 5], [5.15, 5.15],    # Cluster 2 (5 puntos)
            [10, 10], [10.1, 10], [10, 10.2], [10.2, 10], [10.15, 10.15]  # Cluster 3 (5 puntos)
        ])
    
    # --- PRUEBA 1: UT-CLUS-001 ---
    def test_01_inicializacion_kmeans(self):
        """Validar inicialización con KMeans"""
        print("\n" + "="*60)
        print("PRUEBA 1: UT-CLUS-001")
        print("Título: Validar inicialización con KMeans")
        print("Precondiciones: Ninguna")
        print("Cobertura: Constructor __init__() - método kmeans")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Crear instancia con método kmeans")
        
        # MODIFICADO: Inicializamos sin n_clusters para usar estimación automática
        procesador = ProcesadorClustering(metodo="kmeans")
        
        resultado_esperado = "Procesador inicializado con KMeans, n_clusters por defecto"
        resultado_real = f"Método: {procesador.metodo}, n_clusters: {procesador.n_clusters}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (procesador.metodo == "kmeans" and 
                  procesador.modelo is None)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(procesador.metodo, "kmeans")
        self.assertIsNone(procesador.modelo)
    
    # --- PRUEBA 2: UT-CLUS-002 ---
    def test_02_aplicar_kmeans_clusters_correctos(self):
        """Validar KMeans encuentra clusters correctos"""
        print("\n" + "="*60)
        print("PRUEBA 2: UT-CLUS-002")
        print("Título: Validar KMeans encuentra clusters")
        print("Precondiciones: Datos sintéticos con 3 clusters")
        print("Cobertura: Método aplicar() - KMeans con datos claros")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Estimar clusters, 2. Aplicar KMeans")
        
        # MODIFICADO: Primero estimamos, luego aplicamos
        procesador = ProcesadorClustering(metodo="kmeans")
        
        # Estimar número óptimo de clusters
        k_estimado = procesador.estimar_numero_clusters(self.X)
        print(f" * k estimado automáticamente: {k_estimado}")
        
        # Actualizar n_clusters con el valor estimado
        procesador.n_clusters = k_estimado
        
        etiquetas, modelo = procesador.aplicar(self.X)
        
        clusters_unicos = np.unique(etiquetas)
        n_clusters_encontrados = len(clusters_unicos)
        
        resultado_esperado = f"3 clusters encontrados (estimados automáticamente)"
        resultado_real = f"k estimado: {k_estimado}, {n_clusters_encontrados} clusters encontrados: {clusters_unicos}"
        
        print(f"Datos: {self.X.shape} (3 clusters sintéticos)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Distribución: {dict(zip(*np.unique(etiquetas, return_counts=True)))}")
        estado = k_estimado == 3 and n_clusters_encontrados == 3
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(k_estimado, 3)
        self.assertEqual(n_clusters_encontrados, 3)
        self.assertIsInstance(modelo, type(procesador.modelo))
    
    # --- NUEVA PRUEBA 3: UT-CLUS-003 (DBSCAN) ---
    def test_03_aplicar_dbscan_clusters_correctos(self):
        """Validar DBSCAN encuentra clusters correctos con estimación automática"""
        print("\n" + "="*60)
        print("PRUEBA 3: UT-CLUS-003 (NUEVA)")
        print("Título: Validar DBSCAN encuentra clusters con estimación automática")
        print("Precondiciones: Datos muy separados con 3 clusters")
        print("Cobertura: Método aplicar() - DBSCAN con estimación automática de eps")
        print("Dependencias simuladas: scikit-learn, kneed")
        print("Pasos: 1. Crear procesador DBSCAN, 2. Estimar eps automáticamente, 3. Aplicar clustering")
        
        # Inicializar DBSCAN con parámetros base
        procesador = ProcesadorClustering(metodo="dbscan", eps=0.5, min_samples=3)
        
        # DBSCAN estimará eps automáticamente durante la aplicación
        print(" * DBSCAN estimará eps óptimo automáticamente durante la ejecución")
        etiquetas, modelo = procesador.aplicar(self.X_separados)
        
        # Contar clusters válidos (excluyendo outliers -1)
        clusters_validos = set(etiquetas) - {-1}
        n_clusters_encontrados = len(clusters_validos)
        n_outliers = sum(etiquetas == -1)
        
        resultado_esperado = "3 clusters encontrados (sin outliers, eps estimado automáticamente)"
        resultado_real = f"{n_clusters_encontrados} clusters, outliers: {n_outliers}, eps usado: {procesador.eps:.4f}, min_samples: {procesador.min_samples}"
        
        print(f"Datos: {self.X_separados.shape} (3 clusters muy separados, 5 puntos cada uno)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Etiquetas: {etiquetas}")
        print(f"Distribución: {dict(zip(*np.unique(etiquetas, return_counts=True)))}")
        
        # Para DBSCAN con datos bien separados, debería encontrar 3 clusters sin outliers
        estado = n_clusters_encontrados == 3 and n_outliers == 0
        
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(n_clusters_encontrados, 3)
        self.assertEqual(n_outliers, 0)  # Sin outliers
        self.assertIsNotNone(modelo)
        self.assertIsNotNone(etiquetas)
        
        # Verificar que eps fue ajustado automáticamente (no debería ser 0.5)
        self.assertNotEqual(round(procesador.eps, 2), 0.5)
    
    # --- PRUEBA 4: UT-CLUS-004 (antes AGNES, ahora 4) ---
    def test_04_aplicar_agnes_clusters_correctos(self):
        """Validar AGNES encuentra clusters correctos"""
        print("\n" + "="*60)
        print("PRUEBA 4: UT-CLUS-004 (antes AGNES)")
        print("Título: Validar AGNES encuentra clusters")
        print("Precondiciones: Datos sintéticos con 3 clusters")
        print("Cobertura: Método aplicar() - AGNES con datos claros")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Estimar clusters, 2. Aplicar AGNES")
        
        # MODIFICADO: Estimación automática primero
        procesador = ProcesadorClustering(metodo="agnes", linkage="ward")
        
        # Estimar número óptimo de clusters
        k_estimado = procesador.estimar_numero_clusters(self.X)
        print(f" * k estimado automáticamente: {k_estimado}")
        
        # Actualizar n_clusters con el valor estimado
        procesador.n_clusters = k_estimado
        
        etiquetas, modelo = procesador.aplicar(self.X)
        
        clusters_unicos = np.unique(etiquetas)
        n_clusters_encontrados = len(clusters_unicos)
        
        resultado_esperado = "3 clusters encontrados (AGNES con estimación automática)"
        resultado_real = f"k estimado: {k_estimado}, {n_clusters_encontrados} clusters encontrados: {clusters_unicos}"
        
        print(f"Datos: {self.X.shape} (3 clusters sintéticos)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Linkage usado: {procesador.linkage}")
        estado = k_estimado == 3 and n_clusters_encontrados == 3
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(k_estimado, 3)
        self.assertEqual(n_clusters_encontrados, 3)
    
    # --- PRUEBA 5: UT-CLUS-005 ---
    def test_05_resumen_clustering_completo(self):
        """Validar resumen de clustering"""
        print("\n" + "="*60)
        print("PRUEBA 5: UT-CLUS-005")
        print("Título: Validar resumen de clustering")
        print("Precondiciones: Clustering aplicado con estimación automática")
        print("Cobertura: Método resumen_clustering() - conteo por cluster")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Estimar clusters, 2. Aplicar clustering, 3. Obtener resumen")
        
        procesador = ProcesadorClustering(metodo="kmeans")
        
        # Estimar número óptimo de clusters automáticamente
        k_estimado = procesador.estimar_numero_clusters(self.X)
        procesador.n_clusters = k_estimado
        
        etiquetas, _ = procesador.aplicar(self.X)
        resumen = procesador.resumen_clustering()
        
        total_muestras = sum(resumen.values())
        
        resultado_esperado = f"Resumen con {k_estimado} clusters (estimados), total {len(self.X)} muestras"
        resultado_real = f"Clusters: {len(resumen)} (k estimado: {k_estimado}), Total muestras: {total_muestras}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Detalle: {resumen}")
        estado = (len(resumen) == k_estimado and total_muestras == len(self.X))
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(len(resumen), k_estimado)
        self.assertEqual(total_muestras, len(self.X))
    
   
    # --- PRUEBA 6: UT-CLUS-006 ---
    def test_06_actualizar_parametros_dbscan(self):
        """Validar actualización de parámetros DBSCAN"""
        print("\n" + "="*60)
        print("PRUEBA 6: UT-CLUS-006")
        print("Título: Validar actualización parámetros DBSCAN")
        print("Precondiciones: Procesador con método DBSCAN")
        print("Cobertura: Método actualizar_parametros_dbscan()")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Crear procesador DBSCAN, 2. Actualizar parámetros")
        
        procesador = ProcesadorClustering(metodo="dbscan", eps=0.5, min_samples=5)
        
        # Guardar valores originales
        eps_original = procesador.eps
        min_samples_original = procesador.min_samples
        
        # MODIFICADO: Usamos el método interno para estimar eps óptimo
        X_normalized = procesador.scaler.fit_transform(self.X_separados[:10])  # Usamos solo 10 muestras para prueba rápida
        eps_estimado = procesador._calcular_eps_optimo(X_normalized)
        
        # Actualizar con eps estimado
        procesador.actualizar_parametros_dbscan(eps=eps_estimado, min_samples=8)
        
        resultado_esperado = f"Parámetros actualizados: eps={eps_estimado:.4f}, min_samples=8"
        resultado_real = f"eps: {eps_original:.4f}→{procesador.eps:.4f}, " \
                        f"min_samples: {min_samples_original}→{procesador.min_samples}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (abs(procesador.eps - eps_estimado) < 0.01 and procesador.min_samples == 8)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertAlmostEqual(procesador.eps, eps_estimado, delta=0.01)
        self.assertEqual(procesador.min_samples, 8)
    
    # --- PRUEBA 7: UT-CLUS-007 ---
    def test_7_aplicar_dbscan_datos_separados(self):
        """Validar DBSCAN con datos bien separados"""
        print("\n" + "="*60)
        print("PRUEBA 7: UT-CLUS-007")
        print("Título: Validar DBSCAN con datos separados")
        print("Precondiciones: Datos muy separados (para DBSCAN)")
        print("Cobertura: Método aplicar() - DBSCAN con estimación automática de eps")
        print("Dependencias simuladas: scikit-learn, kneed")
        print("Pasos: 1. Crear datos muy separados, 2. Estimar eps, 3. Aplicar DBSCAN")
        
        procesador = ProcesadorClustering(metodo="dbscan", eps=0.5, min_samples=2)
        
        # MODIFICADO: DBSCAN ahora estima eps automáticamente
        print(" * DBSCAN estimará eps óptimo automáticamente")
        etiquetas, modelo = procesador.aplicar(self.X_separados)
        
        # Contar clusters válidos (excluyendo -1)
        clusters_validos = set(etiquetas) - {-1}
        n_clusters_encontrados = len(clusters_validos)
        
        resultado_esperado = "3 clusters encontrados (sin outliers, eps estimado automáticamente)"
        resultado_real = f"{n_clusters_encontrados} clusters, outliers: {sum(etiquetas == -1)}, eps usado: {procesador.eps:.4f}"
        
        print(f"Datos: {self.X_separados.shape} (3 clusters muy separados)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Etiquetas: {etiquetas}")
        estado = n_clusters_encontrados == 3
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(n_clusters_encontrados, 3)
        self.assertEqual(sum(etiquetas == -1), 0)  # Sin outliers
    
    # --- PRUEBA 8: UT-CLUS-008 ---
    def test_8_metodos_getter(self):
        """Validar métodos getter de etiquetas y modelo"""
        print("\n" + "="*60)
        print("PRUEBA 8: UT-CLUS-008")
        print("Título: Validar métodos getter")
        print("Precondiciones: Clustering aplicado con estimación automática")
        print("Cobertura: Métodos obtener_etiquetas() y obtener_modelo()")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Estimar clusters, 2. Aplicar clustering, 3. Obtener etiquetas y modelo")
        
        procesador = ProcesadorClustering(metodo="kmeans")
        
        # Primero estimamos el número óptimo de clusters
        k_estimado = procesador.estimar_numero_clusters(self.X[:20])  # Solo 20 para 2 clusters estimados
        procesador.n_clusters = k_estimado
        
        etiquetas_aplicadas, modelo_aplicado = procesador.aplicar(self.X[:20])
        
        etiquetas_getter = procesador.obtener_etiquetas()
        modelo_getter = procesador.obtener_modelo()
        
        resultado_esperado = "Getter devuelven mismos objetos que aplicar() (con k estimado automáticamente)"
        resultado_real = f"k estimado: {k_estimado}, Etiquetas iguales: {np.array_equal(etiquetas_aplicadas, etiquetas_getter)}, " \
                        f"Modelo igual: {modelo_aplicado is modelo_getter}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = (np.array_equal(etiquetas_aplicadas, etiquetas_getter) and 
                  modelo_aplicado is modelo_getter and
                  k_estimado >= 2)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertTrue(np.array_equal(etiquetas_aplicadas, etiquetas_getter))
        self.assertIs(modelo_aplicado, modelo_getter)
        self.assertGreaterEqual(k_estimado, 2)
    
    # --- PRUEBA 9: UT-CLUS-009 ---
    def test_9_consistencia_clustering(self):
        """Validar consistencia en clustering (20 ejecuciones)"""
        print("\n" + "="*60)
        print("PRUEBA 9: UT-CLUS-009")
        print("Título: Validar consistencia en clustering con estimación automática")
        print("Precondiciones: Datos fijos")
        print("Cobertura: Método aplicar() - consistencia 20 ejecuciones")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Estimar k una vez, 2. Ejecutar clustering 20 veces con misma semilla")
        
        # Estimamos k una sola vez
        procesador_base = ProcesadorClustering(metodo="kmeans")
        k_estimado = procesador_base.estimar_numero_clusters(self.X)
        
        todas_etiquetas = []
        print(f"Ejecutando KMeans 20 veces con k={k_estimado} (estimado automáticamente, random_state=42)...")
        
        for i in range(20):
            procesador = ProcesadorClustering(metodo="kmeans", n_clusters=k_estimado)
            etiquetas, _ = procesador.aplicar(self.X)
            todas_etiquetas.append(etiquetas)
            
            if i < 3:
                clusters = np.unique(etiquetas)
                print(f"  Ejecución {i+1}: {len(clusters)} clusters, distribución: {dict(zip(*np.unique(etiquetas, return_counts=True)))}")
        
        # Verificar consistencia: todas las ejecuciones deben tener misma estructura
        primera = todas_etiquetas[0]
        consistentes = True
        
        for i, etiq in enumerate(todas_etiquetas[1:], 1):
            # Para KMeans con random_state fijo y mismo k, deberían ser idénticos
            if not np.array_equal(etiq, primera):
                print(f"  Diferencia en ejecución {i+1}")
                consistentes = False
        
        resultado_esperado = f"20 ejecuciones idénticas (KMeans con k={k_estimado} estimado, random_state=42)"
        resultado_real = f"k estimado: {k_estimado}, {'Todas consistentes' if consistentes else 'Inconsistencias detectadas'}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if consistentes else 'FALLIDO'}")
        
        self.assertTrue(consistentes, "Clustering no es consistente en múltiples ejecuciones")
        self.assertEqual(k_estimado, 3, f"k estimado debería ser 3, pero es {k_estimado}")
    
    # --- PRUEBA 10: UT-CLUS-010 ---
    def test_10_manejo_datos_ruido(self):
        """Validar clustering con datos ruidosos"""
        print("\n" + "="*60)
        print("PRUEBA 10: UT-CLUS-013")
        print("Título: Validar clustering con datos ruidosos y estimación automática")
        print("Precondiciones: Datos con ruido añadido")
        print("Cobertura: Método aplicar() - robustez a ruido")
        print("Dependencias simuladas: scikit-learn")
        print("Pasos: 1. Añadir ruido a datos, 2. Estimar clusters, 3. Aplicar clustering")
        
        # Añadir ruido significativo
        ruido = np.random.randn(*self.X.shape) * 2.0
        X_ruidoso = self.X + ruido
        
        procesador = ProcesadorClustering(metodo="kmeans")
        
        try:
            # MODIFICADO: Primero estimamos k con datos ruidosos
            k_estimado = procesador.estimar_numero_clusters(X_ruidoso)
            print(f" * k estimado con datos ruidosos: {k_estimado}")
            procesador.n_clusters = k_estimado
            
            etiquetas, modelo = procesador.aplicar(X_ruidoso)
            clusters_unicos = np.unique(etiquetas)
            n_clusters = len(clusters_unicos)
            
            resultado_real = f"Clustering exitoso, k estimado: {k_estimado}, {n_clusters} clusters encontrados"
            exito = True
        except Exception as e:
            resultado_real = f"Error: {str(e)}"
            exito = False
        
        resultado_esperado = "Clustering robusto a datos ruidosos con estimación automática"
        
        print(f"Datos: {X_ruidoso.shape} (con ruido significativo)")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        
        if exito:
            # Verificar que se encontraron clusters (pueden ser menos de 3 por ruido)
            tiene_clusters = n_clusters >= 1 and k_estimado >= 1
            print(f"k estimado: {k_estimado}, Clusters encontrados: {n_clusters}")
            print(f"Estado: {'APROBADO' if tiene_clusters else 'FALLIDO'}")
            self.assertGreaterEqual(n_clusters, 1)
            self.assertGreaterEqual(k_estimado, 1)
        else:
            print(f"Estado: FALLIDO")
            self.fail("Clustering falló con datos ruidosos")

if __name__ == '__main__':
    print("INICIO DE PRUEBAS UNITARIAS - PROCESADOR CLUSTERING (ESTIMACIÓN AUTOMÁTICA)")
    print("="*60)
    print(f"Total pruebas: 10")
    print("="*60)
    unittest.main(verbosity=0)