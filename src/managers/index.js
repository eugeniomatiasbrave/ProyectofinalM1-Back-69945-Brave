import ManagersProducts from "./mongo/ManagersProducts.js";  // percistencia Mongo
//import ManagersProducts from "./filesystem/productsManagers.js"; // Percistencia fs



export const productsService = new ManagersProducts();
