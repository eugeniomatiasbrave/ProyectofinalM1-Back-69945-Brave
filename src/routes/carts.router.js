import { Router } from "express";
import CartsManagers from '../managers/filesystem/cartsManagers.js';
import {productsService} from "../managers/index.js";

const router = Router();
const managerCarts = new CartsManagers();


///// ENDPOINT creo un carrito con cid autogenerado y array de product vacio.////////
router.post('/', async (req, res) => {
	const cart = req.body;

	const result = await managerCarts.createCart(cart);
      if (result === -1) {
      return res.status(500).send({ status:"error", error: 'Error al crear el producto'});
    }
    res.send({ status:"success", message: `Producto creado id: ${result}`, data: result }); 
   })


///// ENDPOINT que muestra los product de un carrito cid especifico /////////////////
router.get('/:cid', async (req, res) => {
	const cid = req.params.cid;

    if (isNaN(cid)) { // Validar si el id es numérico
	  return res.status(400).send({ status:"error", error: 'El id proporcionado no es numérico'});
    }

	const carts = await managerCarts.getCarts(); // traigo los carritos existentes en el archivo.json
	const cart = carts.find(cart => cart.cid == cid);
	const ProductToCart = cart.products
	
	if (cart === undefined) { // me conviene usar undefined en este contexto mas q -1
		return res.status(500).send({ status:"error", error: ' No se encontro el producto id:' });
	}
	res.send({ status:"success", data: ProductToCart })
})


///// ENDPOINT agregar el producto al arreglo “products” del carrito seleccionado /////// 
router.post('/:cid/product/:pid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    if (isNaN(cid) || isNaN(pid)) {
        return res.status(400).send({ status: "error", error: 'El cid o el pid proporcionado no es numérico' });
    }

    const carts = await managerCarts.getCarts();
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

    const updateResult = await managerCarts.updateCart(cid, cart);
    if (updateResult === -1) {
        return res.status(500).send({ status: "error", error: 'Error al actualizar el carrito' });
    }

    res.send({ status: "success", message: 'Producto agregado/actualizado en el carrito', data: cart });
});

export default router
