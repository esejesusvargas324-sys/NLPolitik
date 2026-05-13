from flask import Blueprint, get_flashed_messages, json, request, redirect, session, url_for, flash, render_template, request, jsonify
from app.controllers.controlador_usuario import ControladorUsuario
from app.controllers.controlador_opinion import ControladorOpinion
from app.controllers.controlador_nlp import ControladorNLP
from app.controllers.controlador_agrupamiento import ControladorAgrupamiento
from app.controllers.controlador_historial import ControladorHistorial

from collections import defaultdict
from app.services.procesador_extraer_articulo import ProcesadorArticulo
from app.models.agrupacion import Agrupacion
from app.models.usuario import Usuario
from app.models.textoProcesado import TextoProcesado
from app.models.opinionExterna import OpinionExterna
from app.models.opinionUsuario import OpinionUsuario
import datetime
controlador = ControladorUsuario()


main_bp = Blueprint('main', __name__)

@main_bp.route("/")
def home():
    return render_template("index.html")

@main_bp.route("/archivos")
def archivos():
    return render_template("archivos.html")

@main_bp.route("/agrupamiento")
def agrupamiento():
    return render_template("agrupamiento.html")

@main_bp.route("/historial")
def historial():
    return render_template("historial.html")


@main_bp.route("/terminos")
def terminos():
    return render_template("terminos.html")


@main_bp.route("/incioSesion")
def inicioSesion():
    return render_template("inicioSesion.html")

@main_bp.route("/registroUsuario")
def registroUsuario():
    return render_template("registroUsuario.html")

@main_bp.route("/configurarContrasena")
def configurarContrasena():
    return render_template("configurarContrasena.html")

@main_bp.route("/configurarUsuario")
def configurarUsuario():
    usuario_id = session.get("usuario_id")
    usuario = Usuario.query.get(usuario_id) if usuario_id else None
    return render_template("configurarUsuario.html", usuario=usuario)

@main_bp.route("/recuperarContrasena")
def recuperarContrasena():
    return render_template("recuperarContrasena.html")

@main_bp.route("/terminosUso")
def terminosUso():
    return render_template("terminosUso.html")

@main_bp.route("/politicaPrivacidad")
def politicaPrivacidad():
    return render_template("politicaPrivacidad.html")

#Ruta para el registro usuario
@main_bp.route('/registro', methods=['POST'])
def registrar_usuario():
    nombre = request.form.get('nombre')
    correo = request.form.get('email')
    contrasena = request.form.get('password')
    confirmar = request.form.get('confirm-password')

    errores_nombre_correo = Usuario.validar_datos(nombre, correo)
    errores_contrasena = Usuario.validar_contrasena(contrasena, confirmar)

    errores = errores_nombre_correo + errores_contrasena

    if errores:
        for error in errores:
            flash(error, "error")
        return redirect(url_for('main.registroUsuario'))

    try:
        controlador = ControladorUsuario()
        controlador.crear_usuario(nombre, correo, contrasena) 
        flash("Usuario registrado correctamente.", "success")
        return redirect(url_for('main.inicioSesion'))
    except Exception as e:
        flash(f"Error al registrar usuario: {e}", "error")
        return redirect(url_for('main.registroUsuario'))
    
#Ruta para iniciar sesión
@main_bp.route('/iniciar_sesion', methods=['POST'])
def iniciar_sesion():
    identificador = request.form.get('usuario')  # Puede ser nombre o correo
    contrasena = request.form.get('contrasena')

    try:
        # Buscar todos los usuarios
        usuarios = controlador.obtener_todos_los_usuarios()

        # Buscar por nombre o correo electrónico
        usuario_encontrado = next((
            u for u in usuarios if
            u.nombre == identificador or u.correo_electronico == identificador
        ), None)

        if usuario_encontrado and usuario_encontrado.verificar_contrasena(contrasena):
            session['usuario_id'] = usuario_encontrado.id_usuario
            flash("Inicio de sesión exitoso.", "success")
            return redirect(url_for('main.home'))
        else:
            flash("Credenciales incorrectas.", "error")
            return redirect(url_for('main.inicioSesion'))

    except Exception as e:
        flash(f"Error en autenticación: {e}", "error")
        return redirect(url_for('main.inicioSesion'))

    
