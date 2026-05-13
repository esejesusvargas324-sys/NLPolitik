// Datos completos de la escala RILE
const terminosRILE = {
    derecha: [
        {
            codigo: "per104",
            nombre: "Fuerzas Armadas: Positivo",
            descripcion: "Referencias positivas a las fuerzas armadas, defensa nacional, poder militar y veteranos. Incluye apoyo al gasto militar, fortalecimiento de las fuerzas armadas y reconocimiento de su papel en la seguridad nacional.",
            ejemplos: ["Fortalecer nuestras fuerzas armadas", "Aumentar el presupuesto de defensa", "Apoyo a los veteranos", "Modernización militar", "Defensa nacional sólida"]
        },
        {
            codigo: "per201", 
            nombre: "Libertad y Derechos Humanos",
            descripcion: "Énfasis en las libertades individuales, derechos humanos, libertad de expresión y protección contra la interferencia estatal. Defensa del individuo frente al colectivo.",
            ejemplos: ["Protección de libertades civiles", "Derechos individuales", "Libertad de expresión", "Autonomía personal", "Limitación del poder estatal"]
        },
        {
            codigo: "per203",
            nombre: "Constitucionalismo: Positivo",
            descripcion: "Apoyo al orden constitucional, estado de derecho, separación de poderes y mecanismos institucionales establecidos. Respeto a las normas y procedimientos democráticos.",
            ejemplos: ["Defensa de la constitución", "Estado de derecho", "Separación de poderes", "Instituciones sólidas", "Estabilidad institucional"]
        },
        {
            codigo: "per305",
            nombre: "Autoridad Política",
            descripcion: "Enfatiza la necesidad de autoridad, disciplina, obediencia y liderazgo fuerte en la sociedad. Respaldo a figuras de autoridad y jerarquía establecida.",
            ejemplos: ["Fortalecer la autoridad", "Liderazgo fuerte", "Disciplina social", "Orden y obediencia", "Respeto a la jerarquía"]
        },
        {
            codigo: "per401",
            nombre: "Economía de Libre Mercado",
            descripcion: "Promoción de la economía de mercado, libre empresa, competencia y oposición al control estatal de la economía. Defensa de la propiedad privada y la iniciativa individual.",
            ejemplos: ["Libre mercado", "Iniciativa privada", "Competencia económica", "Desregulación", "Propiedad privada"]
        },
        {
            codigo: "per402",
            nombre: "Incentivos: Positivos",
            descripcion: "Apoyo a incentivos económicos, productividad, eficiencia y oposición a la igualdad económica forzada. Valoración del mérito y la recompensa individual.",
            ejemplos: ["Incentivos económicos", "Productividad", "Eficiencia empresarial", "Meritocracia", "Recompensa al esfuerzo"]
        },
        {
            codigo: "per407",
            nombre: "Proteccionismo: Negativo",
            descripcion: "Oposición al proteccionismo económico, apoyo al libre comercio y la globalización económica. Crítica a las barreras comerciales y arancelarias.",
            ejemplos: ["Libre comercio", "Apertura económica", "Contra barreras arancelarias", "Globalización económica", "Competencia internacional"]
        },
        {
            codigo: "per414",
            nombre: "Ortodoxia Económica",
            descripcion: "Énfasis en la estabilidad económica, control de la inflación, disciplina fiscal y políticas monetarias conservadoras.",
            ejemplos: ["Estabilidad económica", "Control de inflación", "Disciplina fiscal", "Políticas monetarias conservadoras", "Equilibrio presupuestario"]
        },
        {
            codigo: "per505",
            nombre: "Limitación del Estado de Bienestar",
            descripcion: "Oposición a la expansión del estado de bienestar, apoyo a la reducción del gasto social y promoción de la responsabilidad individual.",
            ejemplos: ["Reducción del gasto social", "Responsabilidad individual", "Límites al estado benefactor", "Autosuficiencia", "Programas sociales focalizados"]
        },
        {
            codigo: "per601",
            nombre: "Modo de Vida Nacional: Positivo",
            descripcion: "Promoción de la identidad nacional, tradiciones culturales y valores patrióticos. Énfasis en la unidad nacional y orgullo patrio.",
            ejemplos: ["Identidad nacional", "Tradiciones culturales", "Valores patrióticos", "Unidad nacional", "Orgullo patrio"]
        },
        {
            codigo: "per603",
            nombre: "Moralidad Tradicional: Positivo",
            descripcion: "Defensa de los valores morales tradicionales, estructura familiar convencional y oposición a cambios sociales progresistas.",
            ejemplos: ["Valores morales tradicionales", "Familia convencional", "Tradición religiosa", "Conservadurismo social", "Moralidad establecida"]
        },
        {
            codigo: "per605",
            nombre: "Ley y Orden",
            descripcion: "Énfasis en el mantenimiento del orden público, lucha contra la criminalidad y fortalecimiento del sistema de justicia penal.",
            ejemplos: ["Mantenimiento del orden público", "Lucha contra la criminalidad", "Sistema penal fuerte", "Seguridad ciudadana", "Cumplimiento de la ley"]
        },
        {
            codigo: "per606",
            nombre: "Conciencia Cívica: Positivo",
            descripcion: "Promoción de la responsabilidad ciudadana, deberes cívicos y participación constructiva en la sociedad.",
            ejemplos: ["Responsabilidad ciudadana", "Deberes cívicos", "Participación constructiva", "Civismo", "Contribución social"]
        }
    ],
    izquierda: [
        {
            codigo: "per103",
            nombre: "Antiimperialismo",
            descripcion: "Oposición al imperialismo, colonialismo y dominación extranjera. Crítica a la intervención internacional y defensa de la soberanía nacional frente a potencias extranjeras.",
            ejemplos: ["Contra el imperialismo", "Lucha anticolonial", "Soberanía nacional", "No intervención", "Independencia nacional"]
        },
        {
            codigo: "per105",
            nombre: "Militar: Negativo", 
            descripcion: "Crítica al militarismo, gasto militar, armamentismo y promoción de la desmilitarización. Oposición a la carrera armamentista.",
            ejemplos: ["Reducir gasto militar", "Desmilitarización", "Paz no guerra", "Crítica al complejo militar", "Contra carrera armamentista"]
        },
        {
            codigo: "per106",
            nombre: "Paz",
            descripcion: "Promoción activa de la paz, desarme, diplomacia y solución pacífica de conflictos. Apoyo a iniciativas de paz internacional.",
            ejemplos: ["Cultura de paz", "Diplomacia internacional", "Desarme nuclear", "Resolución pacífica", "Cooperación internacional"]
        },
        {
            codigo: "per107", 
            nombre: "Internacionalismo: Positivo",
            descripcion: "Apoyo a la cooperación internacional, organizaciones multilaterales y solidaridad global. Visión cosmopolita de las relaciones internacionales.",
            ejemplos: ["Cooperación internacional", "Organizaciones multilaterales", "Solidaridad global", "Integración regional", "Cosmopolitismo"]
        },
        {
            codigo: "per202",
            nombre: "Democracia",
            descripcion: "Enfatiza la participación ciudadana, democracia participativa, transparencia y accountability. Profundización de los mecanismos democráticos.",
            ejemplos: ["Democracia participativa", "Transparencia gubernamental", "Rendición de cuentas", "Participación ciudadana", "Democracia directa"]
        },
        {
            codigo: "per403",
            nombre: "Regulación del mercado",
            descripcion: "Apoyo a la intervención estatal en la economía, regulación de mercados y control de actividades económicas privadas.",
            ejemplos: ["Intervención estatal", "Regulación económica", "Control de mercados", "Supervisión gubernamental", "Límites al capital"]
        },
        {
            codigo: "per404",
            nombre: "Planificación económica",
            descripcion: "Promoción de la planificación económica central, dirección estatal de la economía y establecimiento de objetivos económicos nacionales.",
            ejemplos: ["Planificación central", "Dirección estatal económica", "Objetivos económicos nacionales", "Economía dirigida", "Coordinación económica"]
        },
        {
            codigo: "per406",
            nombre: "Proteccionismo: Positivo",
            descripcion: "Apoyo al proteccionismo económico, defensa de industrias nacionales y oposición al libre comercio sin restricciones.",
            ejemplos: ["Protección industrial", "Defensa de industrias nacionales", "Barreras arancelarias", "Comercio justo", "Soberanía económica"]
        },
        {
            codigo: "per412",
            nombre: "Economía controlada",
            descripcion: "Defensa del control estatal sobre sectores económicos estratégicos y oposición a la privatización de servicios públicos.",
            ejemplos: ["Control estatal económico", "Sectores estratégicos públicos", "Contra privatizaciones", "Empresas públicas", "Servicios estatales"]
        },
        {
            codigo: "per413",
            nombre: "Nacionalización",
            descripcion: "Apoyo a la nacionalización de industrias y recursos, propiedad pública de medios de producción y control colectivo.",
            ejemplos: ["Nacionalización de industrias", "Propiedad pública", "Medios de producción colectivos", "Estatización", "Control público"]
        },
        {
            codigo: "per504",
            nombre: "Expansión del Estado de bienestar",
            descripcion: "Promoción de la expansión de servicios sociales, protección social universal y aumento del gasto en políticas sociales.",
            ejemplos: ["Estado de bienestar amplio", "Protección social universal", "Servicios sociales expandidos", "Gasto social aumentado", "Derechos sociales"]
        },
        {
            codigo: "per506",
            nombre: "Expansión de la educación",
            descripcion: "Apoyo a la educación pública, gratuita y universal. Inversión en sistema educativo y acceso igualitario a la educación.",
            ejemplos: ["Educación pública gratuita", "Inversión educativa", "Acceso igualitario", "Sistema educativo público", "Educación universal"]
        },
        {
            codigo: "per701",
            nombre: "Grupos laborales: Positivo",
            descripcion: "Apoyo a los sindicatos, derechos laborales, negociación colectiva y protección de los trabajadores.",
            ejemplos: ["Apoyo a sindicatos", "Derechos laborales", "Negociación colectiva", "Protección trabajadores", "Movimiento obrero"]
        }
    ]
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarRILE();
});

