// Cambio de persistencia:

import ManagersProducts from "./mongo/ManagersProducts.js";  // percistencia Mongo
//import ManagersProducts from "./filesystem/productsManagers.js"; // Percistencia fs

import ManagersCarts from "./mongo/ManagersCarts.js";
//import ManagersCarts from "./filesystem/cartsManagers.js"

export const productsService = new ManagersProducts();
export const cartsService = new ManagersCarts();
