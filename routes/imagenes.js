// Inicializar Variables
var express = require('express'); //Libreria express
var fs = require('fs'); //File System
var app = express(); //Definir servidor express
var path = require('path');

// Rutas
app.get('/:tabla/:img', (req, resp, next) =>{ 

    var tabla = req.params.tabla;
    var img = req.params.img;
    var pathFile = `./uploads/${tabla}/${img}`;
    if(!fs.existsSync(pathFile)){ //SI no existe imagen devovler la noimg
        pathFile = './assets/no-img.jpg';
    }
    resp.sendFile(path.resolve(pathFile));

    


});

//Exportar app
module.exports = app;