function inicializarRILE() {
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const listaTerminos = document.getElementById('lista-terminos-rile');
    const detallesContenido = document.getElementById('detalles-contenido');

    // Event listeners para filtros
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const ideologia = this.dataset.ideologia;
            
            // Actualizar botones activos
            filtroBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar términos
            cargarTerminosRILE(ideologia);
        });
    });

    // Cargar términos iniciales (derecha por defecto)
    cargarTerminosRILE('derecha');
}

function cargarTerminosRILE(ideologia) {
    const listaTerminos = document.getElementById('lista-terminos-rile');
    const terminos = terminosRILE[ideologia];
    
    listaTerminos.innerHTML = '';
    
    terminos.forEach((termino, index) => {
        const elementoTermino = document.createElement('div');
        elementoTermino.className = `termino-rilev2 ${ideologia} ${index === 0 ? 'activo' : ''}`;
        elementoTermino.dataset.codigo = termino.codigo;
        
        elementoTermino.innerHTML = `
            <div class="termino-icono">
                <i class="fas fa-${ideologia === 'derecha' ? 'hand-point-right' : 'hand-point-left'}"></i>
            </div>
            <div class="termino-info">
                <div class="termino-nombre">${termino.nombre}</div>
                <div class="termino-codigo">${termino.codigo}</div>
            </div>
        `;
        
        elementoTermino.addEventListener('click', function() {
            // Remover activo de todos
            document.querySelectorAll('.termino-rilev2').forEach(t => t.classList.remove('activo'));
            // Agregar activo al seleccionado
            this.classList.add('activo');
            // Mostrar detalles
            mostrarDetallesTermino(termino);
        });
        
        listaTerminos.appendChild(elementoTermino);
        
        // Mostrar detalles del primer término
        if (index === 0) {
            mostrarDetallesTermino(termino);
        }
    });
}

function mostrarDetallesTermino(termino) {
    const detallesContenido = document.getElementById('detalles-contenido');
    
    detallesContenido.innerHTML = `
        <div class="contenido-detalles">
            <div class="cabecera-detalle">
                <h3 class="titulo-detalle">
                    ${termino.nombre}
                    <span class="codigo-detalle">${termino.codigo}</span>
                </h3>
            </div>
            
            <div class="descripcion-detalle">
                <p>${termino.descripcion}</p>
            </div>
            
            <div class="ejemplos-lista-terminos">
                <h5>Ejemplos en el discurso político:</h5>
                <ul>
                    ${termino.ejemplos.map(ejemplo => `<li>${ejemplo}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}