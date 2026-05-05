/* ============================================================
   DATOS.JS — Base de datos en memoria + persistencia localStorage
   Todos los datos del sistema están hardcodeados aquí.
   El localStorage se usa para el chat y sesión activa.
   ============================================================ */

/* ──────────────────────────────────────────
   USUARIOS DEL SISTEMA (hardcodeados)
   Credenciales fijas para evitar problemas en Vercel.
   Las contraseñas están hasheadas con SHA-256 simulado
   usando una función simple — suficiente para portafolio.
   ────────────────────────────────────────── */
const USUARIOS = [
  {
    id: 1,
    nombre: "Carlos Mendoza",
    empresa: "TechCorp Solutions",
    email: "admin@portal.com",
    password: "Admin2024",
    rol: "admin",
    avatar: "CM",
    telefono: "+34 612 345 678",
    fechaRegistro: "2024-01-15",
    estado: "activo"
  },
  {
    id: 2,
    nombre: "María González",
    empresa: "Servicios MG S.L.",
    email: "maria@demo.com",
    password: "Maria2024",
    rol: "cliente",
    avatar: "MG",
    telefono: "+34 698 765 432",
    fechaRegistro: "2024-02-20",
    estado: "activo"
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    empresa: "JP Digital Agency",
    email: "juan@demo.com",
    password: "Juan2024",
    rol: "cliente",
    avatar: "JP",
    telefono: "+34 677 123 456",
    fechaRegistro: "2024-03-10",
    estado: "activo"
  }
];

/* ──────────────────────────────────────────
   FACTURAS (hardcodeadas por cliente)
   Cada factura tiene: id, número, fecha, monto,
   estado, descripción, items y vencimiento.
   ────────────────────────────────────────── */
