import fs from 'fs';
import __dirname from '../utils.js';

const PATH = `${__dirname}/db/products.json`;

class ProductsManagers {
	constructor() {
         this.init();
	}

	async init() {
		
		if (fs.existsSync(PATH)) {
			//si ya existe el archivo no hace nada...
			console.log('Ya existe el archivo products.json');
		} else {
			try {
			  await fs.promises.writeFile(PATH, JSON.stringify([]), 'utf-8')	
			} catch (error) { // si algo sale mal
				console.log('Error al crear el archivo', error);
                process.exit(1); // aca corta el servidor y el proceso de crear el archivo si hay un error
			}
		}
    }; // fin del init

	async getProducts() { 
		try {
			const data = await fs.promises.readFile(PATH, 'utf-8');
			return JSON.parse(data);
		} catch (error) {
			return null;
		}
	}

	async saveProducts(products){ 
		try {
			await fs.promises.writeFile(PATH, JSON.stringify(products,null,'\t'));
			return true;
		} catch (error) {
			console.log('Error al escribir el archivo', error);
			return false;
		}
	}

	async createProduct(product) {
		const products = await this.getProducts(); // traigo los productos existentes.

		// consulto.
		if (!products) {
		   return -1; // Si yo creo mis id a partir de 1 en adelante, -1 es un error (segun mi logica, yo creo mi logica al poner -1).
		} 

        if (products.length === 0) {
	       // si es el primer registro, el id es 1.
		   product.pid = 1;
		} else {
			product.pid = products[products.length - 1].pid + 1;
		}
		products.push(product); // agrego el nuevo producto al array.

		const created = await this.saveProducts(products); // guardo los productos actualizadas.

		if (!created) {
			return -1; // no se pudo crear, devuelvo -1 (mi propia logica)
		}
		return created.pid; // si todo salio bien, devuelvo el id.
    }

	async getProductById(pid){
		const products = await this.getProducts(); // traigo los productos existentes.
		const productById = products.find((product) => product.pid === pid); // consulto x id

		  if(!productById) {
			  return -1 ; // no se pudo encontrar, devuelvo -1 (mi propia logica)
		  } 
		return productById;
	};
	
// Método deleteProduct
    async deleteProduct(pid) {
	   const products = await this.getProducts(); 
	   const filteredProducts = products.filter((product) => product.pid != pid);  
	   const deleted = await this.saveProducts(filteredProducts); 

	   if (!deleted) {
		 return -1; 
	   }
	     return filteredProducts;
    };

// Método updateProduct
    async updateProduct(pid, updateData) { // requiero ambos argumentos ( id y updateData ) para poder luego usarlos en el endpoint.
        const products = await this.getProducts();  // busco en el archivo los productos.
        const productIndex = products.findIndex((product) => product.pid == pid);  // busco el índice del producto con el id especificado.

        if (productIndex === -1) {
           return -1; // no se pudo encontrar, devuelvo -1 (mi propia lógica)
        }

        // Actualizo el producto con los nuevos datos, excluyendo el id.
        const updatedProduct = { ...products[productIndex], ...updateData, pid: products[productIndex].pid };
        products[productIndex] = updatedProduct;  // reemplazo el producto en el array.
        const updated = await this.saveProducts(products); // guardo los productos actualizados.

        if (!updated) {
          return -1; // no se pudo actualizar, devuelvo -1 (mi propia lógica)
        }
        return updatedProduct; // si todo salió bien, devuelvo el producto actualizado.
    };
};

export default ProductsManagers;  