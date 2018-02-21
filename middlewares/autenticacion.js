var jwt = require('jsonwebtoken'); // Libreria jsonwebtoken para manejar tokens del login

var SEED = require('../config/config').SEED; //Importar constante SEED, que es la semilla (para los tokens)



//=================================================================
// Middleware: Verificar Token (para saber que es middleware ir a http://expressjs.com/es/guide/using-middleware.html )
// Aquí se lee el token del URL, se procesa, se observa si es válido, si lo es, continúa
// Por lo que de aquí para abajo todas las peticiones necesitan autenticación
// Nota: Es mejor recibir el token desde los headers. Pero lo hacemos por el URL
//=================================================================
exports.verificaToken = function( req,resp,next ){

    var token = req.query.token;

    jwt.verify( token, SEED, (error, decoded) => {

        if (error){
            return resp.status(401).json({
                ok: false, 
                mensaje: 'Token incorrecto',
                errors: error
            });
        }

        req.usuario = decoded.usuario; //El usuario que tiene el token, que hace la petición

        //Si es correcto va con el next y permite seguir
        next();
    });

}




    