const FACTURAS = [
  /* ── Facturas de Carlos Mendoza (id=1) ── */
  {
    id: 1,
    clienteId: 1,
    numero: "FAC-2024-001",
    fecha: "2024-01-20",
    vencimiento: "2024-02-20",
    monto: 3500.00,
    moneda: "EUR",
    estado: "pagada",
    descripcion: "Desarrollo de plataforma web corporativa",
    items: [
      { descripcion: "Diseño UI/UX", cantidad: 1, precio: 1200.00 },
      { descripcion: "Desarrollo frontend", cantidad: 1, precio: 1500.00 },
      { descripcion: "Integración API", cantidad: 1, precio: 800.00 }
    ],
    metodoPago: "Transferencia bancaria",
    notasInternas: "Proyecto entregado en plazo"
  },
  {
    id: 2,
    clienteId: 1,
    numero: "FAC-2024-002",
    fecha: "2024-02-15",
    vencimiento: "2024-03-15",
    monto: 1800.00,
    moneda: "EUR",
    estado: "pagada",
    descripcion: "Mantenimiento mensual + soporte técnico",
    items: [
      { descripcion: "Mantenimiento servidor", cantidad: 1, precio: 600.00 },
      { descripcion: "Soporte técnico (20h)", cantidad: 20, precio: 60.00 }
    ],
    metodoPago: "Domiciliación bancaria",
    notasInternas: "Contrato de mantenimiento anual"
  },
  {
    id: 3,
    clienteId: 1,
    numero: "FAC-2024-003",
    fecha: "2024-03-10",
    vencimiento: "2024-04-10",
    monto: 5200.00,
    moneda: "EUR",
    estado: "pendiente",
    descripcion: "Módulo de e-commerce y pasarela de pagos",
    items: [
      { descripcion: "Desarrollo e-commerce", cantidad: 1, precio: 3200.00 },
      { descripcion: "Integración Stripe", cantidad: 1, precio: 800.00 },
      { descripcion: "Testing y QA", cantidad: 1, precio: 1200.00 }
    ],
    metodoPago: "Pendiente",
    notasInternas: "En revisión por el cliente"
  },
  {
    id: 4,
    clienteId: 1,
    numero: "FAC-2023-018",
    fecha: "2023-11-05",
    vencimiento: "2023-12-05",
    monto: 2100.00,
    moneda: "EUR",
    estado: "vencida",
    descripcion: "Campaña SEO y marketing digital Q4",
    items: [
      { descripcion: "Auditoría SEO", cantidad: 1, precio: 450.00 },
      { descripcion: "Optimización on-page", cantidad: 1, precio: 850.00 },
      { descripcion: "Gestión campañas Google Ads", cantidad: 2, precio: 400.00 }
    ],
    metodoPago: "Sin definir",
    notasInternas: "Requiere seguimiento urgente"
  },
  /* ── Facturas de María González (id=2) ── */
  {
    id: 5,
    clienteId: 2,
    numero: "FAC-2024-007",
    fecha: "2024-01-30",
    vencimiento: "2024-03-01",
    monto: 980.00,
    moneda: "EUR",
    estado: "pagada",
    descripcion: "Diseño de identidad corporativa",
    items: [
      { descripcion: "Logotipo + variantes", cantidad: 1, precio: 550.00 },
      { descripcion: "Manual de marca", cantidad: 1, precio: 430.00 }
    ],
    metodoPago: "PayPal",
    notasInternas: "Cliente satisfecho, posible ampliación"
  },
  {
    id: 6,
    clienteId: 2,
    numero: "FAC-2024-012",
    fecha: "2024-03-01",
    vencimiento: "2024-04-01",
    monto: 2750.00,
    moneda: "EUR",
    estado: "pendiente",
    descripcion: "Desarrollo app móvil iOS/Android",
    items: [
      { descripcion: "Prototipo interactivo", cantidad: 1, precio: 750.00 },
      { descripcion: "Desarrollo React Native", cantidad: 1, precio: 2000.00 }
    ],
    metodoPago: "Transferencia bancaria",
    notasInternas: "Segunda fase del proyecto"
  },
  /* ── Facturas de Juan Pérez (id=3) ── */
  {
    id: 7,
    clienteId: 3,
    numero: "FAC-2024-009",
    fecha: "2024-02-10",
    vencimiento: "2024-03-10",
    monto: 4200.00,
    moneda: "EUR",
    estado: "pagada",
    descripcion: "Portal de clientes + sistema de gestión",
    items: [
      { descripcion: "Portal web", cantidad: 1, precio: 2800.00 },
      { descripcion: "Panel administración", cantidad: 1, precio: 1400.00 }
    ],
    metodoPago: "Transferencia bancaria",
    notasInternas: "Proyecto completado exitosamente"
  },
  {
    id: 8,
    clienteId: 3,
    numero: "FAC-2024-015",
    fecha: "2024-03-20",
    vencimiento: "2024-04-20",
    monto: 1350.00,
    moneda: "EUR",
    estado: "pendiente",
    descripcion: "Consultoría estrategia digital 2024",
    items: [
      { descripcion: "Análisis y diagnóstico", cantidad: 1, precio: 600.00 },
      { descripcion: "Plan de acción 12 meses", cantidad: 1, precio: 750.00 }
    ],
    metodoPago: "Pendiente",
    notasInternas: "Esperando confirmación presupuesto"
  }
];

/* ──────────────────────────────────────────
   PEDIDOS (hardcodeados por cliente)
   Cada pedido tiene estado y timeline de seguimiento.
   ────────────────────────────────────────── */
