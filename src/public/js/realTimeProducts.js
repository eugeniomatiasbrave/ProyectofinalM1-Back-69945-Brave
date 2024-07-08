const socket = io();

socket.on('ProductsIo', (data) => {
  updateProductsList(data);
});

socket.on('productsUpdated', (updatedProducts) => {
  updateProductsList(updatedProducts);
});

 // Escuchar el evento de envío del formulario
 const form = document.getElementById('formProduct');

 form.addEventListener('submit', event => {
     event.preventDefault();
     const formData = new FormData(form);
 
     fetch('/api/products', {
         method: 'POST',
         body: formData
     }).then(response => response.json())
       .then(data => {
         console.log('Success:', data);
         form.reset(); 
         // Aquí puedes emitir un evento de WebSocket si es necesario o simplemente esperar a que el servidor emita un evento después de procesar los archivos
         socket.emit('createProduct', data);
        })
       .catch((error) => {
         console.error('Error:', error);
       });
 });

const updateProductsList = (productsIo) => {
  const productsContainer = document.getElementById('productsContainer');

  productsContainer.innerHTML = '';
  productsIo.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'card';
    let imagesHTML = '';
    if (product.thumbnails) {
      product.thumbnails.forEach(thumbnail => {
        imagesHTML += `<img src="${thumbnail.path}" style="width:200px; height:200px; object-fit:cover;">`;
      });
    }
    productDiv.innerHTML = `
      <h2>${product.title}</h2>
      <p>Descripción: ${product.description}</p>
      <p>Código: ${product.code}</p>
      <p>Precio: ${product.price}</p>
      <p>Status: ${product.status}</p>
      <p>Stock: ${product.stock}</p>
      <p>Categoría: ${product.category}</p>
      <div>${imagesHTML}</div>
      <button type="button" class="btn-secundary" onclick="deleteProduct('${product._id}')">
        Eliminar
      </button>
    `;
    productsContainer.appendChild(productDiv);
  });
  
};

// Función para eliminar un producto
const deleteProduct = (productId) => {
  fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    console.log('Product deleted:', data);
    // Emitir un evento de WebSocket para actualizar la lista de productos
    socket.emit('deleteProduct', productId);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
};
