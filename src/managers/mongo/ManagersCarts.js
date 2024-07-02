import cartModel from './models/cart.model.js';

export default class ManagersCarts {
	
	getCarts( opts={}) { 
        return cartModel.find( opts ).lean(); // Busca todos
	}

    getCartById (cid) {
		return cartModel.findOne( {_id: String(cid)}).lean(); // Busca solo uno
	};

    createCart() {
        const newCart = new cartModel({ products: [] });
        return newCart.save();
    }

    // Método para agregar un producto al carrito seleccionado
    addProductToCart(cid, product) {
        return cartModel.updateOne(
            { _id: String(cid) },
            { $push: { products: product } }
        );
    };


    //Metodo elimina un product del carrito
    deleteProductCart(cid, pid) {
        return cartModel.updateOne(
            { _id: String(cid) },
            { $pull: { products: { _id: pid } } }
        );
    };

    // Método deleteCard, no limina el carrito
    deleteAllProductsCid(cid) {
        return cartModel.updateOne(
            { _id: String(cid) },
            { $set: { products: [] } }
        );
    };
};


  