import os
import re
from newspaper import Article
from urllib.parse import urlparse

# Ruta de destino
RUTA_DESTINO = r"D:\UniversidadUACM\Tesis\05_Redacción_Tesis\04_Desarrollo_Teórico_Metodologico\CSV_CORPUS\CorpusPrueba"


# Lista de artículos con su ideología
'''

    # Alejandro Páez Varela - Izquierda
    {"url": "https://www.sinembargo.mx/4650726/esto-para-los-mas-jovenes/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4593262/4t-2-0/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4718333/como-responderle-a-salinas-pliego/", "ideologia": "Izquierda"}, 
    {"url": "https://www.sinembargo.mx/4715281/problemas-en-la-derecha/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4683991/los-miserables-3/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4459947/ni-perdon-ni-olvido-2/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4318815/frentes-de-guerra/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4192530/el-dia-despues/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4169672/mcprian-o-el-salto-de-las-ranas/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4128103/en-busca-de-amlo/", "ideologia": "Izquierda"} 

     # John M. Ackerman - Izquierda
    {"url": "https://johnackerman.mx/medios-contra-la-4t/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/por-un-populismo-de-izquierda/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/nostalgia-ciudadana/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/oposicion-desgastada/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/biden-insulta-a-mexico/", "ideologia": "Izquierda"}, 
    {"url": "https://johnackerman.mx/dos-tipos-unidad/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/la-apuesta-de-amlo-por-una-verdadera-austeridad/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/4t-esperanza-mundial/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/los-abusos-de-las-corporaciones-mediaticas/", "ideologia": "Izquierda"},
    {"url": "https://johnackerman.mx/hacia-la-desmilitarizacion/", "ideologia": "Izquierda"}

     # Pedro Miguel - Izquierda
    {"url": "https://www.jornada.com.mx/noticia/2025/02/14/opinion/del-pequeno-bukele-3458", "ideologia": "Izquierda"}
    {"url": "https://www.jornada.com.mx/noticia/2025/06/06/opinion/dos-visiones", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2025/12/05/opinion/proyeccion-insultos-y-vacios", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2020/09/11/politica/y-donde-esta-morena-pedro-miguel-2855", "ideologia": "Izquierda"},
    {"url": "https://www.jornada.com.mx/noticia/2025/04/11/opinion/extrapolaciones-dolosas", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2023/10/27/opinion/ecuanimidad-y-congruencia-9185", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2024/01/12/opinion/el-error-de-la-guerra-7219", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2025/12/19/opinion/soledad", "ideologia": "Izquierda"},
    {"url": "https://www.jornada.com.mx/noticia/2025/03/21/opinion/el-poder-y-el-gobierno", "ideologia": "Izquierda"}, 
    {"url": "https://www.jornada.com.mx/noticia/2024/02/16/opinion/fuerza-hegemonica-8814", "ideologia": "Izquierda"} 
    
    # Viri Ríos - Izquierda
    {"url": "https://elpais.com/mexico/opinion/2023-04-12/la-reforma-mas-ambiciosa-de-lopez-obrador.html", "ideologia": "Izquierda"}, 
     {"url": "https://elpais.com/mexico/opinion/2025-02-13/carlos-slim-billonario-hecho-en-mexico.html", "ideologia": "Izquierda"},
    {"url": "https://elpais.com/mexico/2023-01-30/de-un-lado-del-otro-asi-se-vive-la-desigualdad-en-mexico.html", "ideologia": "Izquierda"}, 
    {"url": "https://elpais.com/elpais/2019/12/02/opinion/1575301654_516395.html", "ideologia": "Izquierda"}, 
    {"url": "https://elpais.com/mexico/opinion/2024-11-13/como-el-pan-se-pudrio.html", "ideologia": "Izquierda"},
    {"url": "https://elpais.com/mexico/opinion/2022-12-28/informales-el-enemigo-incorrecto-de-la-economia-mexicana.html", "ideologia": "Izquierda"},
    {"url": "https://elpais.com/mexico/opinion/2022-05-08/el-rico-no-eres-tu.html", "ideologia": "Izquierda"}, 
    {"url": "https://elpais.com/mexico/opinion/2022-04-28/los-mitos-sobre-el-cobro-de-impuestos-con-la-4t.html", "ideologia": "Izquierda"}, 
    {"url": "https://elpais.com/mexico/opinion/2021-12-03/el-conformismo-del-posneoliberalismo-mexicano.html", "ideologia": "Izquierda"}, 
    {"url": "https://elpais.com/mexico/opinion/2021-08-19/los-trabajadores-dan-un-golpe-en-seco-a-la-ctm.html", "ideologia": "Izquierda"}


    # Álvaro Delgado Gómez - Izquierda
    {"url": "https://www.sinembargo.mx/3007409/el-negociazo-de-las-encuestas/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4475094/cayetana-y-la-guerra-de-salinas-pliego/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4670997/salinas-pliego-y-erasmo-catarino/", "ideologia": "Izquierda"}
    {"url": "https://www.sinembargo.mx/4674570/sheinbaum-alista-cambios-a-tribunal-de-millonarios-espanta-la-corrupcion-magistrado/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4662278/trump-un-criminal-contra-mexico/", "ideologia": "Izquierda"}, 
    {"url": "https://www.sinembargo.mx/4729607/salinas-pliego-promueve-la-ultraderecha-a-el-mismo-lo-convencieron-en-su-casa/", "ideologia": "Izquierda"}, 
    {"url": "https://www.sinembargo.mx/4708625/los-ultimos-gobiernos-del-pan-dan-negocios-millonarios-a-los-ultimos-calderonistas/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4739304/amparo-casar-persecucion-o-fraude/", "ideologia": "Izquierda"}
    {"url": "https://www.sinembargo.mx/4736118/pena-nieto-el-corrupto-tambien-regresa/", "ideologia": "Izquierda"},
    {"url": "https://www.sinembargo.mx/4627440/los-ambiciosos-vulgares/", "ideologia": "Izquierda"}  
]


    Derecha si

     # Carlos Loret de Mola
    {"url": "https://www.informador.mx/ideas/carlos-loret-de-mola-la-economia-vamuy-bien-20251202-0171.html", "ideologia": "Derecha"},
    {"url": "https://www.informador.mx/ideas/Carlos-Loret-de-Mola-Los-desaparecidos-dinamitan-la-narrativa-de-Gobierno-20250318-0032.html", "ideologia": "Derecha"},
    {"url": "https://www.informador.mx/ideas/Carlos-Loret-de-Mola-Iberdrola-o-el-AMLOnitrogenados-20230411-0030.html", "ideologia": "Derecha"},
    {"url": "https://www.informador.mx/ideas/Carlos-Loret-de-Mola-El-Castor-en-Hacienda-20250309-0109.html", "ideologia": "Derecha"}, 
    {"url": "https://www.eluniversal.com.mx/opinion/carlos-loret-de-mola/los-novios-del-bienestar/", "ideologia": "Derecha"},
    {"url": "https://www.eluniversal.com.mx/opinion/carlos-loret-de-mola/la-presidenta-del-dolar-a-20/", "ideologia": "Derecha"},
    {"url": "https://www.eluniversal.com.mx/opinion/carlos-loret-de-mola/encuentre-las-7-diferencias/", "ideologia": "Derecha"},
    {"url": "https://www.eluniversal.com.mx/opinion/carlos-loret-de-mola/para-metralla-de-balas-metralla-de-numeros/", "ideologia": "Derecha"}
    {"url": "https://www.washingtonpost.com/es/post-opinion/2022/12/05/amlo-informe-quinto-ano-elecciones-2024-marcha/", "ideologia": "Derecha"},
    {"url": "https://www.washingtonpost.com/es/post-opinion/2022/08/15/ciudad-juarez-violencia-terrorismo-mexicles-amlo/", "ideologia": "Derecha"}


     # Joaquín López Dóriga - Derecha
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/11/07/la-corte-una-esperanza/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/10/31/la-fuerza-sera-suya-no-del-pasado/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/10/30/volando-bajo/", "ideologia": "Derecha"}, 
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/10/21/la-presidenta-dando-la-cara/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/09/17/las-formas-otra-diferencia/", "ideologia": "Derecha"}, 
    {"url": "https://www.elimparcial.com/mxl/columnas/2025/04/09/rienda-a-desbocados/", "ideologia": "Derecha"}, 
    {"url": "https://lopezdoriga.com/opinion/inseguridad-deuda-y-herencia-de-amlo/", "ideologia": "Derecha"},
    {"url": "https://lopezdoriga.com/opinion/lopez-doriga-a-que-viene-presidente-el-golpe-de-estado/", "ideologia": "Derecha"},
    {"url": "https://lopezdoriga.com/opinion/la-salud-de-lopez-obrador/", "ideologia": "Derecha"},
    {"url": "https://lopezdoriga.com/opinion/las-cabezas-y-los-otros-datos-5-1/", "ideologia": "Derecha"}

    
    # Jorge Castañeda - Derecha
    {"url": "https://www.eluniversal.com.mx/opinion/jorge-castaneda/sheinbaum-y-amlo-un-solo-corazon/", "ideologia": "Derecha"}, 
    {"url": "https://www.eluniversal.com.mx/opinion/jorge-castaneda/auge-de-productos-chinos-complicidad-o-irresponsabilidad/", "ideologia": "Derecha"}, 
    {"url": "https://www.eluniversal.com.mx/opinion/jorge-castaneda/teuchitlan-y-la-orfandad-de-fuentes-de-credibilidad/", "ideologia": "Derecha"},
    {"url": "https://www.eluniversal.com.mx/opinion/jorge-castaneda/el-tema-migratorio-no-parece-prioridad/", "ideologia": "Derecha"},
    {"url": "https://jorgegcastaneda.nexos.com.mx/ya-no-crecemos/", "ideologia": "Derecha"}, 
    {"url": "https://jorgegcastaneda.nexos.com.mx/lopez-obrador-abre-mas-frentes/", "ideologia": "Derecha"},
    {"url": "https://jorgegcastaneda.nexos.com.mx/ya-no-crecemos/", "ideologia": "Derecha"},
    {"url": "https://jorgegcastaneda.nexos.com.mx/el-dilema-de-la-reforma-electoral/", "ideologia": "Derecha"},
    {"url": "https://jorgegcastaneda.nexos.com.mx/el-aislamiento-de-amlo-en-america-latina/", "ideologia": "Derecha"},
    {"url": "https://jorgegcastaneda.nexos.com.mx/el-fiasco-del-avion-presidencial/", "ideologia": "Derecha"}

    # Leo Zuckermann - Derecha
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/seguimiento-al-talon-de-aquiles-de-la-4t/1753652", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/el-gandallismo-de-la-4t/1584494", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/luces-y-sombras-del-paquete-economico-2026/1738824", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/podemos-pensar-en-un-nuevo-modelo-de-desarrollo-economico-para-mexico/1698076", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/amlo-en-rendimientos-decrecientes/1553892", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/el-dolar-a-27-pesos/1573975", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/la-reivindicacion-de-la-tecnica-en-el-gobierno/1659043", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/el-gobierno-tambien-fracaso-en-educacion-durante-la-pandemia/1651034", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/pues-si-podriamos-despilfarrar-otra-oportunidad-economica/1657212", "ideologia": "Derecha"},
    {"url": "https://www.excelsior.com.mx/opinion/leo-zuckermann/desperdiciar-el-primer-ano-de-gobierno/1657980", "ideologia": "Derecha"}

    # Sergio Sarmiento - Derecha
    {"url": "https://www.elimparcial.com/columnas/2025/09/10/impuestos-y-gasto/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2025/06/19/pensiones-y-deuda/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2025/07/07/caen-empleos/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2025/09/25/las-farmaceuticas/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2025/09/17/gasto-en-salud/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2025/07/03/pemex-en-quiebra/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2024/06/14/una-economia-sana/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2024/02/13/obsesion-de-prohibir/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2024/02/12/sin-derecho-al-agua/", "ideologia": "Derecha"},
    {"url": "https://www.elimparcial.com/columnas/2024/02/06/las-20-iniciativas/", "ideologia": "Derecha"}
    
    Cine - No político
    {"url": "https://www.milenio.com/espectaculos/famosos/timothee-chalamet-marty-supreme-mejor-pelicula-enciende-redes-sociales", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/famosos/dwayne-johnson-agradece-a-brendan-fraser-por-su-papel-en-la-momia", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/famosos/matthew-lillard-responde-criticas-quentin-tarantino-peor-actor", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/cine/las-6-curiosidades-detras-de-el-grinch-protagonizada-por-jim-carrey", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/cine/estos-son-los-5-personajes-mas-emblematicos-del-cine-navideno", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/famosos/jodie-foster-cuenta-su-experiencia-con-robert-de-niro-en-taxi-driver", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/cine/james-cameron-revela-por-que-imposible-nueva-pelicula-terminator", "ideologia": "No_politico"},
    {"url": "https://www.excelsior.com.mx/funcion/jafar-panahi-por-el-oscar-a-escondidas/1753230", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/cine/quentin-tarantino-elige-mejores-peliculas-siglo-xxi", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/espectaculos/cine/filma-jalisco-lleva-cine-mexicano-a-los-rincones-del-estado", "ideologia": "No_politico"},

    Deportes - No político
    {"url": "https://www.eleconomista.com.mx/deportes/isackstappen-combinacion-regreso-casa-red-bull-racing-20251209-790333.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/flamengo-mision-13-anos-psg-20251216-791603.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/toluca-vs-tigres-horarios-gran-final-torneo-apertura-2025-liga-mx-20251208-790192.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/aaron-rodgers-guia-steelers-liderato-divisional-20251207-790041.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/jaiba-brava-entra-podio-titulos-liga-expansion-20251207-790036.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/ganadores-perdedores-temporada-formula-1-palpitante-20251207-789983.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/copa-africana-naciones-glamour-aun-incompleto-20251221-792270.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/sergio-ramos-confirma-salida-monterrey-20251207-789969.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/guido-pizarro-certifica-evolucion-inteligente-tigres-20251202-789346.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/deportes/sorteo-mundial-2026-javier-aguirre-director-tecnico-seleccion-pide-mexico-ilusion-20251205-789880.html", "ideologia": "No_politico"},

    Espectaculos - No político
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/julio-haro-vocalista-de-la-arrolladora-banda-el-limon-es-operado", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/quien-es-el-eliminado-de-la-granja-vip-hoy-7-de-diciembre-este-granjero-dice-adios", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/conductores-de-hoy-al-borde-de-las-lagrimas-anuncian-la-muerte-de-querido-actor-maravilloso-ser-humano", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/imelda-garza-festeja-con-todo-su-cumpleanos-29-en-medio-de-pleito-legal-con-maribel-guardia-tregua-temporal", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/fatima-bosch-ganadora-de-miss-universo-2025-vive-momento-incomodo-en-entrevista-se-va-del-foro", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/hijo-de-chabelo-no-descarta-acercamiento-con-su-media-hermana-fue-despreciada-por-su-familia-reconciliacion", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/esposa-del-patron-reacciona-a-la-pelea-del-luchador-y-eleazar-gomez-en-la-granja-vip-pide-su-salida", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/quieres-vivir-la-gran-final-de-la-granja-vip-te-decimos-cuando-y-donde-ver-completamente-en-vivo", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/galilea-montijo-cuenta-la-vez-que-su-hijo-se-peleo-por-defenderla-de-los-dolores-mas-grandes", "ideologia": "No_politico"},
    {"url": "https://www.tvnotas.com.mx/espectaculos-mexico/participante-de-las-estrellas-bailan-en-hoy-ilusiona-a-la-hija-de-joan-sebastian-y-luego-se-echa-para-atras", "ideologia": "No_politico"},

    Gastronomía - No político
    {"url": "https://elpais.com/gastronomia/beber/2025-12-08/gracias-a-una-cerveza-alemana-existen-las-neveras-en-casa-y-otras-verdades-sobre-las-lager-que-venden-en-el-super.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/2025-12-06/las-mejores-fiestas-se-montan-en-la-cocina-asi-son-las-kitchen-sessions-que-unen-el-talento-de-chefs-y-djs.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-11-24/sopa-griega-de-garbanzos-y-limon-en-receta-tradicional-o-rapida.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-12-03/recetas-con-bases-cremosas-una-forma-de-cocinar-platos-buenos-y-bonitos-sin-complicarse.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-11-26/frittatine-di-pasta-las-croquetas-napolitanas-de-macarrones.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-11-03/pontelo-facil-en-noviembre-recetas-con-huevos-para-cualquier-hora-del-dia.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/2025-12-21/ruta-por-el-nuevo-jerez-capital-espanola-de-la-gastronomia-2026.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-11-29/calendarios-de-adviento-comestibles-los-que-valen-la-pena-y-los-que-son-una-mala-idea.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-12-05/alo-comidista-las-judias-pueden-ser-toxicas-si-las-cueces-poco.html", "ideologia": "No_politico"},
    {"url": "https://elpais.com/gastronomia/el-comidista/2025-10-29/albondigas-de-ikea-delicia-barata-o-catastrofe-gastronomica.html", "ideologia": "No_politico"},

    Viajes y estilo de vida - No políticos
    {"url": "https://www.milenio.com/estilo/psiquicos-la-plataforma-que-brinda-conexion-espiritual", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/estilo/viajes/top-3-de-lugares-desconocidos-con-paisajes-nevados-segun-ia", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/estilo/tu-mascota/ofrenda-para-mascotas-por-dia-de-muertos-hora-de-llegada-partida", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/estilo/eduardo-sarabia-presenta-the-drawing-speaks-colaboracion-hermes", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/estilo/gastronomia/chef-lula-martin-campo-comparte-cocina-viernes-culto", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/los-especiales/historia-simorra-linaje-artesanal-moda-consciente-20251102-784616.html", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/los-especiales/ludo-nueva-experiencia-inmersiva-cirque-du-soleil-vidanta-nuevo-vallarta-20251213-791121.html", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/comunidad/caravana-coca-cola-2025-mexico-ruta-nuevos-estados-pasara", "ideologia": "No_politico"},
    {"url": "https://www.eleconomista.com.mx/los-especiales/deslumbrante-nueva-coleccion-navidena-unode50-20251223-792497.html", "ideologia": "No_politico"},
    {"url": "https://www.milenio.com/estilo/encendido-pino-tampico-2025-fecha-horario-actividades", "ideologia": "No_politico"},
    '''
