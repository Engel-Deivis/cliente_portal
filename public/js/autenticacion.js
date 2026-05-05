/* ============================================================
   AUTENTICACION.JS — Lógica de inicio y cierre de sesión
   Usa datos hardcodeados de datos.js + localStorage para sesión.
   Compatible 100% con Vercel (no requiere backend).
   ============================================================ */

/* ──────────────────────────────────────────
   CLAVE DE SESIÓN en localStorage
   ────────────────────────────────────────── */
const CLAVE_SESION = "portal_sesion";

/* ──────────────────────────────────────────
   INICIALIZACIÓN AL CARGAR LA PÁGINA DE LOGIN
   ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* ── Este bloque SOLO corre en la página de login (index.html) ──
     Comprobamos que exista el formulario antes de hacer cualquier cosa.
     Sin este guard, el redirect se dispara en TODAS las páginas
     causando un bucle infinito de navegación. */
  const formulario      = document.getElementById("formulario-login");
  if (!formulario) return; /* No es la página de login → salir */

  /* Si ya hay sesión activa, redirige al dashboard */
  if (obtenerSesionActiva()) {
    window.location.href = "dashboard.html";
    return;
  }

  /* Referencias a los elementos del formulario */
  const campoEmail      = document.getElementById("campo-email");
  const campoPassword   = document.getElementById("campo-password");
  const mensajeError    = document.getElementById("mensaje-error");
  const botonSubmit     = document.getElementById("boton-ingresar");
  const togglePass      = document.getElementById("toggle-password");

  /* ── Toggle mostrar/ocultar contraseña ── */
  togglePass.addEventListener("click", () => {
    const oculto = campoPassword.type === "password";
    campoPassword.type = oculto ? "text" : "password";
    /* El ícono del ojo lo maneja el inline script en index.html */
  });

  /* ── Envío del formulario de login ── */
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault(); /* Evita recarga de página */
    ocultarError();
    activarCargando(botonSubmit, true);

    const email    = campoEmail.value.trim();
    const password = campoPassword.value;

    /* Validación básica de campos vacíos */
    if (!email || !password) {
      mostrarError("Por favor completa todos los campos.");
      activarCargando(botonSubmit, false);
      return;
    }

    try {
      /* Busca el usuario con las credenciales dadas */
      const usuario = await buscarUsuario(email, password);

      if (usuario) {
        /* Guarda la sesión en localStorage (sin el hash de la contraseña) */
        const sesion = {
          id:       usuario.id,
          nombre:   usuario.nombre,
          empresa:  usuario.empresa,
          email:    usuario.email,
          rol:      usuario.rol,
          avatar:   usuario.avatar,
          telefono: usuario.telefono,
          /* Timestamp para control de expiración (opcional) */
          inicio:   new Date().toISOString()
        };
        guardarEnStorage(CLAVE_SESION, sesion);

        /* Animación breve antes de redirigir */
        botonSubmit.textContent = "✓ Ingresando...";
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 600);

      } else {
        /* Credenciales incorrectas */
        mostrarError("Email o contraseña incorrectos. Verifica tus datos.");
        /* Sacude el formulario para feedback visual */
        formulario.classList.add("sacudir");
        setTimeout(() => formulario.classList.remove("sacudir"), 500);
        activarCargando(botonSubmit, false);
      }

    } catch (error) {
      console.error("Error en autenticación:", error);
      mostrarError("Ocurrió un error al iniciar sesión. Intenta de nuevo.");
      activarCargando(botonSubmit, false);
    }
  });

  /* ── Limpiar error al escribir en los campos ── */
  campoEmail.addEventListener("input",    ocultarError);
  campoPassword.addEventListener("input", ocultarError);

  /* ── Click en usuarios demo (autocompletar formulario) ── */
  document.querySelectorAll(".usuario-demo").forEach(el => {
    el.addEventListener("click", () => {
      campoEmail.value    = el.dataset.email;
      campoPassword.value = el.dataset.pass;
      ocultarError();
      /* Enfoca el botón para indicar que se puede hacer submit */
      botonSubmit.focus();
    });
  });
});

/* ──────────────────────────────────────────
   FUNCIONES DE UI DEL LOGIN
   ────────────────────────────────────────── */

/** Muestra el mensaje de error con el texto dado. */
function mostrarError(texto) {
  const el = document.getElementById("mensaje-error");
  if (!el) return;
  el.querySelector(".texto-error").textContent = texto;
  el.classList.add("visible");
}

/** Oculta el mensaje de error. */
function ocultarError() {
  const el = document.getElementById("mensaje-error");
  if (!el) return;
  el.classList.remove("visible");
}