const PEDIDOS = [
  /* ── Pedidos de Carlos Mendoza (id=1) ── */
  {
    id: 1,
    clienteId: 1,
    numero: "PED-2024-0041",
    fecha: "2024-03-01",
    estado: "entregado",
    total: 3500.00,
    moneda: "EUR",
    productos: [
      { nombre: "Licencia Software Premium", cantidad: 1, precio: 2500.00 },
      { nombre: "Pack Soporte 12 meses", cantidad: 1, precio: 1000.00 }
    ],
    direccionEntrega: "Calle Gran Vía 45, 3ºB, 28013 Madrid",
    metodoPago: "Tarjeta corporativa",
    tracking: "TK-ES-2024-0041",
    timeline: [
      { estado: "completado", titulo: "Pedido recibido", descripcion: "Tu pedido ha sido registrado correctamente en el sistema.", fecha: "2024-03-01 09:15" },
      { estado: "completado", titulo: "Pago confirmado", descripcion: "El pago ha sido procesado y verificado exitosamente.", fecha: "2024-03-01 09:32" },
      { estado: "completado", titulo: "En preparación", descripcion: "Tu pedido está siendo preparado por nuestro equipo.", fecha: "2024-03-02 10:00" },
      { estado: "completado", titulo: "Enviado", descripcion: "El paquete ha sido enviado con SEUR Express.", fecha: "2024-03-03 14:20" },
      { estado: "completado", titulo: "En tránsito", descripcion: "El paquete está en camino a su destino.", fecha: "2024-03-04 08:45" },
      { estado: "completado", titulo: "Entregado", descripcion: "¡Entregado correctamente! Firmado por: C. Mendoza.", fecha: "2024-03-05 11:30" }
    ]
  },
  {
    id: 2,
    clienteId: 1,
    numero: "PED-2024-0058",
    fecha: "2024-03-15",
    estado: "en-transito",
    total: 890.00,
    moneda: "EUR",
    productos: [
      { nombre: "Monitor 4K 27\"", cantidad: 1, precio: 650.00 },
      { nombre: "Hub USB-C 7 en 1", cantidad: 2, precio: 120.00 }
    ],
    direccionEntrega: "Calle Gran Vía 45, 3ºB, 28013 Madrid",
    metodoPago: "Transferencia",
    tracking: "TK-ES-2024-0058",
    timeline: [
      { estado: "completado", titulo: "Pedido recibido", descripcion: "Tu pedido ha sido registrado correctamente.", fecha: "2024-03-15 16:00" },
      { estado: "completado", titulo: "Pago confirmado", descripcion: "Pago verificado y aprobado.", fecha: "2024-03-15 16:45" },
      { estado: "completado", titulo: "En preparación", descripcion: "Preparando tu pedido en nuestro almacén.", fecha: "2024-03-16 09:00" },
      { estado: "completado", titulo: "Enviado", descripcion: "Enviado con MRW. Número: MRW-847261.", fecha: "2024-03-17 13:10" },
      { estado: "activo",    titulo: "En tránsito", descripcion: "Tu paquete está en camino. Estimado: mañana.", fecha: "2024-03-18 07:30" },
      { estado: "pendiente", titulo: "Entregado", descripcion: "Esperando entrega.", fecha: "" }
    ]
  },
  {
    id: 3,
    clienteId: 1,
    numero: "PED-2024-0071",
    fecha: "2024-03-20",
    estado: "en-proceso",
    total: 1200.00,
    moneda: "EUR",
    productos: [
      { nombre: "Suscripción Anual Suite Pro", cantidad: 1, precio: 1200.00 }
    ],
    direccionEntrega: "Calle Gran Vía 45, 3ºB, 28013 Madrid",
    metodoPago: "Domiciliación",
    tracking: "TK-ES-2024-0071",
    timeline: [
      { estado: "completado", titulo: "Pedido recibido", descripcion: "Suscripción registrada exitosamente.", fecha: "2024-03-20 11:00" },
      { estado: "activo",    titulo: "Pago confirmado", descripcion: "Procesando domiciliación bancaria.", fecha: "2024-03-20 11:05" },
      { estado: "pendiente", titulo: "Activación", descripcion: "Pendiente de activar suscripción.", fecha: "" },
      { estado: "pendiente", titulo: "Acceso habilitado", descripcion: "Pendiente.", fecha: "" }
    ]
  },
  /* ── Pedidos de María González (id=2) ── */
  {
    id: 4,
    clienteId: 2,
    numero: "PED-2024-0035",
    fecha: "2024-02-20",
    estado: "entregado",
    total: 480.00,
    moneda: "EUR",
    productos: [
      { nombre: "Pack diseño redes sociales", cantidad: 1, precio: 280.00 },
      { nombre: "Plantillas Canva Pro", cantidad: 5, precio: 40.00 }
    ],
    direccionEntrega: "Av. Diagonal 200, 08018 Barcelona",
    metodoPago: "PayPal",
    tracking: "TK-ES-2024-0035",
    timeline: [
      { estado: "completado", titulo: "Pedido recibido", descripcion: "Pedido registrado.", fecha: "2024-02-20 10:00" },
      { estado: "completado", titulo: "Pago confirmado", descripcion: "Pago PayPal recibido.", fecha: "2024-02-20 10:02" },
      { estado: "completado", titulo: "Archivos preparados", descripcion: "Diseños finalizados y empaquetados.", fecha: "2024-02-21 15:30" },
      { estado: "completado", titulo: "Entregado", descripcion: "Descargado correctamente por el cliente.", fecha: "2024-02-21 16:00" }
    ]
  },
  {
    id: 5,
    clienteId: 2,
    numero: "PED-2024-0062",
    fecha: "2024-03-18",
    estado: "enviado",
    total: 320.00,
    moneda: "EUR",
    productos: [
      { nombre: "Reportes analítica web mensual", cantidad: 3, precio: 80.00 },
      { nombre: "Informe competencia SEO", cantidad: 1, precio: 80.00 }
    ],
    direccionEntrega: "Av. Diagonal 200, 08018 Barcelona",
    metodoPago: "Transferencia",
    tracking: "TK-ES-2024-0062",
    timeline: [
      { estado: "completado", titulo: "Pedido recibido", descripcion: "Solicitud de informes recibida.", fecha: "2024-03-18 09:00" },
      { estado: "completado", titulo: "En elaboración", descripcion: "Generando informes personalizados.", fecha: "2024-03-18 09:30" },
      { estado: "completado", titulo: "Informes enviados", descripcion: "Enviados por email. Revisa tu bandeja.", fecha: "2024-03-19 14:00" },
      { estado: "activo",    titulo: "Confirmación recepción", descripcion: "Esperando confirmación del cliente.", fecha: "2024-03-19 14:00" }
    ]
  },
  /* ── Pedidos de Juan Pérez (id=3) ── */
  {
    id: 6,
    clienteId: 3,
    numero: "PED-2024-0049",
    fecha: "2024-03-05",
    estado: "entregado",
    total: 4200.00,
    moneda: "EUR",
    productos: [
      { nombre: "Portal web + admin panel", cantidad: 1, precio: 4200.00 }
    ],
    direccionEntrega: "Calle Alcalá 123, 28009 Madrid",
    metodoPago: "Transferencia",
    tracking: "TK-ES-2024-0049",
    timeline: [
      { estado: "completado", titulo: "Proyecto iniciado", descripcion: "Reunión de kickoff realizada.", fecha: "2024-03-05 10:00" },
      { estado: "completado", titulo: "Diseño aprobado", descripcion: "Wireframes y mockups validados.", fecha: "2024-03-08 17:00" },
      { estado: "completado", titulo: "Desarrollo completado", descripcion: "Frontend y backend finalizados.", fecha: "2024-03-18 19:00" },
      { estado: "completado", titulo: "QA y pruebas", descripcion: "Testing completado sin errores críticos.", fecha: "2024-03-20 12:00" },
      { estado: "completado", titulo: "Entregado", descripcion: "Proyecto desplegado en producción.", fecha: "2024-03-22 10:00" }
    ]
  }
];

