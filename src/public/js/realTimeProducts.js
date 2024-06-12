const socket = io();

socket.on('ProductsIo', (data) => {
  updateProductsList(data);
})
function updateProductsList(productsIo) {
  const productsContainer = document.getElementById('productsContainer');

  // Limpiar la vista actual y agregar título
  productsContainer.innerHTML = '<h1 class="title">Lista de Productos</h1>';

  // Creo la tabla y el encabezado.
  const productTable = document.createElement('table');
  productTable.innerHTML = `
    <tr>
      <th>Título</th>
      <th>Descripción</th>
      <th>Código</th>
      <th>Precio</th>
      <th>Status</th>
      <th>Stock</th>
      <th>Categoría</th>
      <th>Acción</th>
    </tr>
  `;

  // Crear el cuerpo de la tabla
  const tableBody = document.createElement('tbody');
  productTable.appendChild(tableBody);

  // Iterar sobre cada producto y agregarlo al cuerpo de la tabla
  productsIo.forEach(product => {
    const productRow = document.createElement('tr');
    productRow.innerHTML = `
      <td>${product.title}</td>
      <td>${product.description}</td>
      <td>${product.code}</td>
      <td>${product.price}</td>
      <td>${product.status}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      <td><button type="button" class="btn-primary" onclick="deleteProduct(${product.pid})">Eliminar</button></td>
    `;
    tableBody.appendChild(productRow);
  });

  // Agregar la tabla al contenedor
  productsContainer.appendChild(productTable);
};

 // Escuchar el evento de envío del formulario
 const form = document.getElementById('formProduct');
 form.addEventListener('submit', function(event) {
     event.preventDefault();


     // Recolectar datos del formulario
     const formData = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      price: Number(form.elements.price.value),
      code: form.elements.code.value.trim(),
      status: true,
      stock: Number(form.elements.stock.value),
      category: form.elements.category.value.trim(),
      tumbnails: []
  };

  // Validar que los campos necesarios estén presentes
  if (!formData.title || !formData.description || isNaN(formData.price) || !formData.code || isNaN(formData.stock) || !formData.category) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
  }
     // Emitir un evento de Socket.io para crear el producto
     socket.emit('createProduct', formData);
     // Limpiar el formulario
     form.reset();

 });

 function deleteProduct(productId){
  socket.emit('deleteProduct', productId);
 }