/** Activa o desactiva el estado de carga en el botón submit. */
function activarCargando(boton, cargando) {
  if (!boton) return;
  if (cargando) {
    boton.classList.add("cargando");
    boton.textContent = "Verificando...";
    boton.disabled = true;
  } else {
    boton.classList.remove("cargando");
    boton.textContent = "Ingresar al portal";
    boton.disabled = false;
  }
}

/* ──────────────────────────────────────────
   PROTECCIÓN DE PÁGINAS INTERNAS
   Llama esta función en cada página protegida.
   Si no hay sesión, redirige al login.
   ────────────────────────────────────────── */
function protegerPagina() {
  const sesion = obtenerSesionActiva();
  if (!sesion) {
    window.location.href = "index.html";
    return null;
  }
  return sesion;
}

/* ──────────────────────────────────────────
   CERRAR SESIÓN
   Elimina la sesión de localStorage y redirige al login.
   ────────────────────────────────────────── */
function cerrarSesion() {
  eliminarDeStorage(CLAVE_SESION);
  window.location.href = "index.html";
}

/* ──────────────────────────────────────────
   INICIALIZAR SIDEBAR CON DATOS DEL USUARIO
   Se llama en todas las páginas internas.
   ────────────────────────────────────────── */
function inicializarInterfaz(sesion) {
  /* Nombre y empresa en el sidebar */
  const elNombre  = document.getElementById("perfil-nombre");
  const elEmpresa = document.getElementById("perfil-empresa");
  const elAvatar  = document.getElementById("perfil-avatar");

  if (elNombre)  elNombre.textContent  = sesion.nombre;
  if (elEmpresa) elEmpresa.textContent = sesion.empresa;
  if (elAvatar)  elAvatar.textContent  = sesion.avatar;

  /* Botón de cerrar sesión */
  const botonCerrar = document.getElementById("boton-cerrar-sesion");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", cerrarSesion);
  }

  /* ── Menú móvil (hamburguesa) ── */
  const botonMenu  = document.getElementById("boton-menu-movil");
  const sidebar    = document.getElementById("sidebar-principal");
  const overlay    = document.getElementById("overlay-sidebar");

  function abrirSidebar() {
    sidebar?.classList.add("abierto");
    overlay?.classList.add("visible");
    document.body.style.overflow = "hidden"; /* Bloquea scroll del body */
  }

  function cerrarSidebarMovil() {
    sidebar?.classList.remove("abierto");
    overlay?.classList.remove("visible");
    document.body.style.overflow = "";
  }

  botonMenu?.addEventListener("click", abrirSidebar);
  overlay?.addEventListener("click",   cerrarSidebarMovil);

  /* Cierra sidebar al hacer click en un enlace (móvil) */
  sidebar?.querySelectorAll(".nav-enlace").forEach(enlace => {
    enlace.addEventListener("click", cerrarSidebarMovil);
  });

  /* Marcar el enlace activo según la página actual */
  const paginaActual = window.location.pathname.split("/").pop();
  sidebar?.querySelectorAll(".nav-enlace").forEach(enlace => {
    const href = enlace.getAttribute("href");
    if (href === paginaActual) enlace.classList.add("activo");
  });

  /* Inicializa el panel de notificaciones y el de configuración */
  configurarNotificaciones(sesion);
  configurarConfiguracion(sesion);
}

/* ──────────────────────────────────────────
   PANEL DE NOTIFICACIONES
   Dropdown que aparece al pulsar la campana.
   Las notificaciones se generan dinámicamente
   según las facturas y pedidos del cliente.
   ────────────────────────────────────────── */