/* ──────────────────────────────────────────
   MENSAJES DEL CHAT (iniciales hardcodeados)
   El historial se persiste en localStorage.
   ────────────────────────────────────────── */
const MENSAJES_INICIALES = {
  /* Mensajes de bienvenida para el cliente con id=1 */
  1: [
    {
      id: 1,
      autorTipo: "soporte",
      autorNombre: "Soporte Portal",
      texto: "¡Hola Carlos! 👋 Bienvenido al chat de soporte de ClientePortal. ¿En qué podemos ayudarte hoy?",
      fecha: "2024-03-18T09:00:00"
    },
    {
      id: 2,
      autorTipo: "cliente",
      autorNombre: "Carlos Mendoza",
      texto: "Hola, quería saber el estado de mi factura FAC-2024-003, ¿está en revisión?",
      fecha: "2024-03-18T09:05:00"
    },
    {
      id: 3,
      autorTipo: "soporte",
      autorNombre: "Soporte Portal",
      texto: "Claro, revisé tu factura FAC-2024-003. Está pendiente de pago con vencimiento el 10 de abril. ¿Deseas más información o necesitas algún cambio?",
      fecha: "2024-03-18T09:07:00"
    }
  ],
  /* Mensajes iniciales para María González (id=2) */
  2: [
    {
      id: 1,
      autorTipo: "soporte",
      autorNombre: "Soporte Portal",
      texto: "¡Buenas tardes María! 😊 Estamos aquí para ayudarte. ¿Tienes alguna consulta sobre tus pedidos o facturas?",
      fecha: "2024-03-19T15:00:00"
    }
  ],
  /* Mensajes iniciales para Juan Pérez (id=3) */
  3: [
    {
      id: 1,
      autorTipo: "soporte",
      autorNombre: "Soporte Portal",
      texto: "¡Hola Juan! 👋 Bienvenido al soporte de ClientePortal. ¿Cómo podemos ayudarte?",
      fecha: "2024-03-20T10:00:00"
    }
  ]
};

