import os
import re
from newspaper import Article
from urllib.parse import urlparse
from datetime import datetime

class ProcesadorArticulo:
    def __init__(self, url):
        #Constructor que inicializa el procesador de artículos con una URL.
        # y se establecen los atributos del artículo (título, autor, fecha, etc.) como None
        self.url = url
        self.titulo = None
        self.autor = None
        self.fecha_publicacion = None
        self.fuente = None
        self.contenido = None
        self.archivo_txt = None

    def limpiar_nombre_archivo(self, texto):
        #Método que limpia un texto para usarlo como nombre de archivo, 
        #eliminando caracteres especiales y reemplazando espacios por guiones bajos, con límite de longitud.
        texto_limpio = re.sub(r'[\\/*?:"<>|]', '', texto).strip().replace(' ', '_')
        return texto_limpio[:60]

    def extraer_datos(self):
        #Descarga y parsea el artículo usando la biblioteca Newspaper4k, 
        #extrayendo metadatos como autor, título, fuente, fecha de publicación y contenido.
        try:
            articulo = Article(self.url, language='es')  
            articulo.download()
            articulo.parse()

            autores = articulo.authors
            if isinstance(autores, list):
                self.autor = autores[0] if autores else "Autor no disponible"
            else:
                self.autor = str(autores) if autores else "Autor no disponible"

            self.titulo = str(articulo.title) if articulo.title else "Sin título"
            self.fuente = urlparse(self.url).netloc.split('www.')[-1]

            if articulo.publish_date:
                if isinstance(articulo.publish_date, datetime):
                    self.fecha_publicacion = articulo.publish_date
                elif isinstance(articulo.publish_date, list):
                    self.fecha_publicacion = articulo.publish_date[0] if articulo.publish_date else None
                else:
                    try:
                        self.fecha_publicacion = datetime.strptime(str(articulo.publish_date), '%Y-%m-%d %H:%M:%S')
                    except Exception:
                        self.fecha_publicacion = None
            else:
                self.fecha_publicacion = None

            self.contenido = str(articulo.text).strip() if articulo.text else "Contenido no disponible"

        except Exception as e:
            raise Exception(f"Error al extraer el artículo: {str(e)}")


    def obtener_datos(self):
        #Se retorna un diccionario estructurado con todos los metadatos del artículo procesado
        return {
            "titulo": self.titulo,
            "autor": str(self.autor) if self.autor else "",
            "fuente": self.fuente,
            "fecha_publicacion": self.fecha_publicacion.date().isoformat() if self.fecha_publicacion else None,
            "link": self.url,
            "contenido": self.contenido
        }

    @staticmethod
    def procesar_como_dict(url):
        #Método estático que proporciona una interfaz simplificada para procesar una URL y 
        #obtener directamente el diccionario de datos del artículo
        try:
            articulo = ProcesadorArticulo(url)
            articulo.extraer_datos()
            return articulo.obtener_datos()
        except Exception as e:
            return {"error": str(e)}

