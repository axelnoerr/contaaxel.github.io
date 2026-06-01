
let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
let compras = JSON.parse(localStorage.getItem("compras")) || [];
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

const formCompra = document.getElementById("formCompra");
formCompra.addEventListener("submit", guardarCompra);

function guardarCompra(e) {
    e.preventDefault();

    // OBTENEMOS Y LIMPIAMOS LOS DATOS
    const producto = document.getElementById("producto").value.trim();
    const cantidad = Number(document.getElementById("cantidad").value);
    const costo = Number(document.getElementById("costo").value);

    // 🛑 VALIDACIONES IMPORTANTES (Evita errores y datos malos)
    if (!producto) {
        alert("El nombre del producto no puede estar vacío");
        return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("La cantidad debe ser un número mayor a 0");
        return;
    }
    if (isNaN(costo) || costo <= 0) {
        alert("El costo debe ser un número mayor a 0");
        return;
    }

    const compra = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        producto,
        cantidad,
        costo
    };

    compras.push(compra);
    localStorage.setItem("compras", JSON.stringify(compras));

    generarAsientoCompra(compra);
    actualizarInventario(compra);
    formCompra.reset();
    
    // 🔄 ACTUALIZAMOS LAS TABLAS DESPUÉS DE GUARDAR
    mostrarCompras();
    actualizarDashboard(); // <-- NUEVO: actualiza el resumen
    alert("Compra registrada correctamente");
}

function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
}

function actualizarInventario(compra) {
    const productoExistente = inventario.find(item => 
        item.producto.toLowerCase() === compra.producto.toLowerCase()
    );

    if (productoExistente) {
        // ✅ MEJORA: Actualizamos existencia y calculamos COSTO PROMEDIO (más correcto contablemente)
        let valorAnterior = productoExistente.existencia * productoExistente.costo;
        let valorNuevo = compra.cantidad * compra.costo;
        let totalCantidad = productoExistente.existencia + compra.cantidad;
        
        productoExistente.existencia += compra.cantidad;
        // Costo promedio ponderado
        productoExistente.costo = (valorAnterior + valorNuevo) / totalCantidad; 

    } else {
        inventario.push({
            producto: compra.producto,
            existencia: compra.cantidad,
            costo: compra.costo
        });
    }
    localStorage.setItem("inventario", JSON.stringify(inventario));
    mostrarInventario(); // Aseguramos que se refresque la vista
}

function mostrarInventario() {
    const tabla = document.getElementById("tablaInventario");
    tabla.innerHTML = "";

    // 🛑 SI NO HAY DATOS, MOSTRAMOS MENSAJE
    if (inventario.length === 0) {
        tabla.innerHTML = "<tr><td colspan='3'>Sin registros</td></tr>";
        return;
    }

    inventario.forEach(item => {
        // Formateamos moneda para que se vea profesional
        tabla.innerHTML += `
            <tr>
                <td>${item.producto}</td>
                <td>${item.existencia}</td>
                <td>$${item.costo.toFixed(2)}</td>
            </tr>
        `;
    });
}

function mostrarCompras() {
    const tabla = document.getElementById("tablaCompras");
    tabla.innerHTML = "";

    if (compras.length === 0) {
        tabla.innerHTML = "<tr><td colspan='4'>Sin registros</td></tr>";
        return;
    }

    compras.forEach(compra => {
        tabla.innerHTML += `
            <tr>
                <td>${compra.fecha}</td>
                <td>${compra.producto}</td>
                <td>${compra.cantidad}</td>
                <td>$${compra.costo.toFixed(2)}</td>
            </tr>
        `;
    });
}

function generarAsientoCompra(compra) {
    const subtotal = compra.cantidad * compra.costo;

    const asiento = {
        id: Date.now(),
        fecha: compra.fecha,
        concepto: `Compra de ${compra.producto}`,
        debe: [{
            cuenta: "Almacén MP",
            monto: subtotal
        }],
        haber: [{
            cuenta: "Proveedores",
            monto: subtotal
        }]
    };

    asientos.push(asiento);
    localStorage.setItem("asientos", JSON.stringify(asientos));
    
    mostrarAsientos(); // 🔄 Refrescamos la vista de asientos
}