#Ruta para cerrar sesión
@main_bp.route("/cerrar_sesion")
def cerrar_sesion():
    session.pop("usuario_id", None)
    flash("Sesión cerrada exitosamente.", "success")
    return redirect(url_for("main.inicioSesion"))

#Ruta para actualizar credenciales
@main_bp.route("/actualizar_usuario", methods=["POST"])
def actualizar_usuario():
    usuario_id = session.get("usuario_id")
    if not usuario_id:
        flash("No tienes una sesión activa.", "error")
        return redirect(url_for("main.inicioSesion"))

    accion = request.form.get("accion")
    controlador = ControladorUsuario()

    if accion == "eliminar":
        exito = controlador.eliminar_usuario(usuario_id)
        if exito:
            session.pop("usuario_id", None)
            flash("Usuario eliminado exitosamente.", "success")
            return redirect(url_for("main.inicioSesion"))
        else:
            flash("No se pudo eliminar el usuario.", "error")
            return redirect(url_for("main.configurarUsuario"))

    elif accion == "editar":
        nombre = request.form.get("nombre")
        correo = request.form.get("email")

        errores = Usuario.validar_datos(nombre, correo)  

        if errores:
            for error in errores:
                flash(error, "error")
            return redirect(url_for("main.configurarUsuario"))

        try:
            nuevos_datos = {
                "nombre": nombre,
                "correo_electronico": correo
            }

            controlador.actualizar_usuario(usuario_id, nuevos_datos)
            flash("Datos actualizados exitosamente.", "success")
            return redirect(url_for("main.configurarUsuario"))
        except Exception as e:
            flash(f"Error al actualizar usuario: {e}", "error")
            return redirect(url_for("main.configurarUsuario"))

    flash("Acción no reconocida.", "error")
    return redirect(url_for("main.configurarContrasena"))

#Ruta para actualizar contraseña
@main_bp.route("/actualizar_contrasena", methods=["POST"])
def actualizar_contrasena():
    usuario_id = session.get("usuario_id")
    if not usuario_id:
        flash("No tienes una sesión activa.", "error")
        return redirect(url_for("main.inicioSesion"))

    nueva_contrasena = request.form.get("nueva-password")
    confirmar_contrasena = request.form.get("nueva-confirm-password")

    errores = Usuario.validar_contrasena(nueva_contrasena, confirmar_contrasena)

    if errores:
        for error in errores:
            flash(error, "error")
        return redirect(url_for("main.configurarContrasena"))

    try:
        nuevos_datos = {"contrasena": nueva_contrasena}
        controlador = ControladorUsuario()
        controlador.actualizar_usuario(usuario_id, nuevos_datos)

        flash("Contraseña actualizada exitosamente.", "success")
        return redirect(url_for("main.configurarUsuario"))
    except Exception as e:
        flash(f"Error al actualizar la contraseña: {e}", "error")
        return redirect(url_for("main.configurarContrasena"))
    
#Ruta para recuperar contraseña
@main_bp.route("/recuperar_contrasena", methods=["POST"])
def recuperar_contrasena():
    try:
        datos = request.get_json()
        email = datos.get('email')
        
        if not email:
            return jsonify({'error': 'El email es requerido'}), 400
        
        # Buscar usuario por email
        controlador_usuario = ControladorUsuario()
        usuario = controlador_usuario.obtener_usuario_por_email(email)
        
        if not usuario:
            # Por seguridad, no revelar si el email existe o no
            return jsonify({
                'mensaje': 'Si el email está registrado, recibirás una nueva contraseña en breve'
            }), 200
        
        # Generar nueva contraseña temporal
        nueva_contrasena = controlador_usuario.generar_contrasena_temporal()
        
        # Actualizar contraseña en la base de datos
        controlador_usuario.actualizar_contrasena(usuario.id_usuario, nueva_contrasena)
        
        # Enviar email con la nueva contraseña
        resultado = controlador_usuario.enviar_contrasena_por_email(usuario.correo_electronico, nueva_contrasena)
        
        if resultado:
            return jsonify({
                'mensaje': 'Se ha enviado una nueva contraseña temporal a tu email. Revisa tu bandeja de entrada.'
            }), 200
        else:
            return jsonify({
                'error': 'Error al enviar el email. Por favor intenta más tarde.'
            }), 500
        
    except Exception as e:
        return jsonify({
            'error': 'Error interno del servidor. Por favor contacta al administrador.'
        }), 500

