// Requires: Importación de librerias

var express = require('express'); //Libreria express
var mongose = require('mongoose'); //Libreria mongoose.js para conectar MongoDb con NodeJs

// Inicializar Variables

var app = express(); //Definir servidor express
var colors = require('colors'); // color.js https://github.com/marak/colors.js/

// Conexión a la Base de Datos

mongose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {
    if (error) throw error; //Si hay algún error en la conexión finalizar

    console.log('Base de datos: ','online'.green);
})

// Rutas
app.get('/', (req, resp, next) =>{ //resp -> response: Respuesta del servidor a cualquier que haga una solicitud

    resp.status(200).json({
        ok: true, // Indica si todo esta bien (true), o si tiene algun error  (false)
        mensaje: 'Petición realizada correctamente'
    })

});


// Escuchar peticiones

app.listen(3000 ,  () => {
    console.log('Express server corriendo en puerto 3000','online'.green); //Mensaje en consola en verde
})