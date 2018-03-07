// Inicializar Variables
var express = require('express'); //Libreria express
var bcrypt = require('bcryptjs'); // Libreria para manejar la encriptacion de contraseñas
var jwt = require('jsonwebtoken'); // Libreria jsonwebtoken para manejar tokens del login

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express(); //Definir servidor express

var Usuario = require('../models/usuario'); //Importar el modelo de usuario

// ==============================================================
// Obtener todos los usuarios
// ==============================================================

app.get('/', (req, resp) =>{ //resp -> response: Respuesta del servidor a cualquier que haga una solicitud

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Usuario.find({}, //Query. En este caso no hay query, devuelve todos los usuarios
                'nombre email img role google') //Campos a devolver
                .skip(desde) //Empezar la busqueda desde el numero que tiene la variable 'desde'
                .limit(5) //Solo mostrar 5 usuarios
                .exec( (error, usuarios) =>{ //Retorno del Query
                    if (error){
                        return resp.status(500).json({
                            ok: false, 
                            mensaje: 'Error cargando usuario',
                            errors: error
                        });
                    }

                    Usuario.count({}, (error, contador) => { //Contar todos los usuarios, el 1° parametro es la query, al ser vacio cuenta a todos

                        resp.status(200).json({ //Devuelve los usuarios si sale todo bien
                            ok: true, // Indica si todo esta bien (true), o si tiene algun error  (false)
                            usuarios: usuarios,
                            total: contador
                        });
    
                    });


    })

   

});


// ==============================================================
// Actualizar usuario
// ==============================================================

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE_o_MismoUsuario ] , (req, resp) => {

    var id = req.params.id; //Poner en var id el id que viene por la ruta
    var body = req.body;

    Usuario.findById( id , (error, usuario ) =>{

        //Si ocurre un error al buscar
        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        //Si no existe el usuario con ese ID
        if (!usuario){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        //Actualizar Data

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        // En vez de asignar uno por uno, se puede hacer de la siguiente forma.
        // No lo hacemos, pq actualizaria la contraseña también
        // Object.keys(req.body).forEach(key => {
        //     usuario[key] = req.body[key];
        //     });


        usuario.save( (error, usuarioActualizado ) => {

            if(error){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                });
            }

            usuarioActualizado.password = 'YouCantSeeIt'; //Para que no devuelva la password en el resp200, para ver otra forma ver en el GET

            resp.status(200).json({ //Devuelve el usuario actualizado si sale todo bien
                ok: true, 
                usuario: usuarioActualizado 
            });

        });

    });


});

// ==============================================================
// Crear nuevo usuario
// ==============================================================
app.post('/', (req, resp) =>{ //Como segundo parametro se mandan los middleware y validaciones para esta petición

    var body = req.body; //Solo funciona con la libreria de BodyParser

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //El 10 es 'salt'. Es el n° de bits aleatorios para modificar la pw
        img: body.img,
        role: body.role
    });

    usuario.save( (error, usuarioGuardado ) => {
        if(error){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Error al crear usuario',
                errors: error
            });
        }

        resp.status(201).json({ //Devuelve el usuario guardado si sale todo bien
            ok: true, 
            usuario: usuarioGuardado ,
            usuarioToken: req.usuario
        });
    });

    

});

//=================================================================
// Eliminar Usuario por el id
//=================================================================
app.delete('/:id',[mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE] , (req, resp) =>{

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (error, usuarioEliminado )=>{

        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }
        //Si no existe el usuario
        if(!usuarioEliminado){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'No existe un usuario con ese ID',
                errors: {message: 'No existe un usuario con el ID: ' + id }
            });
        }

        resp.status(200).json({ 
            ok: true, 
            usuario: usuarioEliminado 
        });

    });
});


//Exportar app
module.exports = app;