function mostrarAsientos() {
    const contenedor = document.getElementById("listaAsientos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (asientos.length === 0) {
        contenedor.innerHTML = "<p>Sin asientos registrados</p>";
        return;
    }

    asientos.forEach(asiento => {
        contenedor.innerHTML += `
        <div class="asiento">
            <h3>${asiento.concepto}</h3>
            <p>${asiento.fecha}</p>
            <table>
                <tr>
                    <th>Cuenta</th>
                    <th>Debe</th>
                    <th>Haber</th>
                </tr>
                <tr>
                    <td>${asiento.debe[0].cuenta}</td>
                    <td>$${asiento.debe[0].monto.toFixed(2)}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${asiento.haber[0].cuenta}</td>
                    <td></td>
                    <td>$${asiento.haber[0].monto.toFixed(2)}</td>
                </tr>
            </table>
        </div>
        `;
    });
}

// 🚀 CARGA INICIAL DE DATOS AL ABRIR LA PÁGINA
mostrarInventario();
mostrarCompras();
mostrarAsientos();

// ==================================================
// ➕ FUNCIONALIDADES NUEVAS (LO QUE FALTABA)
// ==================================================

// ---------------------------
// 📦 VARIABLES NUEVAS
// ---------------------------
let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

// ---------------------------
// 📊 DASHBOARD
// ---------------------------
function actualizarDashboard() {
    // Total Compras
    const totalCompras = compras.reduce((acc, c) => acc + (c.cantidad * c.costo), 0);
    document.getElementById("totalCompras").textContent = `$${totalCompras.toFixed(2)}`;

    // Valor Total Inventario
    const valorInventario = inventario.reduce((acc, i) => acc + (i.existencia * i.costo), 0);
    document.getElementById("totalInventario").textContent = `$${valorInventario.toFixed(2)}`;

    // Total Órdenes
    document.getElementById("totalOrdenes").textContent = ordenes.length;

    // Total Ventas
    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
    document.getElementById("totalVentas").textContent = `$${totalVentas.toFixed(2)}`;
}

// ---------------------------
// 🏭 ÓRDENES DE PRODUCCIÓN
// ---------------------------
// Insertamos formulario y tabla dinámicamente en tu HTML
const secOrdenes = document.getElementById("ordenes");
secOrdenes.innerHTML = `
    <form id="formOrden">
        <input type="text" id="prodFabricado" placeholder="Producto final" required>
        <input type="number" id="cantFabricada" placeholder="Cantidad a producir" required>
        <input type="text" id="materiaUsada" placeholder="Materia prima consumida" required>
        <input type="number" id="cantMateriaUsada" placeholder="Cantidad consumida" required>
        <button type="submit">Registrar Producción</button>
    </form>
    <table style="margin-top:2rem;">
        <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Materia Prima Usada</th></tr>
        </thead>
        <tbody id="tablaOrdenes"></tbody>
    </table>
`;

const formOrden = document.getElementById("formOrden");
formOrden.addEventListener("submit", guardarOrden);

