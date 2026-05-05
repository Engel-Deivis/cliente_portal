/* ============================================================
   FACTURAS.JS — Lógica de la página de facturas
   ============================================================ */

let todasLasFacturas  = [];
let facturasFiltradas = [];
let paginaActual      = 1;
const FACTURAS_POR_PAGINA = 5;

document.addEventListener("DOMContentLoaded", () => {
  const sesion = protegerPagina();
  if (!sesion) return;

  inicializarInterfaz(sesion);

  todasLasFacturas  = obtenerFacturasCliente(sesion.id);
  facturasFiltradas = [...todasLasFacturas];

  renderizarResumenFacturas(sesion.id);
  renderizarTablaFacturas();

  document.getElementById("buscador-facturas")?.addEventListener("input",   aplicarFiltros);
  document.getElementById("filtro-estado")?.addEventListener("change",       aplicarFiltros);
  document.getElementById("cerrar-modal-factura")?.addEventListener("click", cerrarModal);
  document.getElementById("overlay-modal-factura")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) cerrarModal();
  });
});

/* KPIs sin animar-entrada */
function renderizarResumenFacturas(clienteId) {
  const contenedor = document.getElementById("resumen-facturas");
  if (!contenedor) return;
  const r = calcularResumenFacturas(clienteId);

  const kpis = [
    { icono:"fa-layer-group",          etiqueta:"Total",     valor:r.total,      tipo:"primario" },
    { icono:"fa-circle-check",         etiqueta:"Pagadas",   valor:r.pagadas,    tipo:"exito" },
    { icono:"fa-clock",                etiqueta:"Pendientes",valor:r.pendientes, tipo:"advertencia" },
    { icono:"fa-circle-exclamation",   etiqueta:"Vencidas",  valor:r.vencidas,   tipo:r.vencidas>0?"advertencia":"info" }
  ];

  contenedor.innerHTML = kpis.map(k => `
    <div class="tarjeta-estadistica">
      <div class="icono-estadistica ${k.tipo}"><i class="fa-solid ${k.icono}"></i></div>
      <div class="info-estadistica">
        <div class="etiqueta-estadistica">${k.etiqueta}</div>
        <div class="valor-estadistica">${k.valor}</div>
      </div>
    </div>`).join("");
}

function aplicarFiltros() {
  const txt    = document.getElementById("buscador-facturas")?.value.toLowerCase().trim() || "";
  const estado = document.getElementById("filtro-estado")?.value || "";

  facturasFiltradas = todasLasFacturas.filter(f =>
    (!txt    || f.numero.toLowerCase().includes(txt) || f.descripcion.toLowerCase().includes(txt)) &&
    (!estado || f.estado === estado)
  );
  paginaActual = 1;
  renderizarTablaFacturas();
}

/* Tabla sin animar-entrada */
function renderizarTablaFacturas() {
  const cuerpo        = document.getElementById("cuerpo-tabla-facturas");
  const sinResultados = document.getElementById("sin-resultados-facturas");
  if (!cuerpo) return;

  if (!facturasFiltradas.length) {
    cuerpo.innerHTML = "";
    sinResultados && (sinResultados.style.display = "flex");
    renderizarPaginacion(0);
    return;
  }
  sinResultados && (sinResultados.style.display = "none");

  const inicio = (paginaActual - 1) * FACTURAS_POR_PAGINA;
  const pagina = facturasFiltradas.slice(inicio, inicio + FACTURAS_POR_PAGINA);

  cuerpo.innerHTML = pagina.map(f => `
    <tr>
      <td class="monoespaciado texto-primario semibold">${f.numero}</td>
      <td><div style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${f.descripcion}">${f.descripcion}</div></td>
      <td>${formatearFecha(f.fecha)}</td>
      <td class="${f.estado==="vencida"?"texto-error semibold":""}">${formatearFecha(f.vencimiento)}</td>
      <td class="negrita">${formatearMoneda(f.monto)}</td>
      <td><span class="badge-estado ${f.estado}">${etiquetaEstadoF(f.estado)}</span></td>
      <td>
        <button class="boton-accion boton-sm" onclick="abrirModalFactura(${f.id})">
          <i class="fa-solid fa-eye"></i> Ver
        </button>
      </td>
    </tr>`).join("");

  renderizarPaginacion(facturasFiltradas.length);
}

