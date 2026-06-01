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
mostrarInventario();
