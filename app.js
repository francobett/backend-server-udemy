// Requires: Importación de librerias

    var express = require('express'); //Libreria express
    var mongose = require('mongoose'); //Libreria mongoose.js para conectar MongoDb con NodeJs
    var bodyParser = require('body-parser'); //Libreria que crea un JSON para el Post

// Inicializar Variables

    var app = express(); //Definir servidor express
    var colors = require('colors'); // color.js https://github.com/marak/colors.js/

    //BodyParser
        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: false }))

        // parse application/json
        app.use(bodyParser.json())

// Importar Rutas
    var appRoutes = require('./routes/app');
    var usuarioRoutes = require('./routes/usuario');
    var loginRoutes = require('./routes/login');

// Conexión a la Base de Datos

    mongose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {
        if (error) throw error; //Si hay algún error en la conexión finalizar

        console.log('Base de datos: ','online'.green);
    })

//Rutas
    app.use('/usuario', usuarioRoutes); 
    app.use('/login', loginRoutes); 
    app.use('/', appRoutes); //Cuando coincida con '/' usar el archivo de rutas 'appRoutes'

// Escuchar peticiones

    app.listen(3000 ,  () => {
        console.log('Express server corriendo en puerto 3000','online'.green); //Mensaje en consola en verde
    })