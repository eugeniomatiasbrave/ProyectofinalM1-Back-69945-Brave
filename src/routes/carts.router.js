import { Router } from "express";
import {cartsService} from "../managers/index.js";
import {productsService} from "../managers/index.js";

const router = Router();

// ENDPOINT que muestra todo el carrito
router.get('/', async (req, res) => {
	const carts = await cartsService.getCarts();
	  if (carts === null) {
	    return res.status(500).send({ status:"error", error: 'Error al leer los carritos'});
	}
	res.send({ status:"success", payload:carts });
  });


// 1. ENDPOINT que muestra un carrito cid especifico // ok 
router.get('/:cid', async (req, res) => {
	const cid = req.params.cid;

    const cart = await cartsService.getCartById(String(cid));
	  const ProductToCart = cart.products

	  if (cart === undefined) { // me conviene usar undefined en este contexto mas q -1
		  return res.status(500).send({ status:"error", error: ' No se encontro el producto id:' });
  	}
	  res.send({ status:"success", data: ProductToCart })
})

// 2. ENDPOINT crea el carrito...OK
router.post('/', async (req, res) => {
  try {
      const newCart = await cartsService.createCart();
      res.status(201).send({ status: "success", data: newCart });
  } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).send({ status: "error", error: 'Error al crear el carrito' });
  }
});

// 3. ENDPOINT agregar el producto al arreglo “products” del carrito seleccionado // OK
router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params; 
  const cart = await cartsService.getCartById(String(cid));

  if (!cart) {
      return res.status(404).send({ status: "error", error: 'Carrito no encontrado' });
  }

  const product = await productsService.getProductById(pid);

  if (!product) {
      return res.status(404).send({ status: "error", error: 'Producto no encontrado con id: ' + pid});
  }

  let quantity = parseInt(req.body.quantity) || 1; // Si no se envía un quantity, por defecto es 1
  const productToAdd = { product: pid, quantity };
  
  try {
      const updateResult = await cartsService.addProductToCart(cid, productToAdd);

      if (updateResult.nModified === 0) {
          return res.status(500).send({ status: "error", error: 'Error al agregar el producto al carrito' });
      }

      res.send({ status: "success", message: 'Producto agregado al carrito', data: productToAdd });
  } catch (error) {
      console.error('Error al agregar el producto al carrito:', error);
      res.status(500).send({ status: "error", error: 'Error al agregar el producto al carrito' });
  }
});

// 4. DELETE api/carts/:cid deberá eliminar todos los product pid de products dejando el cid con su products:[]. No elimina el carrito cid.
router.delete('/:cid', async (req, res) => {
  const cid = req.params.cid;
  const result = await cartsService.deleteAllProductsCid(cid);
  res.send({ message: 'Todos los products borrados del carrito', data: result });
});

// 5. eliminar del carrito el producto seleccionado. OK
router.delete('/:cid/products/:pid', async (req, res) => {
  const cid = req.params.cid; 
  const pid = req.params.pid;
  const result = await cartsService.deleteProductCart(cid, pid);
  res.send({ message: 'Producto eliminado del carrito', data: result });
});

// 6. ENDPOINT PUT api/carts/:cid deberá actualizar todos los productos del carrito con un arreglo de productos.
router.put('/:cid', async (req, res) => {
  const cid = req.params.cid;
  const products = req.body.products; // Suponiendo que se envía un array de productos en el cuerpo de la solicitud

  const cart = await cartsService.getCartById(String(cid));

  if (cart === undefined) { // me conviene usar undefined en este contexto mas q -1
    return res.status(500).send({ status:"error", error: ' No se encontro el carrito' });
  }
  
  try {
      const updateResult = await cartsService.updateCart(cid, products);

      if (updateResult.nModified === 0) {
          return res.status(500).send({ status: "error", error: 'Error al actualizar los productos del carrito' });
      }

      res.send({ status: "success", message: 'Todos los productos actualizados en el carrito', data: products });
  } catch (error) {
      console.error('Error al actualizar los productos del carrito:', error);
      res.status(500).send({ status: "error", error: 'Error al actualizar los productos del carrito' });
  }
});

// 7. PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
      const result = await cartsService.updateProductQuantity(cid, pid, quantity);

      if (result.nModified === 0) {
          return res.status(500).send({ status: "error", error: 'Error al actualizar la cantidad del producto en el carrito' });
      }

      res.send({ status: "success", message: 'Cantidad del producto actualizada en el carrito' });
  } catch (error) {
      console.error('Error al actualizar la cantidad del producto en el carrito:', error);
      res.status(500).send({ status: "error", error: 'Error al actualizar la cantidad del producto en el carrito' });
  }
});



export default router