/* ──────────────────────────────────────────
   RESPUESTAS AUTOMÁTICAS DEL CHAT
   El bot responde según palabras clave en el mensaje.
   ────────────────────────────────────────── */
const RESPUESTAS_BOT = [
  {
    palabrasClave: ["factura", "pago", "cobro", "pendiente"],
    respuesta: "Entiendo tu consulta sobre facturación. Puedes ver el detalle de todas tus facturas en la sección 'Facturas' del menú. Si necesitas una copia en PDF o tienes alguna discrepancia, dímelo y lo gestionamos enseguida. 📄"
  },
  {
    palabrasClave: ["pedido", "envío", "entrega", "seguimiento", "tracking"],
    respuesta: "Para ver el estado exacto de tu pedido, dirígete a la sección 'Mis Pedidos' donde encontrarás el timeline completo con cada etapa. Si el estado no se ha actualizado en más de 48h, cuéntame el número de pedido y lo revisamos. 🚚"
  },
  {
    palabrasClave: ["problema", "error", "fallo", "no funciona", "ayuda"],
    respuesta: "Lamentamos los inconvenientes. Nuestro equipo técnico está disponible de lunes a viernes de 9:00 a 18:00. Describe el problema con el mayor detalle posible y te daremos una solución lo antes posible. ⚡"
  },
  {
    palabrasClave: ["gracias", "perfecto", "genial", "excelente", "ok"],
    respuesta: "¡Con mucho gusto! 😊 Es un placer ayudarte. Si necesitas algo más, aquí estaremos. ¡Que tengas un excelente día!"
  },
  {
    palabrasClave: ["precio", "presupuesto", "coste", "tarifa"],
    respuesta: "Para consultas sobre precios o nuevos presupuestos, puedes contactarnos en ventas@clienteportal.com o al +34 900 123 456. Nuestro equipo comercial te atenderá en menos de 24 horas. 💼"
  },
  {
    palabrasClave: ["cancelar", "devolucion", "reembolso", "baja"],
    respuesta: "Entiendo. Para gestionar cancelaciones o devoluciones necesitamos verificar algunos datos. Por favor, envíanos un email a soporte@clienteportal.com indicando el número de pedido/factura y el motivo. Resolveremos tu solicitud en 48-72 horas hábiles. 🔄"
  }
];

/* ──────────────────────────────────────────
   RESPUESTA GENÉRICA DEL BOT
   Se usa cuando no hay palabra clave que coincida.
   ────────────────────────────────────────── */
const RESPUESTA_GENERICA = "Gracias por tu mensaje. Nuestro equipo de soporte lo revisará y te responderemos en breve. Si es urgente, puedes llamarnos al +34 900 123 456 (L-V 9:00-18:00). 🕐";

/* ============================================================
   HELPERS DE LOCALSTORAGE
   Funciones reutilizables para leer/escribir en localStorage
   ============================================================ */

/**
 * Guarda un valor en localStorage serializado como JSON.
 * @param {string} clave - Nombre de la clave
 * @param {*} valor - Valor a almacenar (se serializa automáticamente)
 */
function guardarEnStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
}

/**
 * Lee y deserializa un valor de localStorage.
 * @param {string} clave - Nombre de la clave
 * @param {*} valorPorDefecto - Valor si la clave no existe
 * @returns {*} El valor almacenado o el valor por defecto
 */
function leerDeStorage(clave, valorPorDefecto = null) {
  try {
    const item = localStorage.getItem(clave);
    return item ? JSON.parse(item) : valorPorDefecto;
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    return valorPorDefecto;
  }
}

/**
 * Elimina una clave de localStorage.
 * @param {string} clave - Nombre de la clave a eliminar
 */
function eliminarDeStorage(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.error("Error al eliminar de localStorage:", error);
  }
}

/* ============================================================
   FUNCIONES DE ACCESO A DATOS
   Obtienen datos filtrados por cliente activo.
   ============================================================ */

