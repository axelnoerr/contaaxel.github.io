// Carga de datos - ASEGURAMOS que siempre sean arreglos
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
