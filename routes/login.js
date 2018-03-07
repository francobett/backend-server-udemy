// Inicializar Variables
var express = require('express'); //Libreria express
var bcrypt = require('bcryptjs'); // Libreria para manejar la encriptacion de contraseñas
var jwt = require('jsonwebtoken'); // Libreria jsonwebtoken para manejar tokens del login

var SEED = require('../config/config').SEED; //Importar constante SEED, que es la semilla (para los tokens)

var app = express(); //Definir servidor express

var Usuario = require('../models/usuario'); //Importar el modelo de usuario


var {OAuth2Client} = require('google-auth-library'); //Importar libreria googleauth

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID; //Constantes
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET; //Constantes


//=================================================================
// Autenticación Google
//=================================================================
app.post('/google', (req, resp, next) =>{

    var token = req.body.token ;  //Token que viene en el body de la petición

    const oAuth2Client = new OAuth2Client(
       GOOGLE_CLIENT_ID,
       GOOGLE_SECRET
     );

     const ticket = oAuth2Client.verifyIdToken({
       idToken: token
       //audience: GOOGLE_CLIENT_ID
     });

     ticket.then( (data) =>{

        var payload = data.getPayload();

        Usuario.findOne( { email: payload.email }, ( error, usuario) => {

            if(error){
                return resp.status(500).json({
                    ok: false, 
                    mensaje: 'Error al buscar usuario a loguear',
                    errors: error
                });
            }
            //Si existe el usuario
            if( usuario ){ 

                if( !usuario.google ){ //SI no fue creado por google
                    return resp.status(400).json({
                        ok: false, 
                        mensaje: 'Debe usar su autenticación normal'
                    });
                }else{ // Fue creado por google

                    //Quitar contraseña
                    usuario.password = 'YouCantSeeIt';
    
                     //=================================================================
                    // Crear token
                    //=================================================================
                    // Parametros sign: 1°'payload': Data a colocar en el token,
                    // 2°'SEED'/semilla :nos permite hacer unico nuestro token
                    // 3°: fecha expiración del token
                    var token = jwt.sign( { usuario: usuario }, SEED , { expiresIn: 14400 } ) //4 horas
    
                    resp.status(200).json({ 
                        ok: true, 
                        usuario: usuario,
                        token: token,
                        id: usuario.id,
                        menu: obtenerMenu(usuario.role) //Obtener el menu segun el rol
                    });
                }

            //Si no existe el usuario
            }else{

                var usuarioNuevoGoogle = new Usuario();

                usuarioNuevoGoogle.nombre = payload.name;
                usuarioNuevoGoogle.email = payload.email;
                usuarioNuevoGoogle.password = ':)';
                usuarioNuevoGoogle.img = payload.picture;
                usuarioNuevoGoogle.google = true; 

                usuarioNuevoGoogle.save( (error, usuarioDB) => {

                    if(error){
                        return resp.status(500).json({
                            ok: false, 
                            mensaje: 'Error al guardar usuario de google',
                            errors: error
                        });
                    }

                    var token = jwt.sign( { usuario: usuarioDB }, SEED , { expiresIn: 14400 } ) //4 horas
    
                    resp.status(200).json({ 
                        ok: true, 
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB.id,
                        menu: obtenerMenu(usuario.role) //Obtener el menu segun el rol
                    });


                });


            }
          
        });


     })
     .catch( error => { //Si hay error
        resp.status(400).json({
            ok: false, 
            mensaje: 'Token no válido',
            errors: error
        });
     })

});


//=================================================================
// Autenticación normal
//=================================================================
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
            id: usuarioLogeado.id,
            menu: obtenerMenu(usuarioLogeado.role) //Obtener el menu segun el rol
        });

    });

    

});


function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard' , url: '/dashboard'},
            { titulo: 'ProgressBar' , url: '/progress'},
            { titulo: 'Gráficas' , url: '/graficas1'},
            { titulo: 'Promesas' , url: '/promesas'},
            { titulo: 'Rxjs' , url: '/rxjs'}
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu:[
            // { titulo: 'Usuarios', url:'/usuarios'},
            { titulo: 'Hospitales', url:'/hospitales'},
            { titulo: 'Medicos', url:'/medicos'}
          ]
        }
      ];
      
      //Si es administrador, agregar la posibilidad del menu de usuarios
      if ( ROLE === 'ADMIN_ROLE'){
          menu[1].submenu.unshift({ titulo: 'Usuarios', url:'/usuarios'});
      }
    
    return menu;
}


//Exportar login.js
module.exports = app;