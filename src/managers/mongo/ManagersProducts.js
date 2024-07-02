import productModel from './models/product.model.js';

export default class ManagersProducts {
	
    getProducts (opts={}) {
		return productModel.find( opts ).lean(); // Busca todos
	};

	getProductById (pid) {
		return productModel.findOne( {_id: String(pid)}); // Busca solo uno
	};

    /* addDish(restaurantId,dish){
        //$push aplica para campos de tipo arreglo
        return productModel.updateOne({_id:restaurantId},{$push:{menu:dish}})
    } */
 
    createProduct(product){ // Crea uno nuevo
        return productModel.create(product);
    };

    updateProduct(pid, updateData){ // edita uno
        return productModel.updateOne({ _id: String(pid) }, { $set: updateData });
    };
 
    deleteProduct(pid){ // elimina uno
        return productModel.deleteOne({_id:pid});
    };	
}

