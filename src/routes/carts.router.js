import { Router } from "express";
import {cartsService} from "../managers/index.js";
import {productsService} from "../managers/index.js";

const router = Router();

router.get('/', async (req, res) => {
	
	const carts = await cartsService.getCarts();
  
	if (carts === null) {
	  return res.status(500).send({ status:"error", error: 'Error al leer los carritos'});
	}
  
	res.send({ status:"success", payload:carts });
  });


// 1. ENDPOINT que muestra un carrito cid especifico // ok en manager
router.get('/:cid', async (req, res) => {
	const cid = req.params.cid;

    if (isNaN(cid)) { // Validar si el id es numérico
	  return res.status(400).send({ status:"error", error: 'El id proporcionado no es numérico'});
    }

	const carts = await cartsService.getCarts(); // traigo los carritos existentes en el archivo.json
	const cart = carts.find(cart => cart.cid == cid);
	const ProductToCart = cart.products

	if (cart === undefined) { // me conviene usar undefined en este contexto mas q -1
		return res.status(500).send({ status:"error", error: ' No se encontro el producto id:' });
	}

	res.send({ status:"success", data: ProductToCart })
})


// 2. ENDPOINT creo un carrito con cid autogenerado y array de product vacio.// ok en manager
router.post('/', async (req, res) => {
	const cart = req.body;
	const result = await cartsService.createCart(cart);
      if (result === -1) {
      return res.status(500).send({ status:"error", error: 'Error al crear el producto'});
    }
    res.send({ status:"success", message: `Producto creado id: ${result}`, data: result }); 
   })


// 3. ENDPOINT agregar el producto al arreglo “products” del carrito seleccionado // 
router.post('/:cid/product/:pid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    if (isNaN(cid) || isNaN(pid)) {
        return res.status(400).send({ status: "error", error: 'El cid o el pid proporcionado no es numérico' });
    }

    const carts = await cartsService.getCarts();
    const cart = carts.find(cart => cart.cid == cid);

    if (!cart) {
        return res.status(404).send({ status: "error", error: 'Carrito no encontrado' });
    }

    const products = await productsService.getProducts();
    const product = products.find(product => product.pid == pid);

    if (!product) {
        return res.status(404).send({ status: "error", error: 'Producto no encontrado con id: ' + pid});
    }

    let quantity = parseInt(req.body.quantity) || 1; // Si no se envia un quantity por defecto es 1

    const productIndex = cart.products.findIndex(p => p.product === pid);

    if (productIndex !== -1) {
        // El producto ya existe en el carrito, sumo el existente con el muevo quantity .
        cart.products[productIndex].quantity += quantity;
    } else {
        // Producto no existe, agregar nuevo
        cart.products.push({
            product: pid,
            quantity: quantity
        });
    }

    const updateResult = await cartsService.updateCart(cid, cart);

    if (updateResult === -1) {
        return res.status(500).send({ status: "error", error: 'Error al actualizar el carrito' });
    }

    res.send({ status: "success", message: 'Producto agregado/actualizado en el carrito', data: cart });
});

// DELETE api/carts/:cid deberá eliminar todos los productos del carrito. No elimina el carrito.

router.delete('/:cid', async (req, res) => {
	const cid = req.params.cid;
	try {
	  const cart = await cartsService.deleteCart(cid);
  
	  if (cart === -1) {
		return res.status(500).send({ status: "error", error: 'Error al borrar todos los productos del carrito' });
	  }
  
	  const updatedProducts = await cartsService.getCarts();
	  req.io.emit('ProductsIo', updatedProducts); // Emitir evento de WebSocket con la lista actualizada de productos
	  res.send({ status: "success", data: product });
	} catch (error) {
	  console.error('Error deleting product:', error);
	  res.status(500).send({ status: "error", error: 'Error al borrar el producto' });
	}
  });

// DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
// PUT api/carts/:cid deberá actualizar todos los productos del carrito con un arreglo de productos.
// PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body


// Esta vez, para el modelo de Carts, en su propiedad products, el id de cada producto generado dentro del array tiene que hacer referencia al modelo
// de Products. Modificar la ruta /:cid para que al traer todos los productos, los traiga completos mediante un “populate”. De esta manera almacenamos
// sólo el Id, pero al solicitarlo podemos desglosar los productos asociados.


export default router
