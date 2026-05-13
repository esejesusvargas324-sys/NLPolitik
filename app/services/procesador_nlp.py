import re
import spacy
from spacy.matcher import Matcher

class ProcesadorNLP:
    _recursos_descargados = True

    @classmethod
    def descargar_recursos(cls):
        #  Se descarga el modelo spaCy si no está disponible
        if not cls._recursos_descargados:
            try:
                spacy.cli.download("es_core_news_md")
            except:
                pass
            cls._recursos_descargados = True

    def __init__(self):
         # Se inicializa el modelo spaCy en español
        self.descargar_recursos()
        try:
            self.spacy_nlp = spacy.load("es_core_news_md")
        except Exception as e:
            print(f"Error inicializando spaCy: {e}")
            self.spacy_nlp = None

    @staticmethod
    def limpiar_texto(texto):
        """Limpia texto conservando puntuación esencial para segmentación"""
        if texto is None: 
            return ""
    
        if isinstance(texto, bytes):
            texto = texto.decode("utf-8", errors="ignore")
        
        # Convertir a minúsculas
        texto = texto.lower()
        
        # MODIFICAR: Conservar puntuación esencial (. , ; : ! ?)
        # Eliminar solo caracteres especiales no deseados, mantener puntuación
        texto = re.sub(r'[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:]', '', texto)
        
        # Normalizar espacios y saltos de línea
        texto = texto.replace('\n', ' ').replace('\t', ' ')
        texto = re.sub(r'\s+', ' ', texto).strip()
        
        return texto

    def extraer_frases_y_pos(self, texto):
        """Extrae SOLO oraciones completas que contengan patrones sintácticos significativos"""
        if not self.spacy_nlp:
            return [], []
        
        try:
            doc = self.spacy_nlp(texto)
            frases_encontradas = []
            etiquetas_pos = []
            
            # Patrones para estructuras significativas
            patterns = [
                [{"POS": "VERB"}, {"POS": "DET", "OP": "?"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN"}],
                [{"POS": "NOUN"}, {"POS": "ADP"}, {"POS": "DET", "OP": "?"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN"}],
                [{"POS": "ADJ"}, {"POS": "NOUN"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN", "OP": "?"}]
            ]
            
            matcher = Matcher(self.spacy_nlp.vocab)
            for i, pattern in enumerate(patterns):
                matcher.add(f"PATRON_{i}", [pattern])
            
            # SOLO oraciones completas que contengan patrones
            for sent in doc.sents:
                frase_completa = sent.text.strip()
                num_palabras = len(frase_completa.split())
                
                # Filtrar por longitud
                if not (8 <= num_palabras <= 35):
                    continue
                
                # VERIFICAR si contiene patrones significativos
                matches = matcher(sent)
                if matches:  # Solo si tiene al menos un patrón
                    frases_encontradas.append(frase_completa.lower())
                    
                    # POS tags
                    pos_tags = [{"token": token.text, "tag": token.pos_} for token in sent]
                    etiquetas_pos.append({
                        "frase": frase_completa,
                        "pos_tags": pos_tags,
                        "patrones_encontrados": len(matches)
                    })
            
            print(f"Oraciones con patrones: {len(frases_encontradas)}")
            for i, frase in enumerate(frases_encontradas[:5]):
                print(f"   {i+1}. {frase}")
            
            return frases_encontradas, etiquetas_pos
            
        except Exception as e:
            print(f"Error en extracción: {e}")
            return [], []
        
    def procesar_archivo_individual(self, titulo, texto_raw):
        # Se procesa un archivo individual y devuelve resultados estructurados
        print(f"Procesando archivo: {titulo}")

        # Calcular caracteres antes de limpiar
        caracteres_antes = len(texto_raw) if texto_raw else 0
        
        # Limpiar texto
        texto_limpio = self.limpiar_texto(texto_raw)
        
        # Calcular caracteres eliminados
        caracteres_despues = len(texto_limpio)
        caracteres_eliminados = max(0, caracteres_antes - caracteres_despues)

        # Extraer frases y etiquetas POS
        frases, etiquetas_pos = self.extraer_frases_y_pos(texto_limpio)
        print(f"Frases encontradas: {len(frases)}")
        
        # Calcular longitudes para promedio
        longitudes_frases = [len(frase.split()) for frase in frases]
        
        return {
            'titulo': titulo,
            'texto_limpio': texto_limpio,
            'caracteres_eliminados': caracteres_eliminados,
            'frases': frases,
            'etiquetas_pos': etiquetas_pos,
            'longitudes_frases': longitudes_frases,
            'total_frases': len(frases)
        }

    def calcular_metricas_globales(self, resultados_archivos):
        """Calcula métricas globales a partir de los resultados individuales"""
        total_caracteres_eliminados = sum(r['caracteres_eliminados'] for r in resultados_archivos)
        total_frases = sum(r['total_frases'] for r in resultados_archivos)
        
        # Calcular longitud promedio de todas las frases
        todas_longitudes = []
        for resultado in resultados_archivos:
            todas_longitudes.extend(resultado['longitudes_frases'])
        
        longitud_promedio = sum(todas_longitudes) / len(todas_longitudes) if todas_longitudes else 0
        
        return {
            'total_caracteres_eliminados': total_caracteres_eliminados,
            'total_frases': total_frases,
            'longitud_promedio_frases': round(longitud_promedio, 2)
        } 