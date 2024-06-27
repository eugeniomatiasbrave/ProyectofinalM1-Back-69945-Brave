import mongoose from 'mongoose';

const collection = "Products"

const schema = new mongoose.Schema({

	title:{
        type:String,
        required:true
    },
    description:String,
	price:Number,
    code:String,
    status: {
        type:Boolean, 
        default:true
    },
	stock:Number,
	category:String,
	thumbnails:{
		type:Array
	}
    
})

const productModel = mongoose.model(collection,schema);

export default productModel