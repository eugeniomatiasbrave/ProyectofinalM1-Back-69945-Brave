import fs from 'fs';

const PATH = './src/files/carts.json';

class CartsManagers {
	constructor() {
         this.init();
	}

	async init() {
		
		if (fs.existsSync(PATH)) {
			//si ya existe el archivo no hace nada...
			console.log('Ya existe el archivo Carts.json');
		} else {

			try {
				await fs.promises.writeFile(PATH, JSON.stringify([]), 'utf-8')
				
			} catch (error) { // si algo sale mal

				console.log('Error al crear el archivo', error);

                process.exit(1); // aca corta el servidor y el proceso de crear el archivo si hay un error
			}
		}
    }; // fin del init

	async getCarts() { 
		try {
			const data = await fs.promises.readFile(PATH, 'utf-8');
			return JSON.parse(data);
		} catch (error) {
			return null;
		}
	}

	async saveCarts(carts){ 
		try {
			await fs.promises.writeFile(PATH, JSON.stringify(carts,null,'\t'));
			return true;
		} catch (error) {
			console.log('Error al escribir el archivo', error);
			return false;
		}
	}

	async createCart({ products= [] }) {
		
		const newCart = {
			products
		}
				    
		const carts = await this.getCarts(); // traigo los productos existentes.
		// consulto.
		if (!carts) {
		   return -1; // Si yo creo mis id a partir de 1 en adelante, -1 es un error (segun mi logica, yo creo mi logica al poner -1).
		} 

        if (carts.length === 0) {
	       // si es el primer registro, el id es 1.
	      newCart.cid = 1;
		} else {
          newCart.cid = carts[carts.length - 1].cid + 1;
		}
		carts.push(newCart); // agrego el nuevo Carrito al array.

		const created = await this.saveCarts(carts); // guardo los productos actualizadas.

		if (!created) {
			return -1; // no se pudo crear, devuelvo -1 (mi propia logica)
		}
		return newCart.cid; // si todo salio bien, devuelvo el id.
    }


// Método deleteCard
    async deleteCart(cid) {

	   const carts = await this.getCarts(); 
	   const filteredCarts = carts.filter((cart) => cart.cid != cid);  
	   const deleted = await this.saveCarts(filteredCarts); 

	   if (!deleted) {
		 return -1; 
	   }
	     return filteredCarts;
    };

// Método updateCart
    async updateCart(cid, updateData) { // requiero ambos argumentos ( id y updateData ) para poder luego usarlos en el endpoint.

        const carts = await this.getCarts();  // busco en el archivo los productos.
        const cartIndex = carts.findIndex((cart) => cart.cid == cid);  // busco el índice del producto con el id especificado.

        if (cartIndex === -1) {
           return -1; // no se pudo encontrar, devuelvo -1 (mi propia lógica)
        }

        // Actualizo el producto con los nuevos datos, excluyendo el id.
        const updatedCart = { ...carts[cartIndex], ...updateData, cid: carts[cartIndex].cid };
        carts[cartIndex] = updatedCart;  // reemplazo el producto en el array.

        const updated = await this.saveCarts(carts); // guardo los productos actualizados.

        if (!updated) {
          return -1; // no se pudo actualizar, devuelvo -1 (mi propia lógica)
        }

        return updatedCart; // si todo salió bien, devuelvo el producto actualizado.
    };
};


export default CartsManagers;  