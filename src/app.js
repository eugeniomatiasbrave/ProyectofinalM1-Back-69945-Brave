import express from "express";
import handlebars from 'express-handlebars';
import { Server } from "socket.io";
import __dirname from './utils.js';
import ProductsManagers from './managers/productsManagers.js';



import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();

const PORT = process.env.PORT || 8080;
//Handlebars Configuración
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));


//Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


const HTTPserver =app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const socketServer = new Server(HTTPserver);

//Rutas Vistas
app.use('/products', viewsRouter);

const productsManager = new ProductsManagers();

socketServer.on('connection', async (socket)=>{
    //callback a ejecutar.
    console.log('Cliente conectado con id:', socket.id);
    const productsIo = await productsManager.getProducts();
    socketServer.emit('ProductsIo', productsIo);

    socket.on('createProduct', async (data) =>{
        await productsManager.createProduct(data);
        const productsIo = await productsManager.getProducts();
        socketServer.emit('ProductsIo', productsIo);
    })

    socket.on('deleteProduct', async(pid)=>{
        await productsManager.deleteProduct(pid);
        const productsIo = await productsManager.getProducts();
        socketServer.emit('ProductsIo', productsIo);
    })
})



