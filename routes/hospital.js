// Inicializar Variables
var express = require('express'); //Libreria express

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express(); //Definir servidor express

var Hospital = require('../models/hospital'); //Importar el modelo de hospital

// ==============================================================
// Obtener todos los hospitales
// ==============================================================

app.get('/', (req, resp) =>{ //resp -> response: Respuesta del servidor a cualquier que haga una solicitud

    var desde = req.query.desde || 0;  //Si no tiene valor, es vacio. Al ser req.query, viene la información en la URL x.com/hospital?desde=X
    desde = Number(desde);  


    Hospital.find({}) //Campos a devolver
                .populate('usuario', 'nombre email') //Populate para traer el objeto usuario relacionado al hospital, y los campos nombre y email
                .skip(desde) //Empezar la busqueda desde el numero que tiene la variable 'desde'
                .limit(5) //Solo mostrar 5 hospitales
                .exec( (error, hospitales) =>{ //Retorno del Query
                    if (error){
                        return resp.status(500).json({
                            ok: false, 
                            mensaje: 'Error cargando hospitales',
                            errors: error
                        });
                    }

                    Hospital.count( {}, (error, contador )=> {

                        resp.status(200).json({ //Devuelve los hospitales si sale todo bien
                            ok: true, // Indica si todo esta bien (true), o si tiene algun error  (false)
                            hospitales: hospitales,
                            total: contador
                        });
                    });

    })

   

});

// ==============================================================
// Actualizar hospital
// ==============================================================

app.put('/:id', mdAutenticacion.verificaToken , (req, resp) => {

    var id = req.params.id; //Poner en var id el id que viene por la ruta
    var body = req.body;

    Hospital.findById( id , (error, hospital ) =>{

        //Si ocurre un error al buscar
        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar hospital',
                errors: error
            });
        }

        //Si no existe el hospital con ese ID
        if (!hospital){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        //Actualizar Data

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save( (error, hospitalActualizado ) => {

            if(error){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Error al actualizar hospital',
                    errors: error
                });
            }

            resp.status(200).json({ //Devuelve el hospital actualizado si sale todo bien
                ok: true, 
                hospital: hospitalActualizado 
            });

        });

    });


});

// ==============================================================
// Crear nuevo hospital
// ==============================================================
app.post('/', mdAutenticacion.verificaToken , (req, resp) =>{ //Como segundo parametro se mandan los middleware y validaciones para esta petición

    var body = req.body; //Solo funciona con la libreria de BodyParser

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (error, hospitalGuardado ) => {
        if(error){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Error al crear hospital',
                errors: error
            });
        }

        resp.status(201).json({ //Devuelve el hospital guardado si sale todo bien
            ok: true, 
            hospital: hospitalGuardado
        });
    });

    

});

//=================================================================
// Eliminar Hospital por el id
//=================================================================
app.delete('/:id', mdAutenticacion.verificaToken , (req, resp) =>{

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalEliminado )=>{

        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al borrar hospital',
                errors: error
            });
        }
        //Si no existe el hospital
        if(!hospitalEliminado){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'No existe un hospital con ese ID',
                errors: {message: 'No existe un hospital con el ID: ' + id }
            });
        }

        resp.status(200).json({ 
            ok: true, 
            hospital: hospitalEliminado 
        });

    });
});


//Exportar app
module.exports = app;