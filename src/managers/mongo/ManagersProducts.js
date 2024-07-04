import productModel from './models/product.model.js';

export default class ManagersProducts {
	
    getProducts(page, limit) { // Busca todos
		 return productModel.paginate({},{ limit, page,  lean:true });
	};

    getProductsViews() {
        return productModel.find({}).lean();
    };

	getProductById (pid) { // Busca solo uno
		return productModel.findOne( {_id: (pid)}); 
	};
 
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

