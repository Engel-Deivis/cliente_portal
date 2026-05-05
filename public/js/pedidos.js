/* ============================================================
   PEDIDOS.JS — Lógica de la página de pedidos y seguimiento
   ============================================================ */

let todosPedidos     = [];
let pedidosFiltrados = [];

document.addEventListener("DOMContentLoaded", () => {
  const sesion = protegerPagina();
  if (!sesion) return;

  inicializarInterfaz(sesion);

  todosPedidos     = obtenerPedidosCliente(sesion.id);
  pedidosFiltrados = [...todosPedidos];

  renderizarEstadisticasPedidos();
  renderizarTarjetasPedidos();

  document.getElementById("filtro-pedido-estado")?.addEventListener("change", e => {
    pedidosFiltrados = e.target.value
      ? todosPedidos.filter(p => p.estado === e.target.value)
      : [...todosPedidos];
    renderizarTarjetasPedidos();
  });

  document.getElementById("cerrar-modal-pedido")?.addEventListener("click",   cerrarModalPedido);
  document.getElementById("overlay-modal-pedido")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) cerrarModalPedido();
  });
});

/* KPIs sin animar-entrada */
function renderizarEstadisticasPedidos() {
  const contenedor = document.getElementById("estadisticas-pedidos");
  if (!contenedor) return;

  const s = {
    total:      todosPedidos.length,
    activos:    todosPedidos.filter(p => !["entregado","cancelado"].includes(p.estado)).length,
    enTransito: todosPedidos.filter(p => p.estado === "en-transito").length,
    entregados: todosPedidos.filter(p => p.estado === "entregado").length
  };

  contenedor.innerHTML = [
    { icono:"fa-boxes-stacked",  etiqueta:"Total pedidos",  valor:s.total,      tipo:"primario" },
    { icono:"fa-rotate",         etiqueta:"Activos",        valor:s.activos,    tipo:"advertencia" },
    { icono:"fa-truck",          etiqueta:"En tránsito",    valor:s.enTransito, tipo:"info" },
    { icono:"fa-circle-check",   etiqueta:"Entregados",     valor:s.entregados, tipo:"exito" }
  ].map(k => `
    <div class="tarjeta-estadistica">
      <div class="icono-estadistica ${k.tipo}"><i class="fa-solid ${k.icono}"></i></div>
      <div class="info-estadistica">
        <div class="etiqueta-estadistica">${k.etiqueta}</div>
        <div class="valor-estadistica">${k.valor}</div>
      </div>
    </div>`).join("");
}

/* Tarjetas de pedidos sin animar-entrada */
function renderizarTarjetasPedidos() {
  const grid      = document.getElementById("grid-pedidos");
  const sinPedidos = document.getElementById("sin-pedidos");
  if (!grid) return;

  if (!pedidosFiltrados.length) {
    grid.innerHTML = "";
    sinPedidos && (sinPedidos.style.display = "flex");
    return;
  }
  sinPedidos && (sinPedidos.style.display = "none");

  grid.innerHTML = pedidosFiltrados.map(p => {
    const completados = p.timeline.filter(e => e.estado === "completado").length;
    const progreso    = Math.round((completados / p.timeline.length) * 100);
    const info        = infoEstado(p.estado);

    return `
      <div class="tarjeta-pedido">
        <div class="cabecera-pedido">
          <div>
            <div class="monoespaciado texto-primario semibold" style="font-size:15px;">${p.numero}</div>
            <div style="font-size:12px;color:var(--texto-suave);margin-top:2px;">
              <i class="fa-solid fa-calendar-days"></i> ${formatearFecha(p.fecha)}
            </div>
          </div>
          <span class="badge-estado ${p.estado}">${info.etiqueta}</span>
        </div>

        <div class="cuerpo-pedido">
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--texto-suave);margin-bottom:6px;">
              <span>Progreso del pedido</span>
              <span class="semibold">${progreso}%</span>
            </div>
            <div class="barra-progreso-pedido">
              <div class="relleno-progreso" style="width:${progreso}%"></div>
            </div>
          </div>

          <div style="font-size:13px;color:var(--texto-secundario);margin-bottom:12px;">
            <i class="fa-solid ${info.icono}"></i> ${etapaActual(p)}
          </div>

          <div class="separador"></div>

          <div style="font-size:11px;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px;">
            Productos (${p.productos.length})
          </div>
          <ul class="lista-productos-pedido">
            ${p.productos.map(pr => `
              <li>
                <span>${pr.nombre} × ${pr.cantidad}</span>
                <span class="producto-precio">${formatearMoneda(pr.precio * pr.cantidad)}</span>
              </li>`).join("")}
          </ul>

          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--borde);margin-top:4px;">
            <span style="font-size:13px;color:var(--texto-suave);">Total</span>
            <span class="negrita" style="font-size:15px;">${formatearMoneda(p.total)}</span>
          </div>

          <div style="font-size:12px;color:var(--texto-suave);padding:8px 10px;background:var(--fondo-tarjeta);border-radius:var(--radio-sm);margin-top:8px;">
            <i class="fa-solid fa-location-dot"></i> ${p.direccionEntrega}
          </div>

          ${p.tracking ? `
            <div style="font-size:12px;color:var(--texto-secundario);margin-top:8px;">
              <i class="fa-solid fa-magnifying-glass"></i> Tracking:
              <span class="monoespaciado texto-primario">${p.tracking}</span>
            </div>` : ""}

          <button class="boton-ver-timeline" onclick="abrirModalTimeline(${p.id})">
            <i class="fa-solid fa-timeline"></i> Ver seguimiento completo
          </button>
        </div>
      </div>`;
  }).join("");
}