/**
 * Devuelve las facturas del cliente indicado.
 * @param {number} clienteId - ID del cliente
 * @returns {Array} Facturas filtradas
 */
function obtenerFacturasCliente(clienteId) {
  return FACTURAS.filter(f => f.clienteId === clienteId);
}

/**
 * Devuelve los pedidos del cliente indicado.
 * @param {number} clienteId - ID del cliente
 * @returns {Array} Pedidos filtrados
 */
function obtenerPedidosCliente(clienteId) {
  return PEDIDOS.filter(p => p.clienteId === clienteId);
}

/**
 * Busca un usuario por email y contraseña.
 * Para portafolio: compara la contraseña en texto plano
 * directamente con el campo "password" de cada usuario.
 * @param {string} email
 * @param {string} password - Contraseña en texto plano
 * @returns {Object|null} Usuario encontrado o null
 */
async function buscarUsuario(email, password) {
  return USUARIOS.find(u =>
    u.email.toLowerCase() === email.toLowerCase() &&
    u.password === password
  ) || null;
}


/**
 * Obtiene el usuario actualmente autenticado desde localStorage.
 * @returns {Object|null} Datos del usuario o null si no hay sesión
 */
function obtenerSesionActiva() {
  return leerDeStorage("portal_sesion", null);
}

/**
 * Calcula el resumen financiero de un cliente.
 * @param {number} clienteId
 * @returns {Object} Totales agrupados por estado
 */
function calcularResumenFacturas(clienteId) {
  const facturas = obtenerFacturasCliente(clienteId);
  return {
    total:      facturas.length,
    pagadas:    facturas.filter(f => f.estado === "pagada").length,
    pendientes: facturas.filter(f => f.estado === "pendiente").length,
    vencidas:   facturas.filter(f => f.estado === "vencida").length,
    montoPagado:    facturas.filter(f => f.estado === "pagada").reduce((s, f) => s + f.monto, 0),
    montoPendiente: facturas.filter(f => f.estado !== "pagada").reduce((s, f) => s + f.monto, 0)
  };
}

/**
 * Formatea un número como moneda en euros.
 * @param {number} monto
 * @returns {string} Ejemplo: "1.234,56 €"
 */
function formatearMoneda(monto) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(monto);
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string} fechaISO - Ej: "2024-03-15"
 * @returns {string} Ej: "15 mar 2024"
 */
function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  const fecha = new Date(fechaISO + "T00:00:00"); /* Evita problema de zona horaria */
  return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Devuelve el historial de chat de un cliente.
 * Lee de localStorage o usa los mensajes iniciales hardcodeados.
 * @param {number} clienteId
 * @returns {Array} Lista de mensajes
 */
function obtenerHistorialChat(clienteId) {
  const clave = `portal_chat_${clienteId}`;
  const guardado = leerDeStorage(clave, null);
  /* Si no hay historial guardado, usa los mensajes iniciales */
  if (!guardado) {
    const inicial = MENSAJES_INICIALES[clienteId] || [];
    guardarEnStorage(clave, inicial);
    return inicial;
  }
  return guardado;
}

/**
 * Agrega un nuevo mensaje al historial del chat.
 * @param {number} clienteId
 * @param {Object} mensaje - Objeto con autorTipo, autorNombre, texto, fecha
 * @returns {Array} Historial actualizado
 */
function agregarMensajeChat(clienteId, mensaje) {
  const clave = `portal_chat_${clienteId}`;
  const historial = obtenerHistorialChat(clienteId);
  /* Asigna un ID incremental al nuevo mensaje */
  const nuevoMensaje = {
    ...mensaje,
    id: historial.length + 1
  };
  historial.push(nuevoMensaje);
  guardarEnStorage(clave, historial);
  return historial;
}

/**
 * Selecciona una respuesta automática del bot según el texto del mensaje.
 * @param {string} texto - Texto enviado por el usuario
 * @returns {string} Respuesta del bot
 */
function obtenerRespuestaBot(texto) {
  const textoLower = texto.toLowerCase();
  /* Busca si alguna palabra clave coincide con el mensaje */
  for (const item of RESPUESTAS_BOT) {
    if (item.palabrasClave.some(p => textoLower.includes(p))) {
      return item.respuesta;
    }
  }
  return RESPUESTA_GENERICA;
}
