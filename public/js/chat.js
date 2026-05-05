/* ============================================================
   CHAT.JS — Lógica del chat de soporte
   ============================================================ */

let sesionChat = null;

document.addEventListener("DOMContentLoaded", () => {
  const sesion = protegerPagina();
  if (!sesion) return;

  sesionChat = sesion;
  inicializarInterfaz(sesion);
  renderizarHistorialChat(sesion.id);

  document.getElementById("boton-enviar-mensaje")?.addEventListener("click", enviarMensaje);

  document.getElementById("campo-mensaje")?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
  });

  /* Auto-expandir textarea */
  document.getElementById("campo-mensaje")?.addEventListener("input", e => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  });

  /* Sugerencias rápidas */
  document.querySelectorAll(".sugerencia").forEach(btn => {
    btn.addEventListener("click", () => {
      const campo = document.getElementById("campo-mensaje");
      if (campo) { campo.value = btn.dataset.texto; campo.focus(); }
    });
  });

  /* Limpiar historial */
  document.getElementById("boton-limpiar-chat")?.addEventListener("click", () => {
    if (confirm("¿Seguro que deseas limpiar el historial del chat?")) {
      eliminarDeStorage(`portal_chat_${sesion.id}`);
      renderizarHistorialChat(sesion.id);
      mostrarToast("Historial limpiado correctamente.", "info");
    }
  });
});

/* Renderiza todos los mensajes del historial */
function renderizarHistorialChat(clienteId) {
  const zona = document.getElementById("zona-mensajes");
  if (!zona) return;

  const historial = obtenerHistorialChat(clienteId);

  if (!historial.length) {
    zona.innerHTML = `
      <div class="estado-vacio" style="margin:auto;">
        <div class="icono-vacio"><i class="fa-solid fa-comments"></i></div>
        <h3>Inicia una conversación</h3>
        <p>Estamos aquí para ayudarte. Escribe tu mensaje o elige una pregunta frecuente.</p>
      </div>`;
    return;
  }

  let fechaAnterior = "";
  zona.innerHTML = historial.map(msg => {
    const fechaMsg = new Date(msg.fecha).toLocaleDateString("es-ES", { day:"2-digit", month:"long", year:"numeric" });
    let sep = "";
    if (fechaMsg !== fechaAnterior) {
      sep = `<div class="separador-fecha">${fechaMsg}</div>`;
      fechaAnterior = fechaMsg;
    }
    return sep + htmlMensaje(msg);
  }).join("");

  zona.scrollTop = zona.scrollHeight;
}

/* Genera el HTML de un mensaje */
function htmlMensaje(msg) {
  const esEnviado = msg.autorTipo === "cliente";
  const hora = new Date(msg.fecha).toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" });
  const avatar = esEnviado
    ? `<div class="avatar-chat usuario">${sesionChat?.avatar || "U"}</div>`
    : `<div class="avatar-chat soporte"><i class="fa-solid fa-headset"></i></div>`;

  return `
    <div class="mensaje ${esEnviado ? "enviado" : "recibido"}">
      ${!esEnviado ? avatar : ""}
      <div>
        <div class="burbuja-mensaje">${msg.texto}</div>
        <div class="hora-mensaje">${hora}</div>
      </div>
      ${esEnviado ? avatar : ""}
    </div>`;
}

/* Envía un mensaje del usuario y genera respuesta del bot */
function enviarMensaje() {
  const campo = document.getElementById("campo-mensaje");
  if (!campo || !sesionChat) return;

  const texto = campo.value.trim();
  if (!texto) return;

  agregarMensajeChat(sesionChat.id, {
    autorTipo:   "cliente",
    autorNombre: sesionChat.nombre,
    texto,
    fecha: new Date().toISOString()
  });

  campo.value = "";
  campo.style.height = "auto";
  renderizarHistorialChat(sesionChat.id);

  mostrarEscribiendo(true);

  setTimeout(() => {
    mostrarEscribiendo(false);
    agregarMensajeChat(sesionChat.id, {
      autorTipo:   "soporte",
      autorNombre: "Soporte Portal",
      texto:       obtenerRespuestaBot(texto),
      fecha:       new Date().toISOString()
    });
    renderizarHistorialChat(sesionChat.id);
  }, 1500 + Math.random() * 1000);
}

function mostrarEscribiendo(mostrar) {
  const el   = document.getElementById("indicador-escribiendo");
  const zona = document.getElementById("zona-mensajes");
  if (!el) return;
  mostrar ? el.classList.add("visible") : el.classList.remove("visible");
  if (mostrar && zona) zona.scrollTop = zona.scrollHeight;
}
