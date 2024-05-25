import express from "express";
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));

app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);




