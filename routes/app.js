//=================================================================
// Documentación de peticiones del back end: s
// https://documenter.getpostman.com/view/3600042/collection/RVg3cSHT
//=================================================================

// Inicializar Variables
var express = require('express'); //Libreria express
var app = express(); //Definir servidor express


// Rutas
app.get('/', (req, resp, next) =>{ //resp -> response: Respuesta del servidor a cualquier que haga una solicitud

    resp.status(200).json({
        ok: true, // Indica si todo esta bien (true), o si tiene algun error  (false)
        mensaje: 'Petición realizada correctamente'
    });

});

//Exportar app
module.exports = app;