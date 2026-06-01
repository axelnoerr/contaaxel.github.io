let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
let compras = JSON.parse(localStorage.getItem("compras")) || [];
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
const formCompra = document.getElementById("formCompra");
formCompra.addEventListener("submit", guardarCompra);
function guardarCompra(e){

    e.preventDefault();

    const producto = document.getElementById("producto").value;
    const cantidad = Number(document.getElementById("cantidad").value);
    const costo = Number(document.getElementById("costo").value);
    const compra = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        producto,
        cantidad,
        costo
    };
    compras.push(compra);
    localStorage.setItem(
        "compras",
        JSON.stringify(compras)
    );
    generarAsientoCompra(compra);
    actualizarInventario(compra);
    formCompra.reset();
    alert("Compra registrada correctamente");
}
function mostrarSeccion(id){
    document
        .querySelectorAll(".seccion")
        .forEach(sec => sec.classList.remove("activa"));
    document
        .getElementById(id)
        .classList.add("activa");
}
function actualizarInventario(compra){
    const productoExistente = inventario.find(
        item => item.producto === compra.producto
    );
    if(productoExistente){
        productoExistente.existencia += compra.cantidad;
        productoExistente.costo = compra.costo;
    }else
    {
        inventario.push({
            producto: compra.producto,
            existencia: compra.cantidad,
            costo: compra.costo
        });
    }
    localStorage.setItem(
        "inventario",
        JSON.stringify(inventario)
    );
    mostrarInventario();
}
function mostrarInventario(){
    const tabla = document.getElementById("tablaInventario");
    tabla.innerHTML = "";
    inventario.forEach(item => {
        tabla.innerHTML += `
            <tr>
                <td>${item.producto}</td>
                <td>${item.existencia}</td>
                <td>$${item.costo}</td>
            </tr>
        `;
    });
}
function mostrarCompras(){
    const tabla = document.getElementById("tablaCompras");
    tabla.innerHTML = "";
    compras.forEach(compra => {
        tabla.innerHTML += `
            <tr>
                <td>${compra.fecha}</td>
                <td>${compra.producto}</td>
                <td>${compra.cantidad}</td>
                <td>$${compra.costo}</td>
            </tr>
        `;
    });
}
  function generarAsientoCompra(compra){

    console.log("Entrando a generar asiento");

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

    console.log("Asiento creado:", asiento);

    asientos.push(asiento);

    localStorage.setItem(
        "asientos",
        JSON.stringify(asientos)
    );

    console.log(
        "Guardado:",
        localStorage.getItem("asientos")
    );
}
  
}
function mostrarAsientos(){
    const contenedor =
        document.getElementById("listaAsientos");
    if(!contenedor) return;
    contenedor.innerHTML = "";
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
                    <td>
                        ${asiento.debe[0].cuenta}
                    </td>
                    <td>
                        $${asiento.debe[0].monto}
                    </td>
                    <td></td>
                </tr>
                <tr>
                    <td>
                        ${asiento.haber[0].cuenta}
                    </td>
                    <td></td>
                    <td>
                        $${asiento.haber[0].monto}
                    </td>
                </tr>
            </table>
        </div>
        `;
    });
}
mostrarInventario();
mostrarCompras();
mostrarAsientos();
