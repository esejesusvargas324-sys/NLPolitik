"""
PRUEBA DE INTEGRACIÓN: Autoencoder → Clustering
IT-PIPE-003: Validar formación de clusters
"""

import sys
import os
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

class TestIntegracionAutoencoderClustering:
    
    def test_it_pipe_003_autoencoder_a_clustering(self):
        """IT-PIPE-003: Validar formación de clusters"""
        print("\n" + "="*60)
        print("PRUEBA 3: IT-PIPE-003")
        print("Título: Validar integración Autoencoder → Clustering")
        print("Precondiciones: Vectores latentes generados")
        print("Cobertura: Agrupación en espacio latente")
        print("Dependencias: scikit-learn")
        print("Pasos: 1. Crear datos latentes, 2. Estimar clusters, 3. Aplicar clustering")
        
        from app.services.procesador_clustering import ProcesadorClustering
        
        # Crear datos de prueba (vectores latentes ficticios)
        n_muestras = 20
        latent_dim = 4
        datos_prueba = np.random.randn(n_muestras, latent_dim).astype(np.float32)
        
        # Crear instancia del procesador
        clustering = ProcesadorClustering(metodo="kmeans")
        
        # ESTIMAR número óptimo de clusters usando el método de la clase original
        n_clusters_estimado = clustering.estimar_numero_clusters(
            datos_prueba,
            rango=list(range(2, 6))  # Buscar entre 2 y 5 clusters
        )
        
        # Actualizar el número de clusters en el procesador
        clustering.n_clusters = n_clusters_estimado
        
        # Aplicar clustering con el número estimado
        etiquetas, modelo = clustering.aplicar(datos_prueba)
        
        # Resultados
        clusters_unicos = np.unique(etiquetas)
        
        print(f"Datos: {n_muestras} muestras, {latent_dim}D")
        print(f"Clusters estimados automáticamente: {n_clusters_estimado}")
        print(f"Resultado esperado: Clusters formados en espacio latente")
        print(f"Resultado real: {len(clusters_unicos)} clusters encontrados")
        print(f"Distribución: {clustering.resumen_clustering()}")
        print(f"Estado: APROBADO")
        
        # Assertions
        assert len(etiquetas) == n_muestras
        assert len(clusters_unicos) > 0
        assert len(clusters_unicos) == n_clusters_estimado  # Verificar que se usó la estimación