function mostrarSeccion(id){

    document
        .querySelectorAll(".seccion")
        .forEach(sec => sec.classList.remove("activa"));

    document
        .getElementById(id)
        .classList.add("activa");
}
