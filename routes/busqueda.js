// Inicializar Variables
var express = require('express'); //Libreria express
var app = express(); //Definir servidor express

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=================================================================
// Búsqueda por colección, ESPECIFICA
//=================================================================
app.get('/coleccion/:tabla/:busqueda', (req, resp )=> {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var expRegular = new RegExp( busqueda, 'i'); //Sirve para que la busqueda sea insensible 'i', esto significa que no importa si hay mayusculas o no

    var promesa;

    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(expRegular);
            break;
        case 'medico':
            promesa = buscarMedicos(expRegular);
        break;
        case 'usuario':
            promesa = buscarUsuarios(expRegular);
        break;
        default:
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Los tipos de busquedas solo son: usuarios,medicos y hospitales',
                error: { message: 'Colección no válida'}
            });
    
    }

    promesa.then( respuesta => {
        resp.status(200).json({
            ok: true, 
            [tabla]: respuesta  //Propiedad de objeto procesadas. Devuelve según el nombre de la colección/tabla
        });
    });



});


//=================================================================
// Búsqueda general para todas las colecciones de la BD
//=================================================================
app.get('/todo/:busqueda', (req, resp ) =>{ 

    var busqueda = req.params.busqueda;
    var expRegular = new RegExp( busqueda, 'i'); //Sirve para que la busqueda sea insensible 'i', esto significa que no importa si hay mayusculas o no

    Promise.all( [
            buscarHospitales(expRegular), //Lo que devuelva estara en la posicion 0 del arreglo respuestas del then
            buscarMedicos(expRegular), //Lo que devuelva estara en la posicion 1 del arreglo respuestas del then
            buscarUsuarios(expRegular)]) //Lo que devuelva estara en la posicion 2 del arreglo respuestas del then
        .then( respuestas => { 

            resp.status(200).json({
                ok: true, 
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });


});

//=================================================================
// Promesa para buscar hospitales, busca la coincidencias con el nombre
//=================================================================
function buscarHospitales( expRegular ){

    return new Promise( (resolve,reject) => {

        Hospital.find( {nombre : expRegular })
                .populate('usuario','nombre email')
                .exec( (error, hospitales) => {

                    if (error){
                        reject('Error al cargar hospitales', error);
                    }else{
                        resolve(hospitales); //Si sale todo bien devuelve la data de los hospitales la promesa
                    }
                });
    
    });


}

//=================================================================
// Promesa para buscar médicos, busca la coincidencias con el nombre
//=================================================================

function buscarMedicos( expRegular ){

    return new Promise( (resolve,reject) => {

        Medico.find( {nombre : expRegular })
                .populate( 'usuario', 'nombre email')
                .populate( 'hospital' )
                .exec( (error, medicos) => {

                    if (error){
                        reject('Error al cargar medicos', error);
                    }else{
                        resolve(medicos); //Si sale todo bien devuelve la data de los hospitales la promesa
                    }
                    
                });
    
    });


}

//=================================================================
// Promesa para buscar usuarios , busca las coincidencias con el nombre o con el email
//=================================================================

function buscarUsuarios( expRegular ){ 

    return new Promise( (resolve,reject) => {

        Usuario.find({}, 'nombre email role')
                .or( [ { 'nombre': expRegular }, {'email': expRegular }  ]) //Arreglo de condiciones
                .exec( (error, usuarios) =>{

                    if(error){
                        reject('Error al cargar usuarios',error);
                    }else{
                        resolve(usuarios);
                    }
                });
    
    });


}

//Exportar app
module.exports = app;