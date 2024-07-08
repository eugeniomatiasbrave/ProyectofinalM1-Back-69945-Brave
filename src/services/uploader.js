// para trabajar con multer
import multer from "multer";
import __dirname from "../utils.js";

const storage = multer.diskStorage({

	// carpeta destino
	destination: function (req, file, cb) { // cd  es una callback de multer
		
		let dinamicFolder;

		switch(req.baseUrl) { // aqui puedo poner las rutas donde quiera que se guarden a distintas carpetas usando switch. Seria dinamisar las rutas , donde yo quiero que se guarden las cosas
			case '/api/products':
				dinamicFolder = 'products';
		}
		
		return cb(null, `${__dirname}/public/files/${dinamicFolder}`);
	},
	// nombre del archivo
	filename: function (req, file, cb) {
		return cb(null, `${Date.now()}-${file.originalname}`);
	}

});

const uploader = multer({ storage });

export default uploader