function guardarOrden(e) {
    e.preventDefault();
    
    const producto = document.getElementById("prodFabricado").value.trim();
    const cantidad = Number(document.getElementById("cantFabricada").value);
    const materia = document.getElementById("materiaUsada").value.trim();
    const cantMateria = Number(document.getElementById("cantMateriaUsada").value);

    // Validaciones
    if(!producto || cantidad <=0 || !materia || cantMateria <=0) return alert("Datos inválidos");

    // Verificar existencia de materia prima
    const itemMP = inventario.find(i => i.producto.toLowerCase() === materia.toLowerCase());
    if(!itemMP || itemMP.existencia < cantMateria) return alert("No hay suficiente materia prima");

    // Restar materia prima del inventario
    itemMP.existencia -= cantMateria;

    // Agregar producto terminado al inventario
    const productoFinal = inventario.find(i => i.producto.toLowerCase() === producto.toLowerCase());
    if(productoFinal){
        productoFinal.existencia += cantidad;
    } else {
        inventario.push({
            producto: producto,
            existencia: cantidad,
            costo: 0 // Se puede ajustar después
        });
    }

    // Guardar orden
    const orden = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        producto,
        cantidad,
        materia,
        cantMateria
    };
    ordenes.push(orden);
    localStorage.setItem("ordenes", JSON.stringify(ordenes));

    // Asiento contable de producción
    generarAsientoProduccion(orden);

    // Actualizar vistas
    mostrarInventario();
    mostrarOrdenes();
    actualizarDashboard();
    formOrden.reset();
    alert("Orden registrada");
}

function mostrarOrdenes(){
    const tabla = document.getElementById("tablaOrdenes");
    tabla.innerHTML = "";
    if(ordenes.length === 0) { tabla.innerHTML = "<tr><td colspan='4'>Sin órdenes</td></tr>"; return; }
    
    ordenes.forEach(o => {
        tabla.innerHTML += `
            <tr>
                <td>${o.fecha}</td>
                <td>${o.producto}</td>
                <td>${o.cantidad}</td>
                <td>${o.materia} (${o.cantMateria})</td>
            </tr>
        `;
    });
}

function generarAsientoProduccion(ord){
    const importe = ord.cantMateria * 10; // Valor referencial, puedes ajustar
    const asiento = {
        id: Date.now(),
        fecha: ord.fecha,
        concepto: `Producción de ${ord.cantidad} ${ord.producto}`,
        debe: [{cuenta: "Almacén PT", monto: importe}],
        haber: [{cuenta: "Almacén MP", monto: importe}]
    };
    asientos.push(asiento);
    localStorage.setItem("asientos", JSON.stringify(asientos));
    mostrarAsientos();
}

// ---------------------------
// 💰 VENTAS
// ---------------------------
const secVentas = document.getElementById("ventas");
secVentas.innerHTML = `
    <form id="formVenta">
        <input type="text" id="prodVendido" placeholder="Producto" required>
        <input type="number" id="cantVendida" placeholder="Cantidad" required>
        <input type="number" id="precioVenta" placeholder="Precio Unitario" required>
        <button type="submit">Registrar Venta</button>
    </form>
    <table style="margin-top:2rem;">
        <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
        </thead>
        <tbody id="tablaVentas"></tbody>
    </table>
`;

const formVenta = document.getElementById("formVenta");
formVenta.addEventListener("submit", guardarVenta);

function guardarVenta(e){
    e.preventDefault();

    const producto = document.getElementById("prodVendido").value.trim();
    const cantidad = Number(document.getElementById("cantVendida").value);
    const precio = Number(document.getElementById("precioVenta").value);

    if(!producto || cantidad <=0 || precio <=0) return alert("Datos inválidos");

    // Verificar stock
    const itemInv = inventario.find(i => i.producto.toLowerCase() === producto.toLowerCase());
    if(!itemInv || itemInv.existencia < cantidad) return alert("Stock insuficiente");

    // Descontar del inventario
    itemInv.existencia -= cantidad;
    const total = cantidad * precio;

    // Guardar venta
    const venta = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        producto,
        cantidad,
        precio,
        total
    };
    ventas.push(venta);
    localStorage.setItem("ventas", JSON.stringify(ventas));

    // Asiento contable venta
    generarAsientoVenta(venta);

    // Actualizar
    mostrarInventario();
    mostrarVentas();
    actualizarDashboard();
    formVenta.reset();
    alert("Venta registrada");
}