#################################################################################33

#Ruta para
@main_bp.route("/crear_opinion_externa", methods=["POST"])
def crear_opinion_externa():
    try:
        titulo = request.form.get("titulo")
        autor = request.form.get("autor")
        fuente = request.form.get("fuente")
        fecha = datetime.datetime.strptime(request.form['fecha'], '%Y-%m-%d').date()

        # Determinar el contenido: archivo subido o contenido extraído por enlace
        if "archivo" in request.files:
            archivo = request.files["archivo"]
            contenido = archivo.read()
            url = "local"
        else:
            contenido_texto = request.form.get("contenido", "").strip()
            url = request.form.get("enlace")

            if not contenido_texto or contenido_texto.lower() == "contenido no disponible":
                flash("No se pudo extraer el contenido del enlace. Elige otro link o descarga manualmente el archivo.", "warning")
                return redirect(url_for("main.archivos"))

            contenido = contenido_texto.encode("utf-8")
           
            url = request.form.get("enlace")

        usuario_id = session.get("usuario_id")

        opinion = OpinionExterna(
            fuente=fuente,
            autor=autor,
            titulo=titulo,
            contenido=contenido,
            fecha=fecha,
            url=url,
            usuario_id=usuario_id
        )

        ControladorOpinion.insertar_opinion_externa(opinion)

        flash("Opinión externa guardada correctamente", "success")
        return redirect(url_for("main.archivos"))

    except Exception as error:
        flash(f"Error al guardar la opinión externa: {str(error)}", "danger")
        return redirect(url_for("main.archivos"))
       

#Ruta para la extraccion
@main_bp.route("/extraer_articulo", methods=["POST"])
def extraer_articulo():
    url = request.form.get("url")
    try:
        datos = ProcesadorArticulo.procesar_como_dict(url)
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@main_bp.route("/crear_opinion_usuario", methods=["POST"])
def crear_opinion_usuario():
    try:
        # 📥 Datos del formulario
        titulo = request.form.get("titulo")
        texto_opinion = request.form.get("opinion", "").strip()
        archivo = request.files.get("archivo")
        usuario_id = session.get("usuario_id")

        if not usuario_id:
            flash("Sesión no válida. Por favor, inicia sesión.", "danger")
            return redirect(url_for("main.archivos"))

        # Fecha actual
        fecha_actual = datetime.date.today()

        # Seleccionar contenido: texto o archivo
        if texto_opinion and not archivo:
            contenido = texto_opinion.encode("utf-8")
        elif archivo and not texto_opinion:
            contenido = archivo.read()
        elif texto_opinion and archivo:
            flash("Solo se permite uno: texto o archivo.", "warning")
            return redirect(url_for("main.archivos"))
        else:
            flash("Debe ingresar una opinión o seleccionar un archivo.", "warning")
            return redirect(url_for("main.archivos"))

        # Crear instancia y guardar
        opinion = OpinionUsuario(
            titulo=titulo,
            contenido=contenido,
            fecha=fecha_actual,
            usuario_id=usuario_id
        )

        ControladorOpinion.insertar_opinion_usuario(opinion)

        flash("Opinión personal guardada correctamente", "success")
        return redirect(url_for("main.archivos"))

    except Exception as error:
        flash(f"Error al guardar la opinión de usuario: {str(error)}", "danger")
        return redirect(url_for("main.archivos"))

#Ruta para cargar la lista de registros cargadas
@main_bp.route("/opiniones_cargadas")
def opiniones_cargadas():
    usuario_id = session.get("usuario_id")

    if not usuario_id:
        return jsonify({"error": "Sesión inválida"}), 401

    registros = ControladorOpinion.obtener_todas_las_opiniones(usuario_id)
    return jsonify(registros)

