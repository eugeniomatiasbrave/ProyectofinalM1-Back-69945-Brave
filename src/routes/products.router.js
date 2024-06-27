import { Router } from "express";
import {productsService} from "../managers/index.js";
//import { makeid } from "../utils.js";
import uploader from '../services/uploader.js';

const router = Router();

//Endpoint para traer todos los productos + limit productos.

router.get('/', async (req, res) => {
	const limit = parseInt(req.query.limit);
	const products = await productsService.getProducts();
  
	if (products === null) {
	  return res.status(500).send({ status:"error", error: 'Error al leer los productos'});
	}
  
	if (limit) {
	  products = products.slice(0, limit);
	}
  
	req.io.emit('Products',products);
	res.send({ status:"success", payload:products });
  });


//Endpoint para obtener un (id) producto.
router.get('/:pid', async (req, res) => {
	const pid = req.params.pid;

    if (isNaN(pid)) { // Validar si el id es numérico
	  return res.status(400).send({ status:"error", error: 'El id proporcionado no es numérico'});
    }

	const products = await productsService.getProducts(); // traigo los productos existentes en el archivo.json
	const product = products.find(product => product.pid == pid);
	
	if (product === undefined) { // me conviene usar undefined en este contexto mas q -1
		return res.status(500).send({ status:"error", error: ' No se encontro el producto id:' + pid});
	}
	res.send({ status:"success", data: product })
})


//Endpoint para crear una producto.
router.post('/', uploader.array('thumbnail', 3), async (req, res) => { 
	const product = req.body; 
	console.log(req.files);
	console.log('Coneté con router de Productos :) '); // veo si llega el body
    console.log(req.body);
  
	if (!product.title || !product.description || !product.code || !product.price || !product.category || !product.stock ) {
	  return res.status(400).send({ status:"error", error: 'Faltan datos para crear el producto'});
	} 
  
	try {
	const newProduct = {
		title: product.title,
		description: product.description,
		price: Number(product.price),
		code: product.code,
		status: true,
		stock: Number(product.stock),
		category: product.category,
		thumbnails: []
	   }

	for (let  i=0 ; i < req.files.length; i++) {
		newProduct.thumbnails.push({maintype:req.files[i].mimetype, path:`/files/products/${req.files[i].filename }`, main: i==0}); 
	}

	const result = await productsService.createProduct(newProduct);
	
	if (result === -1) {
		return res.status(500).send({ status:"error", error: 'Error al crear el producto'});
	}
	
	req.io.emit('ProductsIo', await productsService.getProducts());
	res.send({ status:"success", message: 'Producto creado' , payload: result }); // data: result es el producto creado.

    } catch (error) {
	  console.log (error);
	  res.status(500).send({status:'error', error: error});
     }
  });
  

//Endpoint para borrar un producto.
router.delete('/:pid', async (req, res) => {
	const pid = req.params.pid;
	try {
	  const product = await productsService.deleteProduct(pid);
  
	  if (product === -1) {
		return res.status(500).send({ status: "error", error: 'Error al borrar el producto' });
	  }
  
	  const updatedProducts = await productsService.getProducts();
	  req.io.emit('ProductsIo', updatedProducts); // Emitir evento de WebSocket con la lista actualizada de productos
	  res.send({ status: "success", data: product });
	} catch (error) {
	  console.error('Error deleting product:', error);
	  res.status(500).send({ status: "error", error: 'Error al borrar el producto' });
	}
  });

// Endpoint para actualizar un producto.
router.put('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const updateData = req.body;

    // Asegurarse de que el id no se actualice
    if (updateData.pid) {
        delete updateData.pid;
    }

    const result = productsService.updateProduct(pid, updateData);

    if (result === -1) {
        return res.status(500).send({ status: "error", error: 'Error al actualizar el producto' });
    }

	req.io.emit('ProductsIo', await productsService.getProducts());
    res.send({ status: "success", message: `Producto actualizado id: ${pid}`, data: result })
})


export default router