function mostrarVentas(){
    const tabla = document.getElementById("tablaVentas");
    tabla.innerHTML = "";
    if(ventas.length === 0) { tabla.innerHTML = "<tr><td colspan='4'>Sin ventas</td></tr>"; return; }
    
    ventas.forEach(v => {
        tabla.innerHTML += `
            <tr>
                <td>${v.fecha}</td>
                <td>${v.producto}</td>
                <td>${v.cantidad}</td>
                <td>$${v.total.toFixed(2)}</td>
            </tr>
        `;
    });
}

function generarAsientoVenta(vta){
    const asiento = {
        id: Date.now(),
        fecha: vta.fecha,
        concepto: `Venta de ${vta.cantidad} ${vta.producto}`,
        debe: [{cuenta: "Clientes / Caja", monto: vta.total}],
        haber: [{cuenta: "Ingresos por Ventas", monto: vta.total}]
    };
    asientos.push(asiento);
    localStorage.setItem("asientos", JSON.stringify(asientos));
    mostrarAsientos();
}

// ---------------------------
// 📕 LIBRO MAYOR
// ---------------------------
function actualizarLibroMayor(){
    const mayorContenedor = document.getElementById("mayor");
    
    // Estructura de cuentas
    const cuentas = {};

    asientos.forEach(as => {
        // Cargar cuentas del DEBE
        as.debe.forEach(d => {
            if(!cuentas[d.cuenta]) cuentas[d.cuenta] = { debe:0, haber:0 };
            cuentas[d.cuenta].debe += d.monto;
        });
        // Cargar cuentas del HABER
        as.haber.forEach(h => {
            if(!cuentas[h.cuenta]) cuentas[h.cuenta] = { debe:0, haber:0 };
            cuentas[h.cuenta].haber += h.monto;
        });
    });

    // Generar tabla
    mayorContenedor.innerHTML = `
        <h2>Libro Mayor</h2>
        <table>
            <thead><tr><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Saldo</th></tr></thead>
            <tbody id="cuerpoMayor"></tbody>
        </table>
    `;
    const cuerpo = document.getElementById("cuerpoMayor");

    if(Object.keys(cuentas).length === 0){
        cuerpo.innerHTML = "<tr><td colspan='4'>Sin movimientos contables</td></tr>";
        return;
    }

    Object.entries(cuentas).forEach(([nombre, mov]) => {
        const saldo = mov.debe - mov.haber;
        cuerpo.innerHTML += `
            <tr>
                <td>${nombre}</td>
                <td>$${mov.debe.toFixed(2)}</td>
                <td>$${mov.haber.toFixed(2)}</td>
                <td>$${saldo.toFixed(2)}</td>
            </tr>
        `;
    });
}

// ---------------------------
// 📑 REPORTES
// ---------------------------
function generarReportes(){
    const secReportes = document.getElementById("reportes");

    const totalCompras = compras.reduce((acc,c)=>acc+(c.cantidad*c.costo),0);
    const totalVentas = ventas.reduce((acc,v)=>acc+v.total,0);
    const utilidad = totalVentas - totalCompras;
    const valorInv = inventario.reduce((acc,i)=>acc+(i.existencia*i.costo),0);

    secReportes.innerHTML = `
        <h2>Reportes Generales</h2>
        <div class="cards">
            <div class="card">
                <h3>Total Compras</h3>
                <p>$${totalCompras.toFixed(2)}</p>
            </div>
            <div class="card">
                <h3>Total Ventas</h3>
                <p>$${totalVentas.toFixed(2)}</p>
            </div>
            <div class="card">
                <h3>Utilidad Estimada</h3>
                <p>$${utilidad.toFixed(2)}</p>
            </div>
            <div class="card">
                <h3>Valor Inventario</h3>
                <p>$${valorInv.toFixed(2)}</p>
            </div>
        </div>
    `;
}

// ---------------------------
// 🔄 CARGA GENERAL AL INICIAR
// ---------------------------
window.addEventListener("load", () => {
    mostrarOrdenes();
    mostrarVentas();
    actualizarDashboard();
    actualizarLibroMayor();
    generarReportes();
});
