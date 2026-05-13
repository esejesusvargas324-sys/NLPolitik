import re
import pandas as pd
import spacy
from spacy.matcher import Matcher
import os
import sys
from sklearn.model_selection import train_test_split
from collections import defaultdict

class FrasesEconomiaExtractor:
    def __init__(self):
        try:
            self.spacy_nlp = spacy.load("es_core_news_sm")
            print("Modelo spaCy 'es_core_news_sm' cargado correctamente.")
        except OSError:
            print("Modelo 'es_core_news_sm' no encontrado. Intentando descargarlo...")
            try:
                os.system("python -m spacy download es_core_news_sm")
                self.spacy_nlp = spacy.load("es_core_news_sm")
                print("Modelo spaCy 'es_core_news_sm' descargado y cargado correctamente.")
            except:
                print("Error: No se pudo descargar o cargar el modelo de spaCy.")
                self.spacy_nlp = None
                sys.exit(1)
        
        # Mapeo de códigos CMP económicos (basado en los códigos que mencionaste)
        self.mapeo_codigos_economicos = {
            # IZQUIERDA ECONÓMICA
            "403": "per403",  # Regulación del mercado
            "404": "per404",  # Planificación económica
            "406": "per406",  # Proteccionismo: Positivo
            "412": "per412",  # Economía controlada
            "413": "per413",  # Nacionalización
            
            # DERECHA ECONÓMICA
            "401": "per401",  # Economía de Libre Mercado
            "402": "per402",  # Incentivos: Positivos
            "407": "per407",  # Proteccionismo: Negativo
            "414": "per414",  # Ortodoxia Económica
            
            # ECONOMÍA MIXTA
            "409": "per409",  # Corporativismo/Economía Mixta
            "408": "per408",  # Objetivos económicos
            "405": "per405",  # Crecimiento Económico: Positivo
            "411": "per411",  # Tecnología e Infraestructura: Positivo
        }
        
        # Diccionario que se llenará con las frases extraídas
        self.diccionario_economico = {
            # IZQUIERDA ECONÓMICA
            "per403": [],  # Regulación del mercado
            "per404": [],  # Planificación económica
            "per406": [],  # Proteccionismo: Positivo
            "per412": [],  # Economía controlada
            "per413": [],  # Nacionalización
            
            # DERECHA ECONÓMICA
            "per401": [],  # Economía de Libre Mercado
            "per402": [],  # Incentivos: Positivos
            "per407": [],  # Proteccionismo: Negativo
            "per414": [],  # Ortodoxia Económica
            
            # ECONOMÍA MIXTA
            "per409": [],  # Corporativismo/Economía Mixta
            "per408": [],  # Objetivos económicos
            "per405": [],  # Crecimiento Económico: Positivo
            "per411": [],  # Tecnología e Infraestructura: Positivo
        }

    @staticmethod
    def limpiar_texto(texto):
        if isinstance(texto, bytes):
            texto = texto.decode("utf-8", errors="ignore")
        
        texto = texto.lower()
        # Mantener algunos signos de puntuación que pueden ser importantes para frases
        texto = re.sub(r'[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?]', '', texto)
        texto = re.sub(r'["\'`«»""]', '', texto)
        texto = texto.replace('\n', ' ').replace('\t', ' ')
        texto = re.sub(r'\s+', ' ', texto).strip()
        
        return texto

    def obtener_codigo_economico(self, cmp_code):
        """Convierte el código del CSV al código económico correspondiente"""
        if pd.isna(cmp_code) or cmp_code == "NA" or cmp_code == "H":
            return None
        
        cmp_str = str(cmp_code)
        
        # Buscar si el código contiene alguno de nuestros códigos económicos
        for codigo_csv, codigo_economico in self.mapeo_codigos_economicos.items():
            if codigo_csv in cmp_str:
                return codigo_economico
        
        return None

    def extraer_frases_por_codigo(self, texto, cmp_code):
        """Extrae frases del texto y las asigna al código CMP económico correspondiente"""
        codigo_economico = self.obtener_codigo_economico(cmp_code)
        
        if not codigo_economico or not self.spacy_nlp:
            return []
        
        try:
            doc = self.spacy_nlp(texto)
            frases_encontradas = []
            
            # Patrones para frases económicas
            patterns = [
                # Patrón: Verbo + Determinante (opcional) + Adjetivo (opcional) + Sustantivo
                [{"POS": "VERB"}, {"POS": "DET", "OP": "?"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN"}],
                
                # Patrón: Sustantivo + Preposición + Determinante (opcional) + Adjetivo (opcional) + Sustantivo
                [{"POS": "NOUN"}, {"POS": "ADP"}, {"POS": "DET", "OP": "?"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN"}],
                
                # Patrón: Adjetivo + Sustantivo + Adjetivo (opcional) + Sustantivo (opcional)
                [{"POS": "ADJ"}, {"POS": "NOUN"}, {"POS": "ADJ", "OP": "?"}, {"POS": "NOUN", "OP": "?"}],
                
                # Patrón: Sustantivo + Adjetivo + Sustantivo (opcional)
                [{"POS": "NOUN"}, {"POS": "ADJ"}, {"POS": "NOUN", "OP": "?"}]
            ]
            
            matcher = Matcher(self.spacy_nlp.vocab)
            for i, pattern in enumerate(patterns):
                matcher.add(f"PATRON_{i}", [pattern])
            
            matches = matcher(doc)
            for match_id, start, end in matches:
                span = doc[start:end]
                frase = span.text.lower().strip()
                num_palabras = len(frase.split())
                
                # Filtrar frases relevantes (2-6 palabras)
                if 2 <= num_palabras <= 6 and len(frase) >= 8:
                    frases_encontradas.append(frase)
            
            # Eliminar duplicados
            frases_unicas = list(set(frases_encontradas))
            
            # Filtrar frases demasiado genéricas
            palabras_vacias = {'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'en', 'por', 'para'}
            frases_filtradas = []
            
            for frase in frases_unicas:
                palabras = frase.split()
                palabras_significativas = [p for p in palabras if p not in palabras_vacias]
                
                if (len(palabras_significativas) >= 2 and
                    len(frase) <= 60 and
                    not all(len(p) < 3 for p in palabras_significativas)):
                    frases_filtradas.append(frase)
            
            # Asignar las frases al código económico correspondiente
            if frases_filtradas:
                print(f"  Código {cmp_code} -> {codigo_economico}: {len(frases_filtradas)} frases")
                self.diccionario_economico[codigo_economico].extend(frases_filtradas)
            
            return frases_filtradas
            
        except Exception as e:
            print(f"Error en extracción para código {cmp_code}: {e}")
            return []

    def procesar_archivos_para_diccionario(self, ruta_carpeta, ideologia):
        """Procesa todos los archivos CSV de una carpeta y construye el diccionario"""
        if not os.path.exists(ruta_carpeta):
            print(f"Error: La carpeta {ruta_carpeta} no existe.")
            return
        
        archivos_csv = [f for f in os.listdir(ruta_carpeta) if f.endswith('.csv')]
        
        if not archivos_csv:
            print(f"No se encontraron archivos CSV en {ruta_carpeta}")
            return
        
        print(f"\nProcesando {len(archivos_csv)} archivos de {ideologia}...")
        
        total_frases = 0
        for archivo in archivos_csv:
            ruta_completa = os.path.join(ruta_carpeta, archivo)
            try:
                df = pd.read_csv(ruta_completa)
                
                if 'text' not in df.columns or 'cmp_code' not in df.columns:
                    print(f"El archivo {archivo} no tiene columnas 'text' o 'cmp_code'. Saltando...")
                    continue
                
                print(f"\nProcesando {archivo}...")
                frases_archivo = 0
                
                for idx, fila in df.iterrows():
                    if pd.isna(fila['text']):
                        continue
                    
                    texto_limpio = self.limpiar_texto(str(fila['text']))
                    cmp_code = fila['cmp_code']
                    
                    # Extraer frases y asignar al código CMP
                    frases = self.extraer_frases_por_codigo(texto_limpio, cmp_code)
                    frases_archivo += len(frases)
                
                total_frases += frases_archivo
                print(f"  Frases extraídas en este archivo: {frases_archivo}")
                    
            except Exception as e:
                print(f"Error procesando {archivo}: {e}")
        
        print(f"Total frases extraídas de {ideologia}: {total_frases}")

    def limpiar_diccionario(self):
        """Elimina duplicados y frases vacías del diccionario"""
        for codigo in self.diccionario_economico:
            # Eliminar duplicados
            frases_unicas = list(set(self.diccionario_economico[codigo]))
            # Filtrar frases no vacías
            frases_limpias = [f for f in frases_unicas if f and len(f.strip()) > 0]
            self.diccionario_economico[codigo] = frases_limpias

    def guardar_diccionario(self, output_path):
        """Guarda el diccionario construido en un archivo"""
        # Limpiar el diccionario antes de guardar
        self.limpiar_diccionario()
        
        # Crear carpeta de salida si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("diccionario_economico_extraido = {\n")
            
            # IZQUIERDA ECONÓMICA
            f.write("    # IZQUIERDA ECONÓMICA\n")
            f.write('    "per403": [  # Regulación del mercado\n')
            for frase in self.diccionario_economico["per403"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per404": [  # Planificación económica\n')
            for frase in self.diccionario_economico["per404"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per406": [  # Proteccionismo: Positivo\n')
            for frase in self.diccionario_economico["per406"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per412": [  # Economía controlada\n')
            for frase in self.diccionario_economico["per412"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per413": [  # Nacionalización\n')
            for frase in self.diccionario_economico["per413"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            # DERECHA ECONÓMICA
            f.write("    # DERECHA ECONÓMICA\n")
            f.write('    "per401": [  # Economía de Libre Mercado\n')
            for frase in self.diccionario_economico["per401"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per402": [  # Incentivos: Positivos\n')
            for frase in self.diccionario_economico["per402"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per407": [  # Proteccionismo: Negativo\n')
            for frase in self.diccionario_economico["per407"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per414": [  # Ortodoxia Económica\n')
            for frase in self.diccionario_economico["per414"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            # ECONOMÍA MIXTA
            f.write("    # ECONOMÍA MIXTA\n")
            f.write('    "per409": [  # Corporativismo/Economía Mixta\n')
            for frase in self.diccionario_economico["per409"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per408": [  # Objetivos económicos\n')
            for frase in self.diccionario_economico["per408"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per405": [  # Crecimiento Económico: Positivo\n')
            for frase in self.diccionario_economico["per405"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n\n")
            
            f.write('    "per411": [  # Tecnología e Infraestructura: Positivo\n')
            for frase in self.diccionario_economico["per411"]:
                frase_escapada = frase.replace('"', '\\"')
                f.write(f'        "{frase_escapada}",\n')
            f.write("    ],\n")
            
            f.write("}\n")
        
        print(f"\nDiccionario guardado en: {output_path}")

    def mostrar_estadisticas_diccionario(self):
        """Muestra estadísticas del diccionario construido"""
        print("\n" + "="*60)
        print("ESTADÍSTICAS DEL DICCIONARIO ECONÓMICO CONSTRUIDO")
        print("="*60)
        
        total_frases = 0
        
        print("\nIZQUIERDA ECONÓMICA:")
        print("per403 - Regulación del mercado:", len(self.diccionario_economico["per403"]))
        print("per404 - Planificación económica:", len(self.diccionario_economico["per404"]))
        print("per406 - Proteccionismo: Positivo:", len(self.diccionario_economico["per406"]))
        print("per412 - Economía controlada:", len(self.diccionario_economico["per412"]))
        print("per413 - Nacionalización:", len(self.diccionario_economico["per413"]))
        
        print("\nDERECHA ECONÓMICA:")
        print("per401 - Economía de Libre Mercado:", len(self.diccionario_economico["per401"]))
        print("per402 - Incentivos: Positivos:", len(self.diccionario_economico["per402"]))
        print("per407 - Proteccionismo: Negativo:", len(self.diccionario_economico["per407"]))
        print("per414 - Ortodoxia Económica:", len(self.diccionario_economico["per414"]))
        
        print("\nECONOMÍA MIXTA:")
        print("per409 - Corporativismo/Economía Mixta:", len(self.diccionario_economico["per409"]))
        print("per408 - Objetivos económicos:", len(self.diccionario_economico["per408"]))
        print("per405 - Crecimiento Económico: Positivo:", len(self.diccionario_economico["per405"]))
        print("per411 - Tecnología e Infraestructura: Positivo:", len(self.diccionario_economico["per411"]))
        
        for codigo, frases in self.diccionario_economico.items():
            total_frases += len(frases)
        
        print(f"\nTOTAL DE FRASES ECONÓMICAS EXTRAÍDAS: {total_frases}")

def main():
    # Definir rutas
    base_path = r"D:\UniversidadUACM\Tesis\05_Redacción_Tesis\04_Desarrollo_Teórico_Metodologico\CSV_CORPUS"
    izquierda_path = os.path.join(base_path, "Izquierda")
    derecha_path = os.path.join(base_path, "Derecha")
    output_path = os.path.join(base_path, "diccionario_economico_extraido.py")
    
    # Crear extractor
    extractor = FrasesEconomiaExtractor()
    
    # Procesar archivos de izquierda
    print("=" * 50)
    extractor.procesar_archivos_para_diccionario(izquierda_path, "IZQUIERDA")
    
    # Procesar archivos de derecha
    print("=" * 50)
    extractor.procesar_archivos_para_diccionario(derecha_path, "DERECHA")
    
    # Mostrar estadísticas
    extractor.mostrar_estadisticas_diccionario()
    
    # Guardar diccionario
    extractor.guardar_diccionario(output_path)
    
    print("\n¡Proceso completado!")

if __name__ == "__main__":
    main()