ARTICULOS = [
   #Para cargar automaticamente cada articulo modifica la ruta (RUTA_DESTINO) a una carpeta de su equipo
   # y carge en esta estrcutura los links de la parte superior o lo que desee para obtener dichos articulos en fortmato .txt 
]

def limpiar_nombre_archivo(texto):
    texto_limpio = re.sub(r'[\\/*?:"<>|]', '', texto).strip().replace(' ', '_')
    return texto_limpio[:200]

def procesar_articulo(url, ideologia):
    try:
        articulo = Article(url, language='es')
        articulo.download()
        articulo.parse()

        titulo = articulo.title or "Sin_titulo"
        autor = "Viajes-y-estilo-de-vida"
        contenido = articulo.text.strip() if articulo.text else ""
        año = articulo.publish_date.year

        nombre_archivo = f"{autor}_{titulo}_{año}_{ideologia}"
        nombre_archivo = limpiar_nombre_archivo(nombre_archivo) + ".txt"
        ruta_archivo = os.path.join(RUTA_DESTINO, nombre_archivo)

        with open(ruta_archivo, "w", encoding="utf-8") as f:
            f.write(contenido)

        print(f" Guardado: {ruta_archivo}")

    except Exception as e:
        print(f" Error en {url}: {e}")

def main():
    if not os.path.exists(RUTA_DESTINO):
        os.makedirs(RUTA_DESTINO)

    for item in ARTICULOS:
        procesar_articulo(item["url"], item["ideologia"])

if __name__ == "__main__":
    main()