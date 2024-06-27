import { Router } from "express";
import {productsService} from "../managers/index.js";

const router = Router();

router.get("/", async (req, res) => {
	const products = await productsService.getProducts();

	if (!products) {
		return res.render('404')
	}
	res.render("Home", { 
		products 
	});
});

router.get("/realtimeproducts", async (req, res) => {
	const products = await productsService.getProducts();

	if (!products) {
		return res.render('404')
	}
	res.render("realTimeProducts"
		 
	);
});


export default router;