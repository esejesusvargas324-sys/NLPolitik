import numpy as np
from typing import Dict, Optional, Any
from app.services.procesador_embeddings import ProcesadorEmbedding
from app.services.procesador_autoencoder import ProcesadorAutoencoder
from app.services.procesador_clustering import ProcesadorClustering
from app.services.procesador_clasificador import ProcesadorClasificacion
from app.services.procesador_metricas import ProcesadorMetricas

class ProcesadorPipelineIdeologico:
    # Pipeline principal para análisis ideológico que coordina:
    """
    - Generación de embeddings semánticos
    - Reducción dimensional con autoencoder
    - Clustering de contenidos
    - Clasificación ideológica
    - Evaluación de métricas de calidad
    """
    
    def __init__(
        self,
        vocabulario: Dict[str, str],
        modelo_embedding: str = "beto",
        ruta_modelo: Optional[str] = None,
        metodo_clustering: str = "kmeans",
        n_clusters: Optional[int] = None,
        usar_umap: bool = True
    ):
        self.vocabulario = vocabulario
        self.modelo_embedding = modelo_embedding
        self.ruta_modelo = ruta_modelo
        self.metodo_clustering = metodo_clustering
        self.n_clusters = n_clusters
        self.usar_umap = usar_umap
        
        # Estado interno del pipeline
        self.modelo = None
        self.autoencoder = None
        self.X = None
        self.X_latente = None
        self.mapeo = None
        self.etiquetas = None
        self.modelo_clustering = None
        self.metricas = {}
        self.resultado = {}
        self.embeddings_reducidos = None

    def ejecutar(self) -> Dict[int, Dict[str, str]]:
        """
        Ejecuta el pipeline completo de análisis ideológico
        """
        print("="*60)
        print("INICIANDO PIPELINE DE ANÁLISIS IDEOLÓGICO")
        print("="*60)
        
        # 1. Generar embeddings completos desde cero
        print(" * Generando embeddings desde cero...")
        self._generar_embeddings_completos()
        
        # 2. Clustering (SIEMPRE se ejecuta)
        print("\n" + "="*60)
        print("APLICANDO CLUSTERING")
        print("="*60)
        self._aplicar_clustering()
        
        # 3. Generar visualización (PCA)
        print("\n" + "="*60)
        print("GENERANDO VISUALIZACIÓN")
        print("="*60)
        self.embeddings_reducidos = self._generar_umap(self.X_latente)
        
        # 4. Evaluar métricas (SIEMPRE se ejecuta)
        print("\n" + "="*60)
        print("EVALUANDO MÉTRICAS")
        print("="*60)
        self._evaluar_metricas()
        
        # 5. Clasificación ideológica (SIEMPRE se ejecuta)
        print("\n" + "="*60)
        print("CLASIFICANDO IDEOLÓGICAMENTE")
        print("="*60)
        self._clasificar_ideologicamente()
        
        print("\n" + "="*60)
        print("PIPELINE COMPLETADO")
        print("="*60)
        
        return self.resultado
    
    def _generar_embeddings_completos(self):
        """
        Genera embeddings completos desde cero 
        """
        print("  Cargando modelo de embeddings...")
        self.modelo = ProcesadorEmbedding(modelo=self.modelo_embedding, ruta_modelo=self.ruta_modelo)

        print(" Generando embeddings por palabra...")
        self.X, self.mapeo = self.modelo.embed_lista_con_contexto(self.vocabulario)

        # Verificar que todos los embeddings sean válidos
        palabras_invalidas = [p for p, v in self.mapeo.items() if v is None or not isinstance(v, np.ndarray)]
        if palabras_invalidas:
            print(f" * Palabras con vectores inválidos: {palabras_invalidas}")
            raise ValueError("Se encontraron vectores inválidos en los embeddings. Revisa el vocabulario o el modelo.")

        # Aplicar reducción dimensional con autoencoder
        print(" * Codificando con autoencoder...")
        self.autoencoder = ProcesadorAutoencoder(input_dim=self.modelo.get_dimension_con_contexto())
        self.autoencoder.entrenar(self.X)
        self.X_latente = self.autoencoder.codificar(self.X)
        
        print(f" * Embeddings generados: {len(self.mapeo)} palabras, {self.X_latente.shape[1]} dimensiones latentes")
    
    def _aplicar_clustering(self):
        """
        Aplica clustering (siempre se ejecuta)
        """
        print(" * Inicializando clustering...")
        clustering = ProcesadorClustering(
            metodo=self.metodo_clustering,
            n_clusters=self.n_clusters if self.n_clusters is not None else 4
        )

        # Estimar número óptimo de clusters si no se especifica
        if self.metodo_clustering in ["kmeans", "agnes"] and self.n_clusters is None:
            print(" * Estimando número óptimo de clústeres...")
            self.n_clusters = clustering._estimar_clusters(self.X_latente)
            clustering.n_clusters = self.n_clusters

        print(f" * Aplicando {self.metodo_clustering.upper()} con {self.n_clusters} clusters...")
        self.etiquetas, self.modelo_clustering = clustering.aplicar(self.X_latente)

        # Validar que se generaron múltiples clusters
        unique_clusters = np.unique(self.etiquetas)
        if len(unique_clusters) == 1:
            print(" * Todos los puntos en un cluster. Reasignando manualmente...")
            self.etiquetas = np.zeros(len(self.etiquetas))
            self.etiquetas[:len(self.etiquetas)//2] = 1
        
        print(f"   - Clusters generados: {len(unique_clusters)}")
        for cluster_id in unique_clusters:
            count = np.sum(self.etiquetas == cluster_id)
            print(f"     Cluster {cluster_id}: {count} elementos ({count/len(self.etiquetas)*100:.1f}%)")
    
    def _evaluar_metricas(self):
        """
        Evalúa métricas de calidad (siempre se ejecuta)
        """
        print(" * Evaluando calidad del clustering...")
        procesador_metricas = ProcesadorMetricas(
            X_latente=self.X_latente,
            etiquetas=self.etiquetas,
            palabras=list(self.mapeo.keys())
        )
        self.metricas = procesador_metricas.evaluar()
        
        # Mostrar métricas principales
        metricas_principales = procesador_metricas.obtener_metricas_principales()
        print("   - Métricas principales:")
        for nombre, valor in metricas_principales.items():
            if isinstance(valor, (float, int)):
                print(f"     {nombre}: {valor:.4f}")
            else:
                print(f"     {nombre}: {valor}")
    
    def _clasificar_ideologicamente(self):
        """
        Clasifica ideológicamente los clusters (siempre se ejecuta)
        """
        print(" * Clasificando clústeres ideológicos...")
        procesador_clasificacion = ProcesadorClasificacion()
        self.resultado = procesador_clasificacion.interpretar_clusters(
            etiquetas=self.etiquetas,
            mapeo_palabra_vector=self.mapeo,
            vocabulario=self.vocabulario
        )
        
        print("   - Resultados de clasificación:")
        for cluster_id, info in self.resultado.items():
            if isinstance(info, dict):
                ideologia = info.get('ideologia', 'desconocido')
                palabras_clave = info.get('palabras_clave', [])[:3]
                print(f"     Cluster {cluster_id}: {ideologia}")
                if palabras_clave:
                    print(f"       Palabras clave: {', '.join(palabras_clave)}")
    
    def _generar_umap(self, embeddings_latentes: np.ndarray) -> Dict[str, list]:
        """
        PCA 3D - output directo
        """
        print(f"  PCA 3D aplicado")
        
        from sklearn.decomposition import PCA
        
        # Solo PCA, nada más
        pca = PCA(n_components=3)
        X_pca = pca.fit_transform(embeddings_latentes)
        
        # Diccionario con valores directos de PCA
        palabras = list(self.mapeo.keys())
        return {
            palabra: X_pca[i].tolist() 
            for i, palabra in enumerate(palabras)
        }

    def exportar_resultados(self) -> Dict[str, Any]:
        """
        Exporta todos los resultados del pipeline en formato estructurado
        """
        return {
            "Agrupacion_asignacion_clusters": {
                str(palabra): int(cluster) for palabra, cluster in zip(self.mapeo.keys(), self.etiquetas)
            },
            "Agrupacion_interpretacion_ideologica": self.resultado,
            "Agrupacion_embeddings_latentes": self.embeddings_reducidos,
            "Agrupacion_metricas_clustering": self.metricas,
            "Agrupacion_parametros_ejecucion": {
                "modelo_embedding": self.modelo_embedding,
                "metodo_clustering": self.metodo_clustering,
                "n_clusters": self.n_clusters,
                "dimensionalidad": self.X_latente.shape[1],
                "tipo_embeddings": "pca_3d"
            }
        }