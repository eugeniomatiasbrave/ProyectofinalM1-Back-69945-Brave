const socket = io();

socket.on('ProductsIo', (data) => {
  updateProductsList(data);
})

function updateProductsList(productsIo) {
  const productsContainer = document.getElementById('productsContainer');

  // Limpiar la vista actual y agregar título
  productsContainer.innerHTML = '<h1>Lista de Productos</h1>';

  // Iterar sobre cada producto y crear su representación en el DOM
  productsIo.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <p>Titulo: ${product.title}</p>
      <p>Descripción: ${product.description}</p>
      <p>Código: ${product.code}</p>
      <p>Precio: ${product.price}</p>
      <p>Status: ${product.status}</p>
      <p>Stock: ${product.stock}</p>
      <p>Categoría: ${product.category}</p>
    `;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.onclick = function() {
      socket.emit('deleteProduct', product.code);
    };
    productDiv.appendChild(deleteButton);
    productsContainer.appendChild(productDiv);
    productsContainer.appendChild(document.createElement('br'));
  });
};


 // Escuchar el evento de envío del formulario
 const form = document.getElementById('formProduct');
 form.addEventListener('submit', function(event) {
     event.preventDefault();

     // Recolectar datos del formulario
     const formData = {
         title: form.elements.title.value,
         description: form.elements.description.value,
         price: Number(form.elements.price.value),
         code: form.elements.code.value,
         status: true,
         stock: Number(form.elements.stock.value),
         category: form.elements.category.value,
         tumbnails:[]
     };

     // Emitir un evento de Socket.io para crear el producto
     socket.emit('createProduct', formData);

     // Limpiar el formulario
     form.reset();
 });