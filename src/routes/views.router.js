import { Router } from "express";
import ProductsManagers from "../managers/productsManagers.js";

const router = Router();
const managerProducts = new ProductsManagers();


router.get("/", async (req, res) => {
	const products = await managerProducts.getProducts();

	if (!products) {
		return res.render('404')
	}
	res.render("Home", { 
		products 
	});
});

router.get("/realtimeproducts", async (req, res) => {
	res.render("realTimeProducts");
});


export default router;