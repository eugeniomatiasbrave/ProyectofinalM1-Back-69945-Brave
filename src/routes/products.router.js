import { Router } from "express";
import { productsService } from "../managers/index.js";
import { makeid } from "../utils.js";
import uploader from '../services/uploader.js';

const router = Router();

// Endpoint para traer todos los productos + limit + page + sort + filtro preciomax. revisado
// Postman://http://localhost:8080/api/products?limit=10&page=1&sort=asc&maxPrice=20000
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const maxPrice = parseInt(req.query.maxPrice);

        const products = await productsService.getProducts(page, limit, sort, maxPrice);

        if (!products) {
            return res.status(400).send({ status: "error", error: 'Error al obtener los productos' });
        }

        req.io.emit('Products', products);
        res.send({ status: "success", payload: products });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send({ status: "error", error: 'Error al obtener los productos' });
    }
});

//Endpoint para obtener un (id) producto. revisado
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;

        const product = await productsService.getProductById(pid);

        if (!product) {
            return res.status(400).send({ status: "error", error: 'No se encontró el producto con el ID: ' + pid });
        }
        res.send({ status: "success", data: product });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).send({ status: "error", error: 'Error al obtener el producto' });
    }
})


//Endpoint para crear una producto. revisado
router.post('/', uploader.array('thumbnail', 3), async (req, res) => {
    //const product = req.body;
    const { title, description, code, price, category, stock } = req.body;

    if (isNaN(price) || isNaN(stock)) {
        return res.status(400).send({ status: "error", error: 'Los datos proporcionados no son numericos' });
    };

    if (!title || !description || !code || !price || !category || !stock) {
        return res.status(400).send({ status: "error", error: 'Faltan datos para crear el producto' });
    };

    try {
        const newProduct = {
            title,
            description,
            price,
            code,
            stock,
            category,
            slug: `${title}_${makeid(4)}`,
            thumbnails: []
        };

        for (let i = 0; i < req.files.length; i++) {
            newProduct.thumbnails.push({ maintype: req.files[i].mimetype, path: `/files/products/${req.files[i].filename}`, main: i == 0 });
        }

        const result = await productsService.createProduct(newProduct);

        if (!result) {
            return res.status(500).send({ status: "error", error: 'Error al crear el producto' });
        }

        const productsViews = await productsService.getProductsViews();

        req.io.emit('ProductsIo', productsViews);
        res.send({ status: "success", message: 'Producto creado', payload: result }); // data: result es el producto creado.

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', error: error });
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

// Endpoint para actualizar un producto. Revisado
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updateData = req.body;

        // Me aseguro que el id no se actualice en la DB
        if (updateData.pid) {
            delete updateData.pid;
        }

        // Me aseguro que se actualicen todos los campos.
        if (!updateData.title || !updateData.description || !updateData.code || !updateData.price || !updateData.category || !updateData.stock) {
            return res.status(400).send({ status: "error", error: 'Faltan datos para actualizar el producto' });
        }
        // Númerico y positivo
        if (updateData.price && isNaN(updateData.price) || updateData.price < 0) {
            return res.status(400).send({ status: "error", error: 'El precio debe ser un número positivo' });
        }

        const result = await productsService.updateProduct(pid, updateData);

        if (result === -1) {
            return res.status(500).send({ status: "error", error: 'Error al actualizar el producto' });
        }

        const updatedProduct = await productsService.getProductById(pid);
        res.send({ status: "success", message: `Producto actualizado id: ${pid}`, data: updatedProduct });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).send({ status: "error", error: 'Error al actualizar el producto' });
    }
});


export default router;