#Ruta para cargar l ainformacion en elo fromumarios para editar las opiniones o archivos ()
@main_bp.route("/obtener_opinion/<origen>/<int:id>")
def obtener_opinion(origen, id):
    if origen == "Externo":
        opinion = OpinionExterna.query.get(id)
        id_opinion = opinion._opinion_externa_id if opinion else None
        autor = getattr(opinion, "autor", "")
        fuente = getattr(opinion, "fuente", "")
    elif origen == "Personal":
        opinion = OpinionUsuario.query.get(id)
        id_opinion = opinion._opinion_usuario_id if opinion else None

        usuario_id = session.get("usuario_id")
        usuario = Usuario.query.get(usuario_id) if usuario_id else None
        autor = usuario.nombre if usuario else "Desconocido"
        fuente = ""
    else:
        return jsonify({"error": "Origen inválido"}), 400

    if not opinion:
        return jsonify({"error": "No encontrada"}), 404

    titulo = opinion.titulo.decode('utf-8') if isinstance(opinion.titulo, bytes) else opinion.titulo
    contenido = opinion.contenido.decode('utf-8') if isinstance(opinion.contenido, bytes) else opinion.contenido

    return jsonify({
        "id": id_opinion,
        "origen": origen,
        "titulo": titulo,
        "contenido": contenido,
        "autor": autor,
        "fuente": fuente,
        "fecha": opinion.fecha.strftime('%Y-%m-%d') if opinion.fecha else ""
    })


#Rutas para eliniar y actualizar opinion externa
@main_bp.route("/actualizar_opinion/externa/<int:id>", methods=["PUT"])
def actualizar_opinion_externa(id):
    datos = request.get_json()
    opinion = ControladorOpinion.actualizar_opinion_externa(id, datos)
    if not opinion:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Cambios guardados correctamente."})

@main_bp.route("/eliminar_opinion/externa/<int:id>", methods=["DELETE"])
def eliminar_opinion_externa(id):
    exito = ControladorOpinion.eliminar_opinion_externa(id)
    if not exito:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Opinión eliminada correctamente"})

#Rutas para eliniar y actualizar opinion eusuario
@main_bp.route("/actualizar_opinion/usuario/<int:id>", methods=["PUT"])
def actualizar_opinion_usuario(id):
    datos = request.get_json()
    opinion = ControladorOpinion.actualizar_opinion_usuario(id, datos)
    if not opinion:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Cambios guardados correctamente."})

@main_bp.route("/eliminar_opinion/usuario/<int:id>", methods=["DELETE"])
def eliminar_opinion_usuario(id):
    exito = ControladorOpinion.eliminar_opinion_usuario(id)
    if not exito:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Opinión eliminada correctamente"})

#----------------------------------------------------------
#Ruta oara obtener ey guardar los terminos politicos
@main_bp.route('/guardar_termino', methods=['POST'])
def guardar_termino():
    palabra = request.form.get('palabra')
    etiqueta = request.form.get('etiqueta')
    usuario_id = session.get("usuario_id")

    if not palabra or not etiqueta:
        flash("Todos los campos obligatorios deben completarse", "error")
        return redirect(url_for("main.terminos"))

   
    return redirect(url_for("main.terminos"))
