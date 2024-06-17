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
const server =app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const io = new Server(server);

//Handlebars Configuración
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');


app.use(express.static(`${__dirname}/public`))


app.use((req,res,next)=>{
    req.io = io;
    next();
})


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rutas Vistas
app.use('/products', viewsRouter);
//Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

io.on('connection', async (socket) => {
    console.log('Cliente conectado con id:', socket.id);
    const productsManager = new ProductsManagers();
    const productsIo = await productsManager.getProducts();
    io.emit('ProductsIo', productsIo);

    socket.on('createProduct', async (data) => {
        await productsManager.createProduct(data);
        const productsIo = await productsManager.getProducts();
        io.emit('ProductsIo', productsIo);
    });

    socket.on('deleteProduct', async (pid) => {
        await productsManager.deleteProduct(pid);
        const productsIo = await productsManager.getProducts();
        io.emit('ProductsIo', productsIo);
    });
});



