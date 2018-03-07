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

//=================================================================
// Verifica ADMIN
//=================================================================
exports.verificaADMIN_ROLE = function( req,resp,next ){

    var usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE'){
        //Si es admin, dejamos continuar
        next();
        return;
    }else{
        //Si no es admin, tiramos un error
        return resp.status(401).json({
            ok: false, 
            mensaje: 'Token incorrecto',
            errors: { message: 'No es administrador, no puede hacer eso'}
        });
    }

}

//=================================================================
// Verifica ADMIN y si es MISMO USUARIO: Permite que los admin editen y que los usuarios editen SUS PROPIOS PERFILES
//=================================================================
exports.verificaADMIN_ROLE_o_MismoUsuario = function( req,resp,next ){

    var usuario = req.usuario; //Usuario del token
    var id = req.params.id; //Id del usuario que se pasa por URL que se desea editar

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id ){
        //Si es admin, dejamos continuar
        next();
        return;
    }else{
        //Si no es admin, tiramos un error
        return resp.status(401).json({
            ok: false, 
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador ni es el mismo usuario, no puede hacer eso'}
        });
    }

}




    