#----------------------------------------------------------
# Ruta para procesar textos con el nuevo enfoque
@main_bp.route("/procesar_textos", methods=["POST"])
def procesar_textos():
    datos = request.get_json()
    archivos_raw = datos.get("archivos", [])
    usuario_id = session.get("usuario_id")
    if not archivos_raw:
        return jsonify({"error": "No se enviaron archivos"}), 400

    archivos = []
    for item in archivos_raw:
        if isinstance(item, dict) and "id" in item:
            archivos.append(item["id"])
        elif isinstance(item, int):
            archivos.append(item)

    if not archivos:
        return jsonify({"error": "No se enviaron IDs válidos"}), 400

    print("Archivos:", archivos)
    
    controladorNLP = ControladorNLP()
    texto_id = controladorNLP.procesar_archivos(archivos_raw, usuario_id)

    if texto_id is None:
        return jsonify({"error": "No se procesaron textos"}), 400

    texto = TextoProcesado.query.get(texto_id)
    if not texto:
        return jsonify({"error": "Texto procesado no encontrado"}), 404

    archivos_origen = json.loads(texto.archivos_origen)
    
    # Usar directamente los campos por archivo
    textos_por_archivo = texto.textos_por_archivo
    frases_por_archivo = texto.frases_por_archivo
    etiquetas_pos_por_archivo = texto.etiquetas_pos_por_archivo
    
    response_data = {
        "texto_procesado_id": texto.texto_procesado_id,
        "tiempo_procesar": texto.tiempo_procesar,
        "caracteres_eliminados": texto.caracteres_eliminados,
        "longitud_promedio_frases": texto.longitud_promedio_frases,
        "total_frases": texto.total_frases,
        "archivos_origen": archivos_origen,
        "texto_completo_por_archivo": textos_por_archivo,
        "frases_por_archivo": frases_por_archivo,
        "etiquetas_pos_por_archivo": etiquetas_pos_por_archivo
    }

    return jsonify(response_data), 200

@main_bp.route("/eliminar-texto-procesado/<int:texto_id>", methods=["DELETE"])
def eliminar_texto_procesado(texto_id):  # ← Cambia el nombre del parámetro
    texto = ControladorNLP.eliminar_texto_procesado(texto_id)
    if not texto:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Texto eliminado"}), 200

########################### Rutas para procesar el Agrupamiento ###################################################

# Ruta para iniciar agrupamiento
@main_bp.route("/iniciar_agrupamiento", methods=["POST"])
def iniciar_agrupamiento():
    try:
        datos = request.get_json()

        # Extracción directa de parámetros relevantes
        ids = datos.get("ids", [])
        metodo_cluster = datos.get("cluster")
        modelo_embedding = datos.get("embedding")
        nombre_agrupamiento = datos.get("nombre_agrupacion")
        texto_id = datos.get("id_texto")
        
        # Transformar lista de vocabularios en Dict[str, str]
        vocabulario = defaultdict(list)
        for archivo in ids:
            titulo = archivo.get("titulo", "desconocido")
            for palabra in archivo.get("vocabulario", []):
                vocabulario[palabra].append(titulo)
        
        # Determinar ruta del modelo según selección
        ruta_modelo = None
        
        # Inicializar controlador con parámetros mínimos requeridos
        controlador = ControladorAgrupamiento(
            texto_id=texto_id,
            nombre_agrupacion=nombre_agrupamiento,
            descripcion="Agrupación generada automáticamente",
            modelo_embedding=modelo_embedding,
            ruta_modelo=ruta_modelo,
            metodo_clustering=metodo_cluster,
            n_clusters=None
        )

        # Ejecutar agrupamiento
        agrupacion_id = controlador.ejecutar_agrupamiento(vocabulario=vocabulario)

        agrupacion = Agrupacion.query.get(agrupacion_id)
        if not agrupacion:
            return jsonify({"error": "Agrupación no encontrada"}), 404

        # **ELIMINADO: La conversión t-SNE ya no es necesaria aquí**
        # Los embeddings ya vienen como t-SNE desde el pipeline
        
        # Construcción de respuesta - los embeddings ya son t-SNE 2D
        resultado = {
            "agrupaciones": {
                "agrupacion_id": agrupacion._agrupacion_id,
                "nombre": agrupacion.nombre,
                "descripcion": agrupacion.descripcion,
                "interpretacion": agrupacion.interpretacion_ideologica,
                "asignacion_clusters": agrupacion.asignacion_clusters,
                "embeddings_latentes": agrupacion.embeddings_latentes,  
                "metricas": agrupacion.metricas_clustering,
                "parametros_ejecucion": agrupacion.parametros_ejecucion,
                "texto_id": agrupacion.texto_id
            }
        }
        #print("Asignacion_clusters" + str(resultado["agrupaciones"]["interpretacion"]))
        return jsonify(resultado)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main_bp.route("/eliminar-agrupacion/<int:agrupamiento_id>", methods=["DELETE"])
def eliminar_agrupacion(agrupamiento_id):  
    texto = ControladorAgrupamiento.eliminar_agrupamiento(agrupamiento_id)
    if not texto:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify({"mensaje": "Texto eliminado"}), 200

