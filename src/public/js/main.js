//Vinculamos el ID del formulario
const form = document.getElementById("idForms");
const socket = io();


//Evento Listener para la función Submit del Formulario.
form.addEventListener('submit', (e)=>{
    e.preventDefault();
  
    //Configuramos los valores que se envíen se guarden bien. 
    const prod = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        thumbnail: document.getElementById('thumbnail').value,
        code: document.getElementById('code').value,
        stock: document.getElementById('stock').value
    };
    

    //Emitimos una función con Socket para que escuche el servidor.
    socket.emit('nuevoProducto', prod);

    //Reseteamos el formulario para poder seguir agregando. 
    e.target.reset();
})

socket.on('prod', (newProd)=>{

    //Nos aseguraos que los datos se guarden bien. 
    console.log(newProd);

    //Configuramos el contenido de otro DIV con los datos que obtuvimos del formulario
    const listProd = document.getElementById("listProd");

    const createDiv = document.createElement("div");
    createDiv.classList.add("prods");
    createDiv.innerHTML= 
    `<h2>${newProd.title}</h2>
    <p>REF: ${newProd.code} </p>
    <h4>${newProd.description}</h4>
    <p>Stock: ${newProd.stock}</p>
    <button class="delete-button" data-id="${newProd.id}">Eliminar</button>`

    //Creamos el DIV
    listProd.appendChild(createDiv)
})

//Creamos otro Event Listener para el click en el botón de eliminar.
document.getElementById('listProd').addEventListener('click', (event) => {
    //Verificamos que sea dentro del contenedor correspondiente al que se debe eliminar
    if (event.target && event.target.classList.contains('delete-button')) {
        const prodId = event.target.dataset.id;

        // Emitimos un Evento al servidor para eliminar el producto
        socket.emit('eliminarProducto', prodId);
    }
});

//Escuchamos que el producto se haya eliminado correctamente y eliminamos el DIV:
socket.on('productoEliminado', (pid)=>{
    //Enviamos un mensaje para que el cliente sepa lo que ocurre:
    console.log(`Intentando eliminar elemento con id 'producto_${pid}'`);

    //Seleccionamos el DIV correspondiente que se debe eliminar
    const productDiv = document.getElementById(`producto_${pid}`);

    
    // Si el elemento existe, se elimina
    if (productDiv) {
        //eliminamos el DIV
        productDiv.remove();
        //enviamos una respuesta positiva
        console.log(`Se ha eliminado el producto con id ${pid} exitosaemnte.`)
    }else{
        //en caso contrario, también lo notificamos
        console.log('No se ha logrado eliminar el producto de la vista.')
    }

})