function abrirModalTimeline(id) {
  const p = todosPedidos.find(x => x.id === id);
  if (!p) return;

  const info = infoEstado(p.estado);
  document.getElementById("titulo-modal-pedido").textContent = `Seguimiento — ${p.numero}`;
  document.getElementById("cuerpo-modal-pedido").innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;padding:12px;background:var(--fondo-tarjeta);border:1px solid var(--borde);border-radius:var(--radio);">
        <div style="font-size:11px;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;">Estado</div>
        <span class="badge-estado ${p.estado}" style="margin-top:6px;display:inline-block;">${info.etiqueta}</span>
      </div>
      <div style="flex:1;min-width:120px;padding:12px;background:var(--fondo-tarjeta);border:1px solid var(--borde);border-radius:var(--radio);">
        <div style="font-size:11px;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;">Total</div>
        <div style="font-size:16px;font-weight:700;color:var(--texto-principal);margin-top:4px;">${formatearMoneda(p.total)}</div>
      </div>
      <div style="flex:1;min-width:120px;padding:12px;background:var(--fondo-tarjeta);border:1px solid var(--borde);border-radius:var(--radio);">
        <div style="font-size:11px;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;">Tracking</div>
        <div class="monoespaciado texto-primario" style="font-size:12px;font-weight:600;margin-top:4px;">${p.tracking||"—"}</div>
      </div>
    </div>

    <div style="font-size:12px;font-weight:600;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
      <i class="fa-solid fa-route"></i> Historial de seguimiento
    </div>

    <div class="timeline-seguimiento">
      ${p.timeline.map(ev => `
        <div class="timeline-evento">
          <div class="timeline-punto ${ev.estado}">
            ${ev.estado==="completado"?'<i class="fa-solid fa-check" style="font-size:8px;"></i>':ev.estado==="activo"?'<i class="fa-solid fa-circle" style="font-size:6px;"></i>':""}
          </div>
          <div class="timeline-contenido" style="${ev.estado==="pendiente"?"opacity:0.45":""}">
            <div class="timeline-titulo">${ev.titulo}</div>
            <div class="timeline-descripcion">${ev.descripcion}</div>
            ${ev.fecha
              ? `<div class="timeline-fecha"><i class="fa-solid fa-calendar"></i> ${ev.fecha}</div>`
              : `<div class="timeline-fecha" style="opacity:0.4;">Pendiente</div>`}
          </div>
        </div>`).join("")}
    </div>

    <div style="margin-top:20px;display:flex;justify-content:flex-end;">
      <button class="boton-secundario" onclick="cerrarModalPedido()">Cerrar</button>
    </div>`;

  document.getElementById("overlay-modal-pedido")?.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function cerrarModalPedido() {
  document.getElementById("overlay-modal-pedido")?.classList.remove("visible");
  document.body.style.overflow = "";
}

function infoEstado(e) {
  return {
    "en-proceso":  { etiqueta:"En proceso",  icono:"fa-rotate" },
    "enviado":     { etiqueta:"Enviado",      icono:"fa-envelope-open" },
    "en-transito": { etiqueta:"En tránsito",  icono:"fa-truck" },
    "entregado":   { etiqueta:"Entregado",    icono:"fa-circle-check" },
    "cancelado":   { etiqueta:"Cancelado",    icono:"fa-ban" }
  }[e] || { etiqueta:e, icono:"fa-box" };
}

function etapaActual(p) {
  const activo = p.timeline.find(e => e.estado === "activo");
  if (activo) return activo.titulo;
  const completados = p.timeline.filter(e => e.estado === "completado");
  return completados.length ? completados[completados.length-1].titulo : "Pendiente";
}
