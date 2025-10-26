const API_BASE = "https://api-repartidor-tm.onrender.com"; // cambia por tu dominio Render al subir
let repartidor = null;
let pedidoActual = null;

// -------- Login --------
async function login() {
  const id = document.getElementById("repartidorId").value;
  if (!id) return alert("Ingrese su ID");

  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (!res.ok) return alert("Repartidor no encontrado");
  repartidor = await res.json();

  mostrarPantalla("pedidos-screen");
  cargarPedidos();
}

// -------- Cerrar sesión --------
function logout() {
  repartidor = null;
  mostrarPantalla("login-screen");
}

// -------- Mostrar pantalla --------
function mostrarPantalla(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// -------- Cargar pedidos --------
async function cargarPedidos() {
  const res = await fetch(`${API_BASE}/pedidos/asignados/${repartidor.id}`);
  const pedidos = await res.json();
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  pedidos.forEach(p => {
    let color = "verde";
    if (p.diaspendientesdeentrega > 3) color = "rojo";
    else if (p.diaspendientesdeentrega >= 2) color = "amarillo";

    const li = document.createElement("li");
    li.className = color;
    li.innerHTML = `
      <strong>Pedido #${p.id}</strong><br>
      Cliente: ${p.cliente_nombre}<br>
      Entrega: ${p.fecha_entrega}<br>
      Estado: ${p.estado}<br>
      <button onclick="verDetalle(${p.id})">Ver detalle</button>
    `;
    lista.appendChild(li);
  });
}

// -------- Ver detalle --------
async function verDetalle(id) {
  const res = await fetch(`${API_BASE}/pedidos/${id}`);
  const p = await res.json();
  pedidoActual = p;

  const div = document.getElementById("detallePedido");
  div.innerHTML = `
    <p><strong>Cliente:</strong> ${p.cliente_nombre}</p>
    <p><strong>Teléfono:</strong> ${p.cliente_telefono}</p>
    <p><strong>Dirección:</strong> ${p.direccion}</p>
    <p><strong>Fecha Entrega:</strong> ${p.fecha_entrega}</p>
    <p><strong>Estado:</strong> ${p.estado}</p>
  `;

  mostrarPantalla("detalle-screen");
}

// -------- Confirmar entrega --------
function mostrarConfirmar() {
  mostrarPantalla("confirmar-screen");
}

async function confirmarEntrega() {
  const comentario = document.getElementById("comentario").value;
  const fotoInput = document.getElementById("foto");
  let firma_foto = null;

  if (fotoInput.files.length > 0) {
    const file = fotoInput.files[0];
    const base64 = await toBase64(file);
    firma_foto = base64;
  }

  const body = {
    pedido_id: pedidoActual.id,
    repartidor_id: repartidor.id,
    firma_foto,
    comentario
  };

  const res = await fetch(`${API_BASE}/entregas/confirmar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("Entrega confirmada correctamente");
    mostrarPantalla("pedidos-screen");
    cargarPedidos();
  } else {
    alert("Error al confirmar entrega");
  }
}

// -------- Utilidades --------
function volverLista() { mostrarPantalla("pedidos-screen"); }
function volverDetalle() { mostrarPantalla("detalle-screen"); }

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
