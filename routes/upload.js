// Inicializar Variables
var express = require('express'); //Libreria express

var fileUpload = require('express-fileupload'); //Libreria expres-fileupload para la carga de archivos
var fs = require('fs'); //Importar libreria filesystem de node

var app = express(); //Definir servidor express

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload()); //Middleware

app.put('/:tabla/:id', (req, resp, next) =>{ 

    var tabla = req.params.tabla;
    var id = req.params.id;

    //tabla permitidas
    var tablasValidas = ['hospitales','medicos','usuarios'];
    if (tablasValidas.indexOf( tabla ) < 0){
        return resp.status(400).json({
            ok: false, 
            mensaje: 'Tipo de colección no valida',
            errors: { message: 'Las colecciones validas son' + tablasValidas.join(' , ') }
        });
    }

    if (!req.files){
        return resp.status(400).json({
            ok: false, 
            mensaje: 'No selecciono ningun archivo',
            errors: { message: 'Debe seleccionar una imagen'}
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.'); //Divide por cada punto el nombre del archivo. El ultimo elemento del arreglo es la extensión
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1];

    //Validar extensiones que se permiten
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0){ //Si no encuentra las extensiones validas en la extensión del archivo
        return resp.status(400).json({
            ok: false, 
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones validas son' + extensionesValidas.join(' , ') }
        });
    }

    // Nombre de Archivo Personalizado
    // idUsuario-milisegundos.extension
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path específico: /uploads/tabla/nombrearchivo
    var path = `./uploads/${ tabla }/${ nombreArchivo }`;

    archivo.mv( path, error => {
        if (error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }

        subirPorTabla(tabla, id, nombreArchivo, resp);
        


    });


});

function subirPorTabla(tabla, id, nombreArchivo, resp){

    if(tabla === 'usuarios'){
        
        Usuario.findById(id, (error,usuario) =>{
            //Si no existe usuario con ese ID
            if(!usuario){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Usuario no  existe',
                    errors: {message: 'Usuario no existe'}
                });            
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){ 
                fs.unlink(pathViejo); //Eliminar
            }

            usuario.img = nombreArchivo;
            usuario.save( (error, usuarioActualizado) => {

                usuarioActualizado.password = 'YouCantSeeIt';

                return resp.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });

            });

        });

    }

    if(tabla === 'medicos'){
        Medico.findById(id, (error,medico) =>{

            //Si no existe medico con ese ID
            if(!medico){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Medico no  existe',
                    errors: {message: 'Medico no existe'}
                });            
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){ 
                fs.unlink(pathViejo); //Eliminar
            }

            medico.img = nombreArchivo;
            medico.save( (error, medicoActualizado) => {

                return resp.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado: medicoActualizado
                });

            });

        });
    }

    if(tabla === 'hospitales'){
        Hospital.findById(id, (error,hospital) =>{

            //Si no existe hospital con ese ID
            if(!hospital){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Hospital no  existe',
                    errors: {message: 'Hospital no existe'}
                });            
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){ 
                fs.unlink(pathViejo); //Eliminar
            }

            hospital.img = nombreArchivo;
            hospital.save( (error, hospitalActualizado) => {

                return resp.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });

            });

        });
    }

}

//Exportar app
module.exports = app;