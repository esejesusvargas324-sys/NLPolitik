import os
import pandas as pd
from urllib.parse import urlparse
from datetime import datetime

class CreadorCSVNoPoliticos:
    def __init__(self, carpeta_destino):
        self.carpeta_destino = carpeta_destino
        self.datos_articulos = []
        
    def procesar_urls(self, lista_urls, nombre_archivo="articulos_no_politicos.csv"):
        """Procesa una lista de URLs y crea un CSV con los artículos extraídos"""
        
        print("📝 Iniciando extracción de artículos no políticos...")
        print(f"🔗 URLs a procesar: {len(lista_urls)}")
        
        for i, url in enumerate(lista_urls, 1):
            try:
                print(f"\n📄 Procesando URL {i}/{len(lista_urls)}: {url[:80]}...")
                
                # Extraer datos del artículo
                datos_articulo = self.procesar_como_dict(url)
                
                if "error" not in datos_articulo:
                    self.datos_articulos.append(datos_articulo)
                    print(f"   ✅ Extraído: {datos_articulo['titulo'][:50]}...")
                else:
                    print(f"   ❌ Error: {datos_articulo['error']}")
                    
            except Exception as e:
                print(f"   ❌ Error procesando URL: {str(e)}")
        
        # Crear DataFrame y guardar CSV
        if self.datos_articulos:
            self.guardar_csv(nombre_archivo)
        else:
            print("\n⚠️  No se pudieron extraer artículos de las URLs proporcionadas")
    
    def procesar_como_dict(self, url):
        """Método idéntico al tuyo para extraer datos del artículo"""
        try:
            from newspaper import Article
            
            articulo = Article(url, language='es')  
            articulo.download()
            articulo.parse()

            # Extraer autores
            autores = articulo.authors
            if isinstance(autores, list):
                autor = autores[0] if autores else "Autor no disponible"
            else:
                autor = str(autores) if autores else "Autor no disponible"

            titulo = str(articulo.title) if articulo.title else "Sin título"
            fuente = urlparse(url).netloc.split('www.')[-1]

            # Manejar fecha de publicación
            if articulo.publish_date:
                if isinstance(articulo.publish_date, datetime):
                    fecha_publicacion = articulo.publish_date
                elif isinstance(articulo.publish_date, list):
                    fecha_publicacion = articulo.publish_date[0] if articulo.publish_date else None
                else:
                    try:
                        fecha_publicacion = datetime.strptime(str(articulo.publish_date), '%Y-%m-%d %H:%M:%S')
                    except Exception:
                        fecha_publicacion = None
            else:
                fecha_publicacion = None

            contenido = str(articulo.text).strip() if articulo.text else "Contenido no disponible"

            return {
                "titulo": titulo,
                "autor": str(autor) if autor else "",
                "fuente": fuente,
                "fecha_publicacion": fecha_publicacion.date().isoformat() if fecha_publicacion else None,
                "link": url,
                "text": contenido  # Columna 'text' para compatibilidad con tu pipeline
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def guardar_csv(self, nombre_archivo):
        """Guarda los artículos extraídos en un CSV"""
        # Asegurar que la carpeta existe
        os.makedirs(self.carpeta_destino, exist_ok=True)
        
        ruta_completa = os.path.join(self.carpeta_destino, nombre_archivo)
        
        # Crear DataFrame
        df = pd.DataFrame(self.datos_articulos)
        
        # Guardar CSV
        df.to_csv(ruta_completa, index=False, encoding='utf-8')
        
        print(f"\n✅ CSV creado exitosamente:")
        print(f"📁 Ubicación: {ruta_completa}")
        print(f"📊 Artículos guardados: {len(self.datos_articulos)}")
        
        # Mostrar estadísticas
        print(f"\n📈 ESTADÍSTICAS:")
        print(f"   • Fuentes únicas: {df['fuente'].nunique()}")
        print(f"   • Artículos con autor: {df['autor'].notna().sum()}")
        print(f"   • Artículos con fecha: {df['fecha_publicacion'].notna().sum()}")
        print(f"   • Longitud promedio del texto: {df['text'].str.len().mean():.0f} caracteres")
        
        # Mostrar distribución por fuente
        print(f"\n📰 DISTRIBUCIÓN POR FUENTE:")
        for fuente, cantidad in df['fuente'].value_counts().items():
            print(f"   • {fuente}: {cantidad} artículos")

def main():
    # Configuración
    carpeta_destino = r"D:\UniversidadUACM\Tesis\05_Redacción_Tesis\04_Desarrollo_Teórico_Metodologico\CSV_CORPUS\NoPoliticos"
    
    # 📋 LISTA DE URLs NO POLÍTICAS - URLs VÁLIDAS
    lista_urls = [
        # Espectáculos - TVNotas
        "https://www.tvnotas.com.mx/espectaculos-mexico/manola-diez-explota-en-la-granja-vip-y-se-quita-la-ropa-frente-a-las-camaras-censuran-la-transmision",
        "https://www.tvnotas.com.mx/espectaculos-mexico/actor-de-amores-perros-revela-que-su-hermana-murio-a-los-5-anos-tras-caer-de-un-quinto-piso",
        "https://www.tvnotas.com.mx/espectaculos-internacional/quien-es-fatima-bosch-modelo-que-confronto-a-nawat-itsaragrisil-director-de-miss-universo-tailandia",
        "https://www.tvnotas.com.mx/espectaculos-mexico/se-incendia-propiedad-de-julian-figueroa-hijo-de-maribel-guardia-tras-pelea-por-herencia-con-imelda-tunon",
        "https://www.tvnotas.com.mx/espectaculos-mexico/a-papa-de-exconductor-de-venga-la-alegria-le-amputaron-la-pierna-tras-fatal-accidente",
        "https://www.tvnotas.com.mx/espectaculos-mexico/hijo-de-manola-diez-rompe-el-silencio-y-la-defiende-de-los-ataques-en-la-granja-vip",
        "https://www.tvnotas.com.mx/espectaculos-mexico/andrea-escalona-revela-el-momento-mas-fuerte-del-aniversario-luctuoso-de-su-mama-magda-rodriguez",
        "https://www.tvnotas.com.mx/espectaculos-mexico/aldo-de-nigris-gano-la-casa-de-los-famosos-mexico-pero-no-ha-cobrado-ni-un-peso-del-premio-millonario",
        "https://www.tvnotas.com.mx/espectaculos-mexico/aldo-de-nigris-rompe-el-silencio-sobre-su-shippeo-con-stephanie-ayala-hay-romance-en-puerta-o-no",
        "https://www.tvnotas.com.mx/espectaculos-mexico/galilea-montijo-confiesa-por-que-diria-no-a-la-casa-de-los-famosos-mexico-por-culpa-del-hate#google_vignette",
        
        "https://www.tvnotas.com.mx/espectaculos-mexico/jose-madero-se-retira-tras-infidelidad-con-esposa-de-un-excompanero-de-pxndx-estoy-en-un-momento-oscuro",
        "https://www.tvnotas.com.mx/espectaculos-internacional/lupita-jones-defiende-a-fatima-bosch-tras-ser-insultada-en-miss-universo-no-somos-objetos-de-exhibicion",
        "https://www.tvnotas.com.mx/espectaculos-mexico/esmeralda-pimentel-y-osvaldo-benavides-oficializan-su-relacion-nuevamente-la-tercera-es-la-vencida-fotos",
        "https://www.tvnotas.com.mx/espectaculos-mexico/muere-la-iconica-voz-de-sonido-la-changa-fans-lo-despiden-con-dolor-y-nostalgia-de-que-murio",
        "https://www.tvnotas.com.mx/espectaculos-internacional/arrestan-a-famosa-exconductora-de-television-por-el-asesinato-de-su-madre",
        "https://www.tvnotas.com.mx/espectaculos-mexico/alejandra-guzman-reaparece-y-muestra-radiografias-de-su-columna-tras-cirugia-se-veian-hasta-los-tornillos",
        "https://www.tvnotas.com.mx/espectaculos-mexico/cazzu-vivia-como-reina-revelan-imagenes-del-lujoso-departamento-que-tuvo-que-dejar-por-christian-nodal",
        "https://www.tvnotas.com.mx/espectaculos-mexico/barbara-islas-es-encarada-por-reportero-que-amenaza-con-exhibir-su-pasado-le-tiro-el-celular-en-vivo-video",
        "https://www.tvnotas.com.mx/espectaculos-mexico/vanessa-guzman-rompe-el-silencio-deja-el-fisicoculturismo-y-regresa-a-las-telenovelas-esto-respondio",
        "https://www.tvnotas.com.mx/espectaculos-mexico/daniel-sosa-confronta-a-ricardo-ofarrill-despues-de-que-este-lo-acusara-de-haberlo-amenazado-de-muerte",

        # Deportes - El Economista
        "https://www.eleconomista.com.mx/deportes/charlyn-corral-crece-legado-pentacampeona-goleo-20251104-784946.html",
        "https://www.eleconomista.com.mx/deportes/mexico-reactiva-ilusion-mundial-sub-20251103-784870.html",
        "https://www.eleconomista.com.mx/deportes/yamamoto-mvp-serie-mundial-hablar-ingles-20251102-784682.html",
        "https://www.eleconomista.com.mx/deportes/final-2025-afianza-progresion-360-lnbp-20251103-784890.html",
        "https://www.eleconomista.com.mx/deportes/golf-mexico-representa-inversion-riesgosa-wwt-20251104-785079.html",
        "https://www.eleconomista.com.mx/deportes/sabalenka-muestra-maestria-wta-finals-riyadh-20251104-785077.html",
        "https://www.eleconomista.com.mx/deportes/angeles-celebra-dodgers-emblematico-bicampeon-serie-mundial-20251103-784839.html",
        "https://www.eleconomista.com.mx/deportes/sinner-corona-masters-paris-recupera-numero-mundial-20251102-784632.html",
        "https://www.eleconomista.com.mx/deportes/patricio-ward-rol-grande-indycar-series-20251030-784241.html",
        "https://www.eleconomista.com.mx/deportes/boletos-caros-mexico-gp-aumentan-35-rumbo-20251028-783994.html",

        "https://www.eleconomista.com.mx/deportes/jefe-red-bull-promete-poner-tonterias-recibir-multa-gp-austin-20251024-783433.html",
        "https://www.eleconomista.com.mx/deportes/dia-nacional-patricio-ward-sitio-13-practica-mexico-gp-20251024-783443.html",
        "https://www.eleconomista.com.mx/deportes/messi-recibe-primera-bota-oro-mls-arranque-playoffs-20251024-783444.html",
        "https://www.eleconomista.com.mx/deportes/comisionado-nba-dice-profundamente-perturbado-escandalo-apuestas-20251024-783447.html",
        "https://www.eleconomista.com.mx/deportes/max-verstappen-advierte-velocidad-campeonato-fp2-mexico-gp-20251024-783450.html",
        "https://www.eleconomista.com.mx/deportes/lando-norris-emplea-fondo-domina-tercera-practica-gp-mexico-20251025-783483.html",
        "https://www.eleconomista.com.mx/deportes/alejandro-kirk-primer-pelotero-mexicano-conectar-cuadrangular-serie-mundial-20251025-783484.html",
        "https://www.eleconomista.com.mx/deportes/lando-norris-le-regresa-magia-mclaren-obtiene-pole-position-20251025-783501.html",
        "https://www.eleconomista.com.mx/deportes/fallece-manuel-puente-ex-director-tecnico-seleccion-mexicana-20251025-783504.html",
        "https://www.eleconomista.com.mx/deportes/tigres-vence-tijuana-goles-gignac-correa-clasifica-cuartos-final-apertura-20251026-783513.html",


        # Cultura - El Universal
        "https://www.eluniversal.com.mx/cultura/no-podemos-abjurar-de-la-hispanidad-a-pesar-de-la-conquista-gonzalo-celorio/",
        "https://www.eluniversal.com.mx/cultura/cuatro-libros-para-conocer-la-obra-de-gonzalo-celorio/",
        "https://www.eluniversal.com.mx/cultura/el-escritor-mexicano-gonzalo-celorio-premiado-con-el-premio-cervantes-22025/",
        "https://www.eluniversal.com.mx/cultura/lo-no-racional-y-su-fuerza-en-dos-libros/",
        "https://www.eluniversal.com.mx/cultura/gonzalo-celorio-galardonado-con-el-premio-cervantes-2025-llama-a-quitar-la-pausa-entre-mexico-y-espana/",
        "https://www.eluniversal.com.mx/cultura/mexico-y-jamaica-al-rescate-de-patrimonio-subacuatico/",
        "https://www.eluniversal.com.mx/cultura/confabulario/no-existe-la-calavera-garbancera-ni-la-catrina/",
        "https://www.eluniversal.com.mx/cultura/confabulario/el-arqueologo/",
        "https://www.eluniversal.com.mx/cultura/confabulario/modas-mortuorias-que-facturan/",
        "https://www.eluniversal.com.mx/cultura/mexico-con-siete-galardonados-es-el-pais-latinoamericano-con-mas-premios-cervantes/",
        
        "https://www.eluniversal.com.mx/cultura/no-te-pierdas-la-megaofrenda-de-la-unam-hoy-2-de-noviembre/",
        "https://www.eluniversal.com.mx/cultura/una-ofrenda-a-quienes-la-cultura-perdio-este-ano/",
        "https://www.eluniversal.com.mx/espectaculos/halloween-y-la-cancelacion-del-concierto-de-morrisey-en-los-memes-de-la-semana/",
        "https://www.eluniversal.com.mx/cultura/oleada-de-violencia-por-cierre-de-fronteras/",
        "https://www.eluniversal.com.mx/cultura/sadopitna-instalacion-sonora-que-profundiza-en-el-mestizaje/",
        "https://www.eluniversal.com.mx/cultura/mexico-y-jamaica-al-rescate-de-patrimonio-subacuatico/",
        "https://www.eluniversal.com.mx/cultura/lanza-almadia-premio-de-novela-con-la-sociedad-ventosa-arrufat-sustituye-al-premio-con-fundacion-poniatowska/",
        "https://www.eluniversal.com.mx/cultura/gonzalo-celorio-galardonado-con-el-premio-cervantes-2025-llama-a-quitar-la-pausa-entre-mexico-y-espana/",
        "https://www.eluniversal.com.mx/cultura/fotos-proyecciones-de-lo-que-podria-ser-el-parque-del-muralismo-mexicano-en-el-antiguo-centro-scop/",


        
        # Viajes - Milenio
        "https://www.milenio.com/estilo/viajes/ava-resort-cancun-lujo-incluido-frente-caribe?cx_testId=121&cx_testVariant=cx_undefined&cx_artPos=4&cx_experienceId=EXUETLOL4CFX&cx_experienceActionId=showRecommendationsKCO50B9ILSZX167#cxrecs_s",
        "https://www.milenio.com/estilo/viajes/conoce-oaxaca-corazon-de-mexico-destinos-turisticos-2025",
        "https://www.milenio.com/estilo/viajes/pasaporte-cuales-son-los-10-pasaportes-mas-poderosos",
        "https://www.milenio.com/estilo/viajes/oaxaca-preserva-con-orgullo-comunidades-y-lenguas-autoctonas",
        "https://www.milenio.com/estilo/viajes/metro-estocolmo-galeria-arte-larga-mundo-fotos",
        "https://www.milenio.com/estilo/viajes/escapadas-cdmx-brunch-cascadas-cata-mezcal-imperdibles",
        "https://www.milenio.com/autos/potencia-y-lujo-sin-precedentes-chirey-presenta-modelos?cx_testId=119&cx_testVariant=cx_1&cx_artPos=4&cx_experienceId=EXUETLOL4CFX&cx_experienceActionId=showRecommendationsB0FIPS0E60FX106#cxrecs_s",
        "https://www.milenio.com/autos/porsche-sorprende-en-el-iaa-munchen-con-sistema-inductivo-de-energia?cx_testId=119&cx_testVariant=cx_undefined&cx_artPos=5&cx_experienceId=EXUETLOL4CFX&cx_experienceActionId=showRecommendationsB0FIPS0E60FX106#cxrecs_s",
        "https://www.milenio.com/autos/lujo-comodidad-huellitas-jaecoo-5-mascotas",
        "https://www.milenio.com/ciencia-y-salud/mitos-y-realidades-sobre-los-autos-electricos-segun-experto",

        "https://www.milenio.com/ciencia-y-salud/luna-de-castor-rituales-para-atraer-la-buena-suerte",
        "https://www.milenio.com/estilo/gastronomia/blanca-delia-villagomez-cocinera-tradicional-michoacana",
        "https://www.milenio.com/estilo/consigue-bere-flores-la-fusion-entre-moda-y-arte",
        "https://www.milenio.com/estilo/consigue-bere-flores-la-fusion-entre-moda-y-arte",
        "https://www.milenio.com/estilo/viajes/tequila-cocula-ajijic-pueblos-magicos-encanto-jalisco",
        "https://www.milenio.com/estilo/space-center-houston-historia-cohetes-experiencia-espacial-unica",
        "https://www.milenio.com/estilo/muere-marina-yee-disenadora-belga-seis-de-amberes",
        "https://www.milenio.com/estilo/5-experiencias-culturales-inmersivas-noviembre-cdmx",

        # Noticias generales - Reforma
        "https://www.reforma.com/mueren-4-personas-tras-un-choque-en-la-mexico-cuernavaca/ar3100619?grrecs=1&widget=articulo-trending-reforma&reftype=nopageview&ckrecommendationid=RID-41-44cc-88b0-dc91292e4975-CID-8c7bc9",
        "https://www.reforma.com/impiden-retorno-a-clases-en-facultad-de-quimica/ar3100859?grrecs=1&widget=articulo-trending-reforma&reftype=nopageview&ckrecommendationid=RID-41-44cc-88b0-dc91292e4975-CID-8c7bc9",
        "https://www.reforma.com/buscan-prision-domiciliaria-para-carlota/ar3101075?grrecs=1&widget=articulo-trending-reforma&reftype=nopageview&ckrecommendationid=RID-24-4a4b-9b2c-c9f4dd05d578-CID-8c7bc9",
        "https://www.reforma.com/incautan-324-mil-litros-de-huachicol-en-jalisco/ar3101315?grrecs=1&widget=articulo-trending-reforma&reftype=nopageview&ckrecommendationid=RID-24-4a4b-9b2c-c9f4dd05d578-CID-8c7bc9",
        
        # Gastronomía - El País
        "https://elpais.com/gastronomia/2025-11-04/de-las-vaquerias-a-las-bacterias-se-puede-hacer-un-queso-sin-leche.html",
        "https://elpais.com/gastronomia/2025-11-05/mostos-las-casas-de-comida-jerezanas-que-abren-en-otono-para-servir-vino-joven-y-cocina-tradicional.html",
        "https://elpais.com/gastronomia/2025-11-03/de-mendoza-a-la-patagonia-con-parada-en-madrid-la-revolucion-del-vino-argentino-llega-a-espana.html",
        "https://elpais.com/gastronomia/el-comidista/2025-11-03/pontelo-facil-en-noviembre-recetas-con-huevos-para-cualquier-hora-del-dia.html",
        "https://elpais.com/gastronomia/2025-10-30/la-despensa-mas-rica-se-alimenta-en-navarra.html",
        "https://elpais.com/gastronomia/el-comidista/2025-11-02/menu-semanal-de-el-comidista-3-a-9-de-noviembre.html",
        "https://www.eleconomista.com.mx/bistronomie/corona-capital-2025-asi-sera-burgerlandia-espacio-burgerman-dedicado-hamburguesas-20251105-785008.html",

        # Cine - Excelcior
        "https://www.excelsior.com.mx/funcion/y-si-tu-miedo-en-redes-se-volviera-real-no-me-sigas-mezcla-acoso-digital-y-terror/1749664",
        "https://www.excelsior.com.mx/funcion/nuevas-peliculas-navidenas-2025-los-estrenos-de-netflix-que-no-te-puedes-perder/1749482",
        "https://www.excelsior.com.mx/funcion/guillermo-del-toro-presenta-frankenstein-en-mexico-emocion-ingenio-y-humor-en-el-anfiteatro",
        "https://www.excelsior.com.mx/funcion/estrenos-de-sala-de-arte-cinepolis-en-noviembre-2025/1748884",
        "https://www.excelsior.com.mx/funcion/kirsten-dunst-del-beso-con-brad-pitt-a-su-reencuentro-con-la-polemica-en-roofman/1748667",
        "https://www.excelsior.com.mx/funcion/macario-donde-se-filmo-esta-pelicula-del-cine-mexicano/1748063",
        "https://www.excelsior.com.mx/funcion/las-mejores-peliculas-y-series-de-jacob-elordi-de-euphoria-a-frankenstein/1748281",
        "https://www.excelsior.com.mx/funcion/dulce-muerte-el-documental-que-transforma-el-miedo-a-morir-en-reflexion/1748241",
        "https://www.excelsior.com.mx/funcion/madeleine-mcgraw-en-la-segunda-entrega-de-black-phone/1747990",
        "https://www.excelsior.com.mx/funcion/cronos-de-guillermo-del-toro-se-proyectara-gratis-en-el-zocalo-asi-sera-la-inauguracion-de",

        # Jornada
        "https://www.jornada.com.mx/noticia/2025/11/05/ciencia-y-tecnologia/documentan-ataque-de-orcas-a-crias-de-tiburon-blanco-por-primera-vez",
        "https://www.jornada.com.mx/noticia/2025/11/04/ciencia-y-tecnologia/adaptan-asilo-para-la-vejez-de-pinguinos",
        "https://www.jornada.com.mx/noticia/2025/10/30/ciencia-y-tecnologia/drones-inspirados-en-murcielagos-podrian-revolucionar-misiones-de-rescate",
        "https://www.jornada.com.mx/noticia/2025/10/28/ciencia-y-tecnologia/youtube-se-asocia-con-adobe-premiere-incorpora-sus-herramientas-para-creacion-de-contenido",
        "https://www.jornada.com.mx/noticia/2025/10/23/ciencia-y-tecnologia/turismo-medico-trans",
        "https://www.jornada.com.mx/noticia/2025/10/08/ciencia-y-tecnologia/nuevo-estudio-revela-la-tecnica-que-usaron-los-rapa-nui-para-mover-las-estatuas-moai",
        "https://www.jornada.com.mx/noticia/2025/09/30/ciencia-y-tecnologia/nueva-herramienta-de-ia-ayuda-a-identificar-lesiones-en-ninos-con-epilepsia",
        "https://www.jornada.com.mx/noticia/2025/09/30/ciencia-y-tecnologia/la-deforestacion-del-amazonia-seca-los-rios-voladores-que-riegan-sudamerica",
        "https://www.jornada.com.mx/noticia/2025/09/18/ciencia-y-tecnologia/cientificos-dan-paso-clave-para-la-recuperacion-del-extinto-dodo-con-celulas-de-pariente-vivo",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/los-chimpances-toman-el-equivalente-a-medio-litro-de-cerveza-al-dia-segun-un-estudio",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/uno-de-los-asteroides-mas-grandes-del-ano-pasara-cerca-de-la-tierra",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/el-sol-se-despierta-advierte-la-nasa-ante-aumento-de-actividad",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/hallan-en-marte-los-posibles-restos-de-su-antiguo-embrion-planetario",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/maquina-de-particulas-fantasma-de-china-podria-resolver-los-misterios-de-la-ciencia",
        "https://www.jornada.com.mx/noticia/2025/09/17/ciencia-y-tecnologia/descubren-un-coral-chewbacca-en-las-profundidades-del-pacifico",
        "https://www.jornada.com.mx/noticia/2025/09/15/ciencia-y-tecnologia/algas-bajo-el-hielo-artico-baten-record-de-movimiento-con-frio",
        "https://www.jornada.com.mx/noticia/2025/09/05/ciencia-y-tecnologia/inauguran-en-alemania-un-superordenador-para-remontar-en-la-carrera-por-la-ia",
        "https://www.jornada.com.mx/noticia/2025/09/01/ciencia-y-tecnologia/un-telescopio-rectangular-podria-encontrar-mas-rapido-un-gemelo-de-la-tierra",
        "https://www.jornada.com.mx/noticia/2025/08/29/ciencia-y-tecnologia/polvo-interestelar-es-esencial-en-el-origen-de-estrellas-planetas-y-vida",
        "https://www.jornada.com.mx/noticia/2025/08/26/ciencia-y-tecnologia/investigadores-desarrollan-con-ia-un-metodo-para-predecir-incendios-forestales",
    ]
    
    # Verificar que hay URLs para procesar
    if not lista_urls:
        print("⚠️  No hay URLs para procesar.")
        return
    
    # Crear procesador y ejecutar
    procesador = CreadorCSVNoPoliticos(carpeta_destino)
    procesador.procesar_urls(lista_urls)

if __name__ == "__main__":
    main()