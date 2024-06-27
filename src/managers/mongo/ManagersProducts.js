import productModel from './models/product.model.js';

export default class ManagersProducts {
	
	createProduct(product){
      return productModel.create(product);
	};

    getProducts( opts = {} ) {
		return productModel.find( opts ).lean(); // todos
	};

	getProductById ( opts={} ) {
		return productModel.findOne( opts ); // solo uno
	};

	/*
    addDish(restaurantId,dish){
        //$push aplica para campos de tipo arreglo
        return productModel.updateOne({_id:restaurantId},{$push:{menu:dish}})
    }
	*/

    updateProduct(){
        
    }

    deleteProduct(pid){
        return productModel.deleteOne({_id:pid});
    }
	
}