function configurarNotificaciones(sesion) {
  const botonCampana = document.querySelector('.boton-icono[title="Notificaciones"]');
  if (!botonCampana) return;

  /* Genera notificaciones basadas en los datos reales del cliente */
  const notifs = generarNotificaciones(sesion.id);

  /* Actualiza el punto rojo: muestra solo si hay no leídas */
  const punto = botonCampana.querySelector(".punto-notificacion");
  const noLeidas = notifs.filter(n => !n.leida).length;
  if (punto) punto.style.display = noLeidas > 0 ? "block" : "none";

  /* Crea el panel de notificaciones en el DOM */
  const panel = document.createElement("div");
  panel.id = "panel-notificaciones";
  panel.className = "panel-notificaciones";

  panel.innerHTML = `
    <div class="panel-notif-cabecera">
      <span><i class="fa-solid fa-bell" style="margin-right:8px;color:var(--primario);"></i>Notificaciones</span>
      <button class="boton-leer-todo" id="marcar-leido-btn">Marcar todo leído</button>
    </div>
    <div class="lista-notificaciones" id="lista-notifs-panel">
      ${notifs.length ? notifs.map(n => `
        <div class="item-notificacion ${n.leida ? "leida" : ""}">
          <div class="icono-notif ${n.tipo}"><i class="fa-solid ${n.icono}"></i></div>
          <div class="contenido-notif">
            <div class="titulo-notif">${n.titulo}</div>
            <div class="desc-notif">${n.descripcion}</div>
            <div class="tiempo-notif">${n.tiempo}</div>
          </div>
          ${!n.leida ? '<span class="punto-no-leida"></span>' : ""}
        </div>`).join("") : `
        <div style="padding:28px;text-align:center;color:var(--texto-suave);">
          <i class="fa-solid fa-check-circle" style="font-size:28px;margin-bottom:8px;display:block;color:var(--exito);"></i>
          Todo al día, sin notificaciones pendientes.
        </div>`}
    </div>
  `;

  document.body.appendChild(panel);

  /* Abre / cierra el panel al hacer click en la campana */
  botonCampana.addEventListener("click", (e) => {
    e.stopPropagation();
    const abierto = panel.classList.contains("visible");
    /* Cierra el panel de configuración si está abierto */
    document.getElementById("panel-configuracion")?.classList.remove("abierto");
    document.getElementById("overlay-config")?.classList.remove("visible");

    if (!abierto) {
      /* Posiciona el panel debajo del botón */
      const rect = botonCampana.getBoundingClientRect();
      panel.style.top  = (rect.bottom + 8) + "px";
      panel.style.right = (window.innerWidth - rect.right) + "px";
      panel.classList.add("visible");
    } else {
      panel.classList.remove("visible");
    }
  });

  /* Cierra al hacer click fuera */
  document.addEventListener("click", () => panel.classList.remove("visible"));
  panel.addEventListener("click", (e) => e.stopPropagation());

  /* Marcar todo como leído */
  panel.querySelector("#marcar-leido-btn")?.addEventListener("click", () => {
    panel.querySelectorAll(".item-notificacion").forEach(el => el.classList.add("leida"));
    panel.querySelectorAll(".punto-no-leida").forEach(el => el.remove());
    if (punto) punto.style.display = "none";
  });
}

/* Genera notificaciones a partir de los datos reales del cliente */
function generarNotificaciones(clienteId) {
  const notifs = [];
  const facturas = obtenerFacturasCliente(clienteId);
  const pedidos  = obtenerPedidosCliente(clienteId);

  /* Facturas vencidas — urgente */
  facturas.filter(f => f.estado === "vencida").forEach(f => {
    notifs.push({ tipo:"error", icono:"fa-circle-exclamation", leida:false,
      titulo: "Factura vencida",
      descripcion: `${f.numero} — ${formatearMoneda(f.monto)} sin pagar`,
      tiempo: `Venció el ${formatearFecha(f.vencimiento)}`
    });
  });

  /* Facturas pendientes — aviso */
  facturas.filter(f => f.estado === "pendiente").forEach(f => {
    notifs.push({ tipo:"advertencia", icono:"fa-clock", leida:false,
      titulo: "Pago pendiente",
      descripcion: `${f.numero} — ${formatearMoneda(f.monto)}`,
      tiempo: `Vence el ${formatearFecha(f.vencimiento)}`
    });
  });

  /* Pedidos en tránsito — info */
  pedidos.filter(p => p.estado === "en-transito").forEach(p => {
    notifs.push({ tipo:"info", icono:"fa-truck", leida:true,
      titulo: "Pedido en camino",
      descripcion: `${p.numero} está en tránsito`,
      tiempo: "Entrega estimada próximamente"
    });
  });

  /* Pedidos entregados recientes — éxito */
  pedidos.filter(p => p.estado === "entregado").slice(0, 1).forEach(p => {
    notifs.push({ tipo:"exito", icono:"fa-circle-check", leida:true,
      titulo: "Pedido entregado",
      descripcion: `${p.numero} fue entregado correctamente`,
      tiempo: formatearFecha(p.fecha)
    });
  });

  return notifs.slice(0, 6);
}

/* ──────────────────────────────────────────
   PANEL DE CONFIGURACIÓN
   Panel lateral que desliza desde la derecha.
   Muestra el perfil del usuario y opciones básicas.
   ────────────────────────────────────────── */