#
@main_bp.route("/obtener-autor-por-titulo", methods=["POST"])
def obtener_autor_por_titulo():
    try:
        datos = request.get_json()
        titulo_buscado = datos.get("titulo", "").strip()
        
        print(f"\n🔍 [DEBUG] Buscando autor para: '{titulo_buscado}'")
        
        if not titulo_buscado:
            return jsonify({"autor": "Desconocido", "razon": "Título vacío"})
        
        from app.models.opinionExterna import OpinionExterna
        from app.models.opinionUsuario import OpinionUsuario
        
        # 1. Buscar coincidencia EXACTA primero
        print(f"🔍 Buscando coincidencia exacta...")
        opinion_externa = OpinionExterna.query.filter(
            OpinionExterna._titulo == titulo_buscado
        ).first()
        
        if opinion_externa:
            print(f"✅ Encontrado exacto: '{opinion_externa._titulo}'")
            return jsonify({
                "titulo": titulo_buscado,
                "autor": opinion_externa._autor,
                "titulo_encontrado": opinion_externa._titulo,
                "coincidencia": "exacta",
                "origen": "externo"
            })
        
        # 2. Buscar en OpinionUsuario (exacto)
        opinion_usuario = OpinionUsuario.query.filter(
            OpinionUsuario._titulo == titulo_buscado
        ).first()
        
        if opinion_usuario:
            print(f"✅ Encontrado en OpinionUsuario")
            return jsonify({
                "titulo": titulo_buscado,
                "autor": "Usuario",
                "titulo_encontrado": opinion_usuario._titulo,
                "coincidencia": "exacta",
                "origen": "personal"
            })
        
        # 3. Si no hay exacta, buscar LIKE (pero más estricto)
        print(f"🔍 Buscando coincidencia LIKE...")
        
        # Dividir el título buscado en palabras clave (eliminar prefijos como "Izquierda")
        palabras_clave = [p for p in titulo_buscado.split() 
                         if p.lower() not in ['izquierda', 'derecha', 'hacia', 'de', 'la', 'el'] 
                         and len(p) > 3]
        
        if palabras_clave:
            # Buscar por palabras clave (más preciso que LIKE simple)
            for palabra in palabras_clave:
                opinion_externa = OpinionExterna.query.filter(
                    OpinionExterna._titulo.like(f"%{palabra}%")
                ).first()
                
                if opinion_externa:
                    print(f"✅ Encontrado por palabra clave '{palabra}': '{opinion_externa._titulo}'")
                    return jsonify({
                        "titulo": titulo_buscado,
                        "autor": opinion_externa._autor,
                        "titulo_encontrado": opinion_externa._titulo,
                        "coincidencia": "parcial",
                        "palabra_clave": palabra,
                        "origen": "externo"
                    })
        
        print(f"❌ No encontrado: '{titulo_buscado}'")
        return jsonify({
            "titulo": titulo_buscado,
            "autor": "Desconocido",
            "origen": "no_encontrado"
        })
        
    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"autor": "Desconocido", "error": str(e)}), 500

########################### Rutas para procesar el hitroial ###################################################

#Ruta para guardar el agrupamienot en el historial
@main_bp.route("/guardar-historial", methods=["POST"])
def guardar_historial():
    data = request.get_json()
    print("Datos recibidos:", data)  # ← Depuración

    agrupacion_id_raw = data.get("agrupacion_id")
    comentario = data.get("comentario", "")
    favorito = data.get("favorito", False)

    # Validación de tipo y existencia
    try:
        agrupacion_id = int(agrupacion_id_raw)
        if agrupacion_id <= 0:
            raise ValueError("El ID de agrupación debe ser mayor que cero.")
    except (TypeError, ValueError):
        return jsonify({"error": "ID de agrupación inválido o ausente"}), 400

    # Validación de existencia en la base de datos
    from app.models.agrupacion import Agrupacion
    agrupacion = Agrupacion.query.get(agrupacion_id)
    if not agrupacion:
        return jsonify({"error": f"No existe agrupación con ID {agrupacion_id}"}), 400

    # Guardado
    try:
        resultado = ControladorHistorial().guardar(agrupacion_id, comentario, favorito)
        return jsonify(resultado), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        return jsonify({"error": str(re)}), 500



