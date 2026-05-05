/* ============================================================
   DASHBOARD.JS — Lógica del panel principal
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const sesion = protegerPagina();
  if (!sesion) return;

  inicializarInterfaz(sesion);
  renderizarSaludo(sesion);

  const facturas = obtenerFacturasCliente(sesion.id);
  const pedidos  = obtenerPedidosCliente(sesion.id);
  const resumen  = calcularResumenFacturas(sesion.id);

  renderizarEstadisticas(resumen, pedidos);
  renderizarFacturasRecientes(facturas);
  renderizarPedidosActivos(pedidos);
  renderizarResumenFinanciero(resumen);
});

/* Saludo personalizado con hora del día */
function renderizarSaludo(sesion) {
  const hora  = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
  const nombre = sesion.nombre.split(" ")[0];

  const elSaludo = document.getElementById("saludo-usuario");
  const elFecha  = document.getElementById("fecha-hoy");

  if (elSaludo) elSaludo.textContent = `${saludo}, ${nombre} 👋`;
  if (elFecha) {
    const f = new Date().toLocaleDateString("es-ES", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    elFecha.textContent = f.charAt(0).toUpperCase() + f.slice(1);
  }
}

/* Tarjetas KPI — sin animar-entrada para evitar parpadeo */
function renderizarEstadisticas(resumen, pedidos) {
  const contenedor = document.getElementById("grid-estadisticas");
  if (!contenedor) return;

  const pedidosActivos = pedidos.filter(p => p.estado !== "entregado").length;

  const stats = [
    { icono: "fa-file-invoice-dollar", etiqueta: "Total facturas",  valor: resumen.total,                      tendencia: `${resumen.pagadas} pagadas`,      tipo: "primario" },
    { icono: "fa-circle-check",        etiqueta: "Monto pagado",    valor: formatearMoneda(resumen.montoPagado), tendencia: `${resumen.pagadas} facturas`,      tipo: "exito" },
    { icono: "fa-clock",               etiqueta: "Por pagar",       valor: formatearMoneda(resumen.montoPendiente), tendencia: `${resumen.pendientes + resumen.vencidas} facturas`, tipo: resumen.vencidas > 0 ? "advertencia" : "info" },
    { icono: "fa-boxes-stacked",       etiqueta: "Pedidos activos", valor: pedidosActivos,                     tendencia: `${pedidos.length} en total`,       tipo: "info" }
  ];

  contenedor.innerHTML = stats.map(s => `
    <div class="tarjeta-estadistica">
      <div class="icono-estadistica ${s.tipo}"><i class="fa-solid ${s.icono}"></i></div>
      <div class="info-estadistica">
        <div class="etiqueta-estadistica">${s.etiqueta}</div>
        <div class="valor-estadistica">${s.valor}</div>
        <div class="tendencia-estadistica neutral">${s.tendencia}</div>
      </div>
    </div>
  `).join("");
}

/* Facturas recientes — sin animar-entrada */
function renderizarFacturasRecientes(facturas) {
  const contenedor = document.getElementById("lista-facturas-recientes");
  if (!contenedor) return;

  const recientes = [...facturas].sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);

  if (!recientes.length) {
    contenedor.innerHTML = `<div class="estado-vacio"><div class="icono-vacio"><i class="fa-solid fa-file-invoice-dollar"></i></div><h3>Sin facturas</h3></div>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="contenedor-tabla">
      <table class="tabla-datos">
        <thead><tr><th>Número</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
        <tbody>
          ${recientes.map(f => `
            <tr>
              <td class="monoespaciado texto-primario">${f.numero}</td>
              <td>${formatearFecha(f.fecha)}</td>
              <td class="negrita">${formatearMoneda(f.monto)}</td>
              <td><span class="badge-estado ${f.estado}">${etiquetaEstado(f.estado)}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

/* Pedidos activos — sin animar-entrada */
function renderizarPedidosActivos(pedidos) {
  const contenedor = document.getElementById("lista-pedidos-activos");
  if (!contenedor) return;

  const activos = pedidos.filter(p => p.estado !== "entregado");

  if (!activos.length) {
    contenedor.innerHTML = `<div class="estado-vacio"><div class="icono-vacio"><i class="fa-solid fa-boxes-stacked"></i></div><h3>Sin pedidos activos</h3><p>Todos tus pedidos han sido entregados.</p></div>`;
    return;
  }

  contenedor.innerHTML = activos.map(p => {
    const completados = p.timeline.filter(e => e.estado === "completado").length;
    const progreso    = Math.round((completados / p.timeline.length) * 100);
    return `
      <div style="padding:14px 0; border-bottom:1px solid var(--borde);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <div class="negrita monoespaciado texto-primario" style="font-size:13px;">${p.numero}</div>
            <div style="font-size:12px;color:var(--texto-suave);">${formatearFecha(p.fecha)}</div>
          </div>
          <span class="badge-estado ${p.estado}">${etiquetaEstado(p.estado)}</span>
        </div>
        <div style="height:4px;background:var(--borde);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${progreso}%;background:linear-gradient(90deg,var(--primario),var(--secundario));border-radius:999px;"></div>
        </div>
        <div style="font-size:11px;color:var(--texto-suave);margin-top:4px;">${progreso}% completado</div>
      </div>`;
  }).join("") + `<div style="padding-top:12px;"><a href="pedidos.html" class="boton-accion boton-sm" style="width:100%;justify-content:center;">Ver detalles <i class="fa-solid fa-arrow-right"></i></a></div>`;
}

/* Resumen financiero */
function renderizarResumenFinanciero(resumen) {
  const contenedor = document.getElementById("resumen-financiero");
  if (!contenedor) return;

  const totalMonto = resumen.montoPagado + resumen.montoPendiente || 1;

  const cats = [
    { etiqueta:"Facturas pagadas",   monto:resumen.montoPagado,    porcentaje:Math.round((resumen.montoPagado/totalMonto)*100),    color:"var(--exito)",      cantidad:resumen.pagadas },
    { etiqueta:"Por cobrar / vencer", monto:resumen.montoPendiente, porcentaje:Math.round((resumen.montoPendiente/totalMonto)*100), color:"var(--advertencia)", cantidad:resumen.pendientes + resumen.vencidas }
  ];

  contenedor.innerHTML = cats.map(c => `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <span style="font-size:14px;font-weight:600;color:var(--texto-principal);">${c.etiqueta}</span>
          <span style="font-size:12px;color:var(--texto-suave);margin-left:8px;">${c.cantidad} factura${c.cantidad!==1?"s":""}</span>
        </div>
        <span style="font-size:14px;font-weight:700;color:var(--texto-principal);">${formatearMoneda(c.monto)}</span>
      </div>
      <div style="height:8px;background:var(--borde);border-radius:999px;overflow:hidden;">
        <div style="height:100%;width:${c.porcentaje}%;background:${c.color};border-radius:999px;"></div>
      </div>
      <div style="font-size:11px;color:var(--texto-suave);margin-top:4px;">${c.porcentaje}% del total</div>
    </div>`).join("");
}

function etiquetaEstado(e) {
  return { pagada:"Pagada", pendiente:"Pendiente", vencida:"Vencida", entregado:"Entregado", "en-proceso":"En proceso", "en-transito":"En tránsito", enviado:"Enviado", cancelado:"Cancelado" }[e] || e;
}
