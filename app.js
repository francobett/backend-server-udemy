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
    var hospitalRoutes = require('./routes/hospital');
    var medicoRoutes = require('./routes/medico');
    var uploadRoutes = require('./routes/upload');
    var loginRoutes = require('./routes/login');
    var busquedaRoutes = require('./routes/busqueda');
    var imagenesRoutes = require('./routes/imagenes');

// Conexión a la Base de Datos

    mongose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {
        if (error) throw error; //Si hay algún error en la conexión finalizar

        console.log('Base de datos: ','online'.green);
    });

//Server index config: Forma de desplegar imagenes, entrando a localhost:3000/uploads
    // var serveIndex = require('serve-index');
    // app.use(express.static(__dirname + '/'))
    // app.use('/uploads', serveIndex(__dirname + '/uploads'));


//Rutas
    app.use('/medico', medicoRoutes); 
    app.use('/hospital', hospitalRoutes); 
    app.use('/usuario', usuarioRoutes); 
    app.use('/upload', uploadRoutes); 
    app.use('/login', loginRoutes); 
    app.use('/busqueda', busquedaRoutes); 
    app.use('/img', imagenesRoutes); 
    app.use('/', appRoutes); //Cuando coincida con '/' usar el archivo de rutas 'appRoutes'

// Escuchar peticiones

    app.listen(3000 ,  () => {
        console.log('Express server corriendo en puerto 3000','online'.green); //Mensaje en consola en verde
    })