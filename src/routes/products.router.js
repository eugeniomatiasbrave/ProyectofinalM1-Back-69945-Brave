import { Router } from "express";
import {productsService} from "../managers/index.js";
import { makeid } from "../utils.js";
import uploader from '../services/uploader.js';

const router = Router();

// Endpoint para traer todos los productos + limit + page + sort + filtro preciomax. revisado
// Postman://http://localhost:8080/api/products?limit=10&page=1&sort=asc&maxPrice=20000
router.get('/', async (req, res) => {
	const limit = parseInt(req.query.limit) || 10;
	const page = parseInt(req.query.page) || 1;
	const sort = req.query.sort;
	const maxPrice = parseInt(req.query.maxPrice);
	
	const products = await productsService.getProducts(page, limit, sort ,maxPrice);
	
	if (products === null) {
	  return res.status(404).send({ status:"error", error: 'Error al leer los productos'});
	}
  
	req.io.emit('Products',products);
	res.send({ status:"success", payload:products });
  });

//Endpoint para obtener un (id) producto. revisado
router.get('/:pid', async (req, res) => {
	const pid = req.params.pid;

	const product = await productsService.getProductById(pid);
	
	if (product === null) {
		return res.status(404).send({ status:"error", error:'No se encontro el producto id:' + pid});
	}
	res.send({ status:"success", data: product })
})


//Endpoint para crear una producto. revisado
router.post('/', uploader.array('thumbnail', 3), async (req, res) => { 
	const product = req.body; 

	if (isNaN(product.price) || isNaN(product.stock)){
		return res.status(400).send({ status:"error", error: 'Los datos proporcionados no son numericos'});
	};
  
	if (!product.title || !product.description || !product.code || !product.price || !product.category || !product.stock ) {
	  return res.status(400).send({ status:"error", error: 'Faltan datos para crear el producto'});
	}; 
  
	try {
	const newProduct = {
		title: product.title,
		description: product.description,
		price: product.price,
		code: product.code,
		stock: product.stock,
		category: product.category,
		slug: `${product.title}_${makeid(4)}`,
		thumbnails: []
	   };

	for (let  i=0 ; i < req.files.length; i++) {
		newProduct.thumbnails.push({maintype:req.files[i].mimetype, path:`/files/products/${req.files[i].filename }`, main: i==0}); 
	}

	const result = await productsService.createProduct(newProduct);
	
	if (!result) {
		return res.status(500).send({ status:"error", error: 'Error al crear el producto'});
	}
	
	const productsViews = await productsService.getProductsViews();

	req.io.emit( 'ProductsIo', productsViews );
	res.send({ status:"success", message: 'Producto creado' , payload: result }); // data: result es el producto creado.

    } catch (error) {
	  console.log (error);
	  res.status(500).send({status:'error', error: error});
     }
  });
  
//Endpoint para borrar un producto. revisado
router.delete('/:pid', async (req, res) => {
    const pid = req.params.pid;
    try {
        const product = await productsService.getProductById(pid);

        if (!product) {
            return res.status(404).send({ status: "error", error: 'El producto que intentas borrar no existe' });
        }

        const deletedProduct = await productsService.deleteProduct(pid);

        if (!deletedProduct) {
            return res.status(500).send({ status: "error", error: 'Error al borrar el producto' });
        }

        const updatedProducts = await productsService.getProducts();
        req.io.emit('ProductsIo', updatedProducts); // Emite evento de WebSocket con la lista actualizada de productos
        
		res.send({ status: "success", data: deletedProduct });

    } catch (error) {
        console.error('Error al borrar el producto:', error);
        res.status(500).send({ status: "error", error: 'Hubo un problema al intentar borrar el producto' });
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

    const result = await productsService.updateProduct(pid, updateData);

    if (result === -1) {
        return res.status(500).send({ status: "error", error: 'Error al actualizar el producto' });
    }
	const updatedProduct = await productsService.getProductById(pid);
	//req.io.emit('ProductsIo', await productsService.getProducts());
    res.send({ status: "success", message: `Producto actualizado id: ${pid}`, data: updatedProduct })
})


export default router