function configurarConfiguracion(sesion) {
  const botonConfig = document.querySelector('.boton-icono[title="Configuración"]');
  if (!botonConfig) return;

  /* Overlay oscuro detrás del panel */
  const overlay = document.createElement("div");
  overlay.id = "overlay-config";
  overlay.style.cssText = `
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.5); z-index:149;
    backdrop-filter:blur(3px);`;
  document.body.appendChild(overlay);

  /* Panel lateral deslizante */
  const panel = document.createElement("div");
  panel.id = "panel-configuracion";
  panel.className = "panel-configuracion";

  panel.innerHTML = `
    <div class="config-cabecera">
      <h3><i class="fa-solid fa-gear" style="margin-right:8px;color:var(--primario);"></i>Configuración</h3>
      <button class="boton-cerrar-modal" id="cerrar-config-btn" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Perfil del usuario -->
    <div class="config-seccion">
      <div class="config-seccion-titulo">Mi perfil</div>
      <!-- Avatar grande -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--primario),var(--secundario));
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:700;color:#fff;flex-shrink:0;">${sesion.avatar}</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--texto-principal);">${sesion.nombre}</div>
          <div style="font-size:12px;color:var(--texto-suave);margin-top:2px;">${sesion.rol === "admin" ? "Administrador" : "Cliente"}</div>
        </div>
      </div>
      <div class="config-campo"><label>Correo electrónico</label><span>${sesion.email}</span></div>
      <div class="config-campo"><label>Empresa</label><span>${sesion.empresa}</span></div>
      <div class="config-campo"><label>Teléfono</label><span>${sesion.telefono || "—"}</span></div>
    </div>

    <!-- Preferencias visuales -->
    <div class="config-seccion">
      <div class="config-seccion-titulo">Apariencia</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;">
        <div>
          <div style="font-size:14px;font-weight:500;color:var(--texto-principal);">Tema oscuro</div>
          <div style="font-size:12px;color:var(--texto-suave);">Interfaz actual del portal</div>
        </div>
        <div style="width:44px;height:24px;background:var(--primario);border-radius:999px;
          display:flex;align-items:center;padding:3px;cursor:default;" title="Tema oscuro activo">
          <div style="width:18px;height:18px;background:#fff;border-radius:50%;margin-left:auto;"></div>
        </div>
      </div>
    </div>

    <!-- Información de la cuenta -->
    <div class="config-seccion">
      <div class="config-seccion-titulo">Cuenta</div>
      <div class="config-campo">
        <label>Fecha de registro</label>
        <span>${sesion.fechaRegistro ? formatearFecha(sesion.fechaRegistro) : "—"}</span>
      </div>
      <div class="config-campo">
        <label>Estado de cuenta</label>
        <span style="color:var(--exito);">
          <i class="fa-solid fa-circle-check" style="margin-right:4px;"></i>Activa
        </span>
      </div>
      <div class="config-campo">
        <label>Sesión iniciada</label>
        <span style="font-size:13px;">${sesion.inicio ? new Date(sesion.inicio).toLocaleString("es-ES") : "—"}</span>
      </div>
    </div>

    <!-- Acciones -->
    <div style="padding:20px 24px;">
      <button class="boton-primario" style="margin-bottom:10px;" onclick="cerrarSesion()">
        <i class="fa-solid fa-right-from-bracket"></i> &nbsp;Cerrar sesión
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  function abrirConfig() {
    /* Cierra el panel de notificaciones si está abierto */
    document.getElementById("panel-notificaciones")?.classList.remove("visible");
    panel.classList.add("abierto");
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function cerrarConfig() {
    panel.classList.remove("abierto");
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  botonConfig.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.contains("abierto") ? cerrarConfig() : abrirConfig();
  });

  overlay.addEventListener("click", cerrarConfig);
  panel.querySelector("#cerrar-config-btn")?.addEventListener("click", cerrarConfig);
}

/* ──────────────────────────────────────────
   SISTEMA DE NOTIFICACIONES TOAST
   Muestra mensajes flotantes temporales.
   ────────────────────────────────────────── */
function mostrarToast(mensaje, tipo = "info", duracion = 4000) {
  const contenedor = document.getElementById("contenedor-toast");
  if (!contenedor) return;

  /* Crea el elemento del toast */
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  /* Ícono FA según el tipo */
  const iconos = {
    exito:       '<i class="fa-solid fa-circle-check"></i>',
    error:       '<i class="fa-solid fa-circle-xmark"></i>',
    info:        '<i class="fa-solid fa-circle-info"></i>',
    advertencia: '<i class="fa-solid fa-triangle-exclamation"></i>'
  };

  toast.innerHTML = `
    <span class="icono-toast">${iconos[tipo] || iconos.info}</span>
    <span>${mensaje}</span>
  `;

  contenedor.appendChild(toast);

  /* Elimina el toast después de la duración definida */
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duracion);
}
