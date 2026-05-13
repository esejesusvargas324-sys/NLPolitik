import numpy as np
from typing import List, Tuple, Dict, Union
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class ProcesadorEmbedding:
    # ===== INICIO PATRÓN SINGLETON =====
    _instancia_unica = None
    _modelo_compartido = None
    _dimension_compartida = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instancia_unica is None:
            cls._instancia_unica = super().__new__(cls)
        return cls._instancia_unica
    # ===== FIN PATRÓN SINGLETON =====
    
    def __init__(self, modelo: str = "beto", ruta_modelo: str = None):
        # ===== INICIO PATRÓN SINGLETON (inicialización única) =====
        if not hasattr(self, '_inicializado'):
            self.modelo = modelo.lower()
            self.ruta_modelo = ruta_modelo
            self.modelo_cargado = None
            self.dimension = None
            self._cargar_modelo()
            self._inicializado = True
        # ===== FIN PATRÓN SINGLETON =====

    def _cargar_modelo(self):
        #Cargamos un SentenceTransformer multilingüe.
        
        # ===== INICIO PATRÓN SINGLETON (reutilizar modelo) =====
        if ProcesadorEmbedding._modelo_compartido is not None:
            print(f" * Usando modelo SentenceTransformer desde instancia compartida")
            self.modelo_cargado = ProcesadorEmbedding._modelo_compartido
            self.dimension = ProcesadorEmbedding._dimension_compartida
            return
        # ===== FIN PATRÓN SINGLETON =====
        
        if self.modelo == "beto":
            nombre_modelo = self.ruta_modelo or "hiiamsid/sentence_similarity_spanish_es"
            print(f" Cargando modelo SentenceTransformer (modo BETO simulado): {nombre_modelo}")
            self.modelo_cargado = SentenceTransformer(nombre_modelo)
            ejemplo = self.modelo_cargado.encode(["hola"])
            self.dimension = ejemplo[0].shape[0]  # CORRECCIÓN: shape[0] no shape[1]
            
            # ===== INICIO PATRÓN SINGLETON (guardar modelo compartido) =====
            ProcesadorEmbedding._modelo_compartido = self.modelo_cargado
            ProcesadorEmbedding._dimension_compartida = self.dimension
            # ===== FIN PATRÓN SINGLETON =====
        else:
            raise ValueError(f"Modelo '{self.modelo}' no soportado actualmente (usa 'beto').")

    def embed_palabra(self, frase: str, estrategia: str = "mean_pooling") -> np.ndarray:
        #Retorna el embedding de una palabra o frase usando SentenceTransformer.
        
        frase = frase.strip()
        if not frase:
            return np.zeros(self.dimension)

        embedding = self.modelo_cargado.encode([frase])[0]
        return np.array(embedding)

    def embed_frase_con_contexto(self, frase: str, documentos_origen: List[str]) -> np.ndarray:
        #Crea un embedding que combine la frase + contexto de sus documentos de origen
        
        # 1. Embedding de la frase misma
        embedding_frase = self.embed_palabra(frase)
        
        # 2. Embedding del contexto documental (promedio de todos los documentos donde aparece)
        embeddings_documentos = []
        for doc in documentos_origen:
            # Usar el título/identificador del documento como representación
            embedding_doc = self.embed_palabra(doc)
            embeddings_documentos.append(embedding_doc)
        
        if embeddings_documentos:
            embedding_contexto = np.mean(embeddings_documentos, axis=0)
        else:
            embedding_contexto = np.zeros_like(embedding_frase)
        
        # 3. Combinar frase + contexto (CONCATENACIÓN para preservar ambas informaciones)
        embedding_combinado = np.concatenate([embedding_frase, embedding_contexto])
        
        return embedding_combinado

    def embed_lista_con_contexto(self, vocabulario: Dict[str, List[str]]) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        #Genera embeddings con contexto documental
    
        matriz = []
        mapeo = {}
        
        print(f" Generando embeddings con contexto documental ({len(vocabulario)} frases)...")
        
        for i, (frase, documentos) in enumerate(vocabulario.items()):
            vec = self.embed_frase_con_contexto(frase, documentos)
            
            if vec is None or not isinstance(vec, np.ndarray):
                print(f" * Vector inválido para frase: '{frase}'")
                vec = np.zeros(self.dimension * 2)  
                
            matriz.append(vec)
            mapeo[frase] = vec
            
            if (i + 1) % 50 == 0:
                print(f" Procesadas {i + 1}/{len(vocabulario)} frases")
        
        print(f" Dimensión final con contexto: {matriz[0].shape[0]}D (original: {self.dimension}D)")
        return np.array(matriz), mapeo

    def get_dimension(self) -> int:
        return self.dimension
    
    def get_dimension_con_contexto(self) -> int:
        """
        Retorna la dimensión de los embeddings con contexto (2x la dimensión original)
        """
        return self.dimension * 2