@main_bp.route("/historial-agrupaciones", methods=["GET"])
def obtener_historial_agrupaciones():
    try:
        print("=== DEBUG ===")
        print("Session content:", dict(session))
        
        usuario_id = session.get("usuario_id")
        print("Usuario ID:", usuario_id)
        
        if not usuario_id:
            print("No usuario_id in session")
            return jsonify({"error": "Usuario no autenticado"}), 401
        
        resultado = ControladorHistorial().obtener_historiales(usuario_id)
        print("Resultado length:", len(resultado))
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al obtener historial: {e}")
        import traceback
        traceback.print_exc()  # Esto mostrará el error completo
        return jsonify({"error": str(e)}), 500
    

@main_bp.route("/historial-agrupaciones/<int:historial_id>", methods=["DELETE"])
def eliminar_historial_agrupacion(historial_id):
    controlador = ControladorHistorial()
    mensaje, status = controlador.eliminar_historial(historial_id)
    return jsonify(mensaje), status
  
@main_bp.route("/historial-agrupaciones/<int:historial_id>/favorito", methods=["PATCH"])
def actualizar_favorito(historial_id):
    data = request.get_json()
    nuevo_estado = data.get("favorito")

    if nuevo_estado is None:
        return jsonify({"error": "Estado de favorito no proporcionado"}), 400

    resultado, status = ControladorHistorial().actualizar_favorito(historial_id, bool(nuevo_estado))
    return jsonify(resultado), status


@main_bp.route("/historial-agrupaciones/<int:historial_id>/nlp", methods=["GET"])
def obtener_nlp_y_agrupacion_por_historial(historial_id):
    from app.models.historialClasificacion import HistorialClasificacion
    from app.models.agrupacion import Agrupacion
    from app.models.textoProcesado import TextoProcesado

    # Paso 1: Buscar historial
    historial = HistorialClasificacion.query.get(historial_id)
    if not historial:
        return jsonify({"error": "Historial no encontrado"}), 404

    # Paso 2: Buscar agrupación asociada
    agrupacion = Agrupacion.query.get(historial._agrupacion_id)
    if not agrupacion:
        return jsonify({"error": "Agrupación no encontrada"}), 404

    # Paso 3: Buscar texto procesado
    texto = TextoProcesado.query.get(agrupacion._texto_id)
    if not texto:
        return jsonify({"error": "Texto procesado no disponible"}), 404

    # Paso 4: Construir respuesta con NLP + Agrupación
    resultado = {
        "nlp": {
            "tiempo_procesar": texto.tiempo_procesar,
            "caracteres_eliminados": texto.caracteres_eliminados,
            "longitud_promedio_frases": texto.longitud_promedio_frases,
            "total_frases": texto.total_frases,
            "archivos_origen": texto.archivos_origen,
            "texto_completo_por_archivo": texto.textos_por_archivo, 
            "frases_por_archivo": texto.frases_por_archivo,
            "etiquetas_pos_por_archivo": texto.etiquetas_pos_por_archivo
        },
        "agrupacion": {
            "nombre": agrupacion.nombre,
            "descripcion": agrupacion.descripcion,
            "interpretacion": agrupacion.interpretacion_ideologica,
            "asignacion_clusters": agrupacion.asignacion_clusters,
            "embeddings_latentes": agrupacion.embeddings_latentes,  
            "metricas": agrupacion.metricas_clustering,
            "parametros_ejecucion": agrupacion.parametros_ejecucion
        }
    }
    #print("Asignacion_clusters" + str(resultado["agrupacion"]["asignacion_clusters"]))
    #print("Archivos"+str(resultado["agrupacion"]["parametros_ejecucion"]))
    #print("agrupacion"+ str(resultado["agrupacion"]["interpretacion"]))
    #print("nlp"+ str(resultado["nlp"]["texto_completo_por_archivo"]))
    #print("nlp"+ str(resultado["nlp"]["archivos_origen"]))
    return jsonify(resultado), 200