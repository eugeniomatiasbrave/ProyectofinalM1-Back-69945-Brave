import { Router } from "express";
import {cartsService, productsService} from "../managers/index.js";

const router = Router();

// ENDPOINT que muestra todos los carritos. Revisado. Tene sentido este endpoint?
// http://localhost:8080/api/carts
router.get('/', async (req, res) => {
	
  try {
    const carts = await cartsService.getCarts();
    if (!carts) {
        return res.status(404).send({ status: "error", error: 'No se encontraron carritos' });
    }
    res.status(200).send({ status: "success", data: carts });
  } catch (error) {
    console.error('Error al leer los carritos:', error);
    res.status(500).send({ status: "error", error: 'Error al leer los carritos' });
}
});

// ENDPOINT que muestra un carrito cid especifico.
router.get('/:cid', async (req, res) => {
  const cid = req.params.cid;

  try {
      const cart = await cartsService.getCartById(cid);
      if (!cart) {
          return res.status(404).send({ status: "error", error: 'cid no encontrado' });
      }

      const productsInCart = cart.products;
      res.send({ status: "success", data: productsInCart });
  } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).send({ status: "error", error: 'Error al obtener el carrito' });
  }
});

// ENDPOINT crea el carrito.
router.post('/', async (req, res) => {
  try {
      const newCart = await cartsService.createCart();
      res.status(201).send({ status: "success", data: newCart });
  } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).send({ status: "error", error: 'Error al crear el carrito' });
  }
});

// ENDPOINT agregar los productos al carrito.
// si es el primer producto y si esta vacia la collecion crea el carrito
// Si el carrito ya existe agrega los productos al carrito.
router.post('/:cid/products/:pid', async (req, res) => {
  try {
      let cartId;
      const cid = req.params.cid;
      const pid = req.params.pid;
      const quantity = req.body.quantity || 1;

      const carts = await cartsService.getCarts();

      if (!cid || carts.length === 0) {
          const newCart = await cartsService.createCart();
          cartId = newCart._id;
      } else {
          const cart = await cartsService.getCartById(cid);

          if (!cart) {
              return res.status(404).send({ status: "error", error: 'Carrito no encontrado' });
          }

          cartId = cid;
      }

      const product = await productsService.getProductById(pid);

      if (!product) {
          return res.status(404).send({ status: "error", error: 'Producto no encontrado con id: ' + pid });
      }

      const productToAdd = { product: pid, quantity };
      const updateResult = await cartsService.addProductToCart(cartId, productToAdd);

      if (updateResult.nModified === 0) {
          return res.status(500).send({ status: "error", error: 'Error al agregar el producto al carrito' });
      }

      res.send({ status: "success", message: 'Producto agregado al carrito', data: productToAdd });
  } catch (error) {
      console.error('Error al agregar el producto al carrito:', error);
      res.status(500).send({ status: "error", error: 'Error al agregar el producto al carrito' });
  }
});

// DELETE api/carts/:cid deberá eliminar todos los product pid de products dejando el cid con su products:[]. No elimina el carrito cid.
router.delete('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const result = await cartsService.deleteAllProductsCid(cid);
    res.send({ message: 'Todos los productos borrados del carrito', data: result });
  } catch (error) {
    console.error('Error al borrar productos del carrito:', error);
    res.status(500).send({ message: 'Error al borrar productos del carrito' });
  }
});

// Eliminar del carrito el producto seleccionado.
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const result = await cartsService.deleteProductCart(cid, pid);
    res.send({ message: 'Producto eliminado del carrito', data: result });
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    res.status(500).send({ message: 'Error al eliminar el producto del carrito' });
  }
});

// ENDPOINT PUT api/carts/:cid deberá actualizar todos los productos del carrito con un arreglo de productos.
router.put('/:cid', async (req, res) => {
  const cid = req.params.cid;
  const products = req.body.products; // Suponiendo que se envía un array de productos en el cuerpo de la solicitud

  const cart = await cartsService.getCartById(String(cid));

  if (cart === undefined) {
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

// PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
router.put('/:cid/products/:pid', async (req, res) => {

  try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

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

export default router;
