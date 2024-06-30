import cartModel from './models/cart.model.js';


export default class ManagersCarts {
	
	getCarts( opts={}) { 
        return cartModel.find( opts ).lean(); // Busca todos
	}

    getCartById (cid) {
		return cartModel.findOne( {_id: String(cid)}); // Busca solo uno
	};

	createCart() {
        return cartModel.create(product);
    }

    // Método updateCart, edita
    updateCart(cid, updateData) { // requiero ambos argumentos ( id y updateData ) para poder luego usarlos en el endpoint.
        return cartModel.updateOne({ _id: String(pid) }, { $set: updateData });
    };

    // Método deleteCard
    deleteCart(cid) {
        return cartModel.deleteOne({_id:pid});
    };
};


  