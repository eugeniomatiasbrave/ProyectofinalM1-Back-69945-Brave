import mongoose, { Schema } from 'mongoose';
import mongoosPaginate from 'mongoose-paginate-v2' 

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
    
});

schema.plugin(mongoosPaginate)

const productModel = mongoose.model(collection,schema);

export default productModel