import numpy as np
from typing import Union, Tuple, List, Optional
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from kneed import KneeLocator

class ProcesadorClustering:
    
    def __init__(self, metodo: str = "kmeans", n_clusters: int = 10,
                 eps: float = 0.5, min_samples: int = 5, linkage: str = "ward"):
        self.metodo = metodo.lower()
        self.n_clusters = n_clusters
        self.eps = eps
        self.min_samples = min_samples
        self.linkage = linkage
        self.modelo = None
        self.etiquetas = None
        self.scaler = StandardScaler()
        
    def aplicar(self, X: np.ndarray) -> Tuple[np.ndarray, any]:
        """Aplica clustering según el método seleccionado"""
        n_muestras = len(X)
        print(f"\n=== CLUSTERING {self.metodo.upper()} ===")
        print(f"Muestras: {n_muestras}")
        
        # Normalizar datos
        X_norm = self.scaler.fit_transform(X)
        
        if self.metodo == "kmeans" or self.metodo == "agnes":
            # Estimar número óptimo de clusters
            if self.n_clusters is None or self.n_clusters <= 1:
                self.n_clusters = self._estimar_clusters(X_norm)
            print(f"Clusters: {self.n_clusters}")
            
            # Aplicar clustering
            if self.metodo == "kmeans":
                self.modelo = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
            else:  # agnes
                self.modelo = AgglomerativeClustering(
                    n_clusters=self.n_clusters, 
                    linkage=self.linkage
                )
            
            self.etiquetas = self.modelo.fit_predict(X_norm)
            
        elif self.metodo == "dbscan":
            # Autoajustar parámetros si es necesario
            if self.eps == 0.5:  # Valor por defecto, probablemente no óptimo
                self.eps = self._calcular_eps_optimo(X_norm)
                self.min_samples = max(3, min(10, n_muestras // 50))
            
            print(f"eps: {self.eps:.4f}, min_samples: {self.min_samples}")
            
            self.modelo = DBSCAN(eps=self.eps, min_samples=self.min_samples)
            self.etiquetas = self.modelo.fit_predict(X_norm)
            
            # Normalizar etiquetas (opcional, mejora visualización)
            self.etiquetas = self._normalizar_etiquetas(self.etiquetas)
            
        else:
            raise ValueError(f"Método no soportado: {self.metodo}")
        
        # Mostrar resultados básicos
        self._mostrar_resumen()
        
        return self.etiquetas, self.modelo
    
    def _estimar_clusters(self, X_norm: np.ndarray, max_k: int = 15) -> int:
        """Estima número óptimo de clusters usando silhouette score"""
        n_muestras = len(X_norm)
        max_k = min(max_k, n_muestras // 5)  # Limitar según tamaño
        
        if max_k < 2:
            return 2
        
        mejores_k = []
        for k in range(2, max_k + 1):
            if self.metodo == "kmeans":
                modelo = KMeans(n_clusters=k, random_state=42, n_init=5)
            else:
                modelo = AgglomerativeClustering(n_clusters=k, linkage=self.linkage)
            
            etiquetas = modelo.fit_predict(X_norm)
            
            # Verificar que hay al menos 2 clusters con puntos
            if len(np.unique(etiquetas)) >= 2:
                try:
                    score = silhouette_score(X_norm, etiquetas)
                    mejores_k.append((k, score))
                    print(f"  k={k}: silhouette={score:.3f}")
                except:
                    pass
        
        if not mejores_k:
            return 2
        
        # Seleccionar k con mejor silhouette
        mejor_k = max(mejores_k, key=lambda x: x[1])[0]
        return mejor_k
    
    def _calcular_eps_optimo(self, X_norm: np.ndarray) -> float:
        """Calcula eps óptimo usando k-distance plot"""
        n_muestras = len(X_norm)
        
        # Valores por defecto para pocos datos
        if n_muestras < 20:
            return 0.3
        elif n_muestras < 50:
            return 0.25
        
        # k para k-distance (típicamente min_samples)
        k = min(3, n_muestras // 20)
        k = max(3, k)
        
        # Calcular distancias
        vecinos = NearestNeighbors(n_neighbors=k)
        vecinos.fit(X_norm)
        distancias, _ = vecinos.kneighbors(X_norm)
        
        # Distancia al k-ésimo vecino
        k_distances = np.sort(distancias[:, -1])
        
        # Encontrar codo
        try:
            kneedle = KneeLocator(
                range(len(k_distances)), 
                k_distances,
                curve='convex',
                direction='increasing'
            )
            if kneedle.knee:
                eps = k_distances[kneedle.knee]
            else:
                eps = np.percentile(k_distances, 80)
        except:
            eps = np.percentile(k_distances, 80)
        
        # Limitar a rango razonable
        eps = max(0.05, min(eps, 0.5))
        
        return eps
    
    def _normalizar_etiquetas(self, etiquetas: np.ndarray) -> np.ndarray:
        """Renombra clusters para que sean consecutivos (0,1,2,...)"""
        etiquetas_norm = etiquetas.copy()
        clusters_unicos = np.unique(etiquetas[etiquetas >= 0])
        
        for i, cluster in enumerate(clusters_unicos):
            etiquetas_norm[etiquetas == cluster] = i
        
        return etiquetas_norm
    
    def _mostrar_resumen(self):
        """Muestra resumen básico del clustering"""
        if self.etiquetas is None:
            return
        
        clusters_unicos = np.unique(self.etiquetas)
        n_clusters = len(clusters_unicos[clusters_unicos >= 0])
        n_ruido = np.sum(self.etiquetas == -1) if -1 in clusters_unicos else 0
        
        print(f"\nRESULTADOS:")
        print(f"  Clusters: {n_clusters}")
        if n_ruido > 0:
            pct_ruido = n_ruido / len(self.etiquetas) * 100
            print(f"  Ruido: {n_ruido} puntos ({pct_ruido:.1f}%)")
        
        # Distribución de tamaños
        if n_clusters > 0:
            tamaños = []
            for c in range(n_clusters):
                size = np.sum(self.etiquetas == c)
                tamaños.append(size)
            print(f"  Tamaño clusters: min={min(tamaños)}, max={max(tamaños)}, media={np.mean(tamaños):.1f}")