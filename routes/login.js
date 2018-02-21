// Inicializar Variables
var express = require('express'); //Libreria express
var bcrypt = require('bcryptjs'); // Libreria para manejar la encriptacion de contraseñas
var jwt = require('jsonwebtoken'); // Libreria jsonwebtoken para manejar tokens del login

var SEED = require('../config/config').SEED; //Importar constante SEED, que es la semilla (para los tokens)

var app = express(); //Definir servidor express

var Usuario = require('../models/usuario'); //Importar el modelo de usuario

app.post('/', (req,resp) => {

    var body = req.body;

    Usuario.findOne( { email: body.email}, (error, usuarioLogeado ) => {
        
        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar usuario a loguear',
                errors: error
            });
        }
        //Si no existe un usuario con ese email
        if(!usuarioLogeado){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Credenciales incorrectas - email',
                errors: {message: 'El email: ' + body.email + ' no existe '}
            });
        }

        //Verificar si la contraseña es correcta
        if( !bcrypt.compareSync( body.password, usuarioLogeado.password ) ){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Credenciales incorrectas - password',
                errors: {message: 'La contraseña: ' + body.password + ' no existe '}
            });
        }

        //Quitar contraseña
        usuarioLogeado.password = 'YouCantSeeIt';

        //=================================================================
        // Crear token
        //=================================================================
        // Parametros sign: 1°'payload': Data a colocar en el token,
        // 2°'SEED'/semilla :nos permite hacer unico nuestro token
        // 3°: fecha expiración del token
        var token = jwt.sign( { usuario: usuarioLogeado }, SEED , { expiresIn: 14400 } ) //4 horas

        resp.status(200).json({ 
            ok: true, 
            usuario: usuarioLogeado,
            token: token,
            id: usuarioLogeado.id
        });

    });

    

});


//Exportar login.js
module.exports = app;