function renderizarPaginacion(total) {
  const contenedor = document.getElementById("paginacion-facturas");
  if (!contenedor) return;

  const totalPaginas = Math.ceil(total / FACTURAS_POR_PAGINA);
  if (totalPaginas <= 1) { contenedor.innerHTML = ""; return; }

  const inicio = (paginaActual - 1) * FACTURAS_POR_PAGINA + 1;
  const fin    = Math.min(paginaActual * FACTURAS_POR_PAGINA, total);

  let botones = "";
  for (let i = 1; i <= totalPaginas; i++)
    botones += `<button class="boton-pagina ${i===paginaActual?"activa":""}" onclick="irAPagina(${i})">${i}</button>`;

  contenedor.innerHTML = `
    <span class="info-paginacion">Mostrando ${inicio}–${fin} de ${total}</span>
    <div class="controles-paginacion">
      <button class="boton-pagina" onclick="irAPagina(${paginaActual-1})" ${paginaActual===1?"disabled":""}>
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      ${botones}
      <button class="boton-pagina" onclick="irAPagina(${paginaActual+1})" ${paginaActual===totalPaginas?"disabled":""}>
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>`;
}

function irAPagina(p) {
  const total = Math.ceil(facturasFiltradas.length / FACTURAS_POR_PAGINA);
  if (p < 1 || p > total) return;
  paginaActual = p;
  renderizarTablaFacturas();
  document.getElementById("tabla-facturas")?.scrollIntoView({ behavior:"smooth", block:"start" });
}

function abrirModalFactura(id) {
  const f = todasLasFacturas.find(x => x.id === id);
  if (!f) return;

  document.getElementById("titulo-modal-factura").textContent = `Factura ${f.numero}`;
  document.getElementById("cuerpo-modal-factura").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <span class="badge-estado ${f.estado}" style="font-size:13px;padding:6px 14px;">${etiquetaEstadoF(f.estado)}</span>
      <span class="monoespaciado texto-primario semibold">${f.numero}</span>
    </div>
    <div class="grilla-detalle">
      <div class="campo-detalle"><span class="etiqueta">Fecha emisión</span><span class="valor">${formatearFecha(f.fecha)}</span></div>
      <div class="campo-detalle"><span class="etiqueta">Vencimiento</span><span class="valor ${f.estado==="vencida"?"texto-error":""}">${formatearFecha(f.vencimiento)}</span></div>
      <div class="campo-detalle"><span class="etiqueta">Método de pago</span><span class="valor">${f.metodoPago}</span></div>
      <div class="campo-detalle"><span class="etiqueta">Moneda</span><span class="valor">${f.moneda}</span></div>
    </div>
    <div class="campo-detalle" style="margin-bottom:16px;">
      <span class="etiqueta">Descripción</span>
      <span class="valor" style="font-size:14px;">${f.descripcion}</span>
    </div>
    <div style="font-size:12px;font-weight:600;color:var(--texto-suave);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Desglose de servicios</div>
    <table class="tabla-items-factura">
      <thead><tr><th>Descripción</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>
        ${f.items.map(i => `
          <tr>
            <td>${i.descripcion}</td>
            <td style="text-align:center">${i.cantidad}</td>
            <td style="text-align:right">${formatearMoneda(i.precio)}</td>
            <td style="text-align:right" class="semibold">${formatearMoneda(i.cantidad*i.precio)}</td>
          </tr>`).join("")}
        <tr class="fila-total">
          <td colspan="3" style="text-align:right;font-size:14px;">Total</td>
          <td style="text-align:right;font-size:16px;color:var(--primario);">${formatearMoneda(f.monto)}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
      ${f.estado==="pendiente"?`<button class="boton-primario" style="width:auto;padding:10px 24px;" onclick="simularPago(${f.id})"><i class="fa-solid fa-credit-card"></i> Pagar ahora</button>`:""}
      <button class="boton-secundario" onclick="cerrarModal()">Cerrar</button>
    </div>`;

  document.getElementById("overlay-modal-factura")?.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  document.getElementById("overlay-modal-factura")?.classList.remove("visible");
  document.body.style.overflow = "";
}

function simularPago(id) {
  cerrarModal();
  mostrarToast("Pago simulado exitosamente. En producción se integraría con la pasarela real.", "exito", 5000);
}

function etiquetaEstadoF(e) {
  return { pagada:"Pagada", pendiente:"Pendiente", vencida:"Vencida" }[e] || e;
}
