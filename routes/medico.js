// Inicializar Variables
var express = require('express'); //Libreria express

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express(); //Definir servidor express

var Medico = require('../models/medico'); //Importar el modelo de medico

// ==============================================================
// Obtener todos los medicos
// ==============================================================

app.get('/', (req, resp) =>{ //resp -> response: Respuesta del servidor a cualquier que haga una solicitud

    var desde = req.query.desde || 0;  //Si no tiene valor, es vacio. Al ser req.query, viene la información en la URL x.com/medico?desde=X
    desde = Number(desde);  


    Medico.find({})
                .populate('usuario', 'nombre email')
                .populate('hospital')
                .skip(desde) //Empezar la busqueda desde el numero que tiene la variable 'desde'
                .limit(5) //Solo mostrar 5 medicos
                .exec( (error, medicos) =>{ //Retorno del Query
                    if (error){
                        return resp.status(500).json({
                            ok: false, 
                            mensaje: 'Error cargando medicos',
                            errors: error
                        });
                    }

                    Medico.count( {}, (error, contador )=> {

                        resp.status(200).json({ //Devuelve los medicos si sale todo bien
                            ok: true, // Indica si todo esta bien (true), o si tiene algun error  (false)
                            medicos: medicos ,
                            total: contador
                        });
    
                    });


    })

   

});

// ==============================================================
// Actualizar medico
// ==============================================================

app.put('/:id', mdAutenticacion.verificaToken , (req, resp) => {

    var id = req.params.id; //Poner en var id el id que viene por la ruta
    var body = req.body;

    Medico.findById( id , (error, medico ) =>{

        //Si ocurre un error al buscar
        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar medico',
                errors: error
            });
        }

        //Si no existe el medico con ese ID
        if (!medico){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'El medico con el id' + id + 'no existe',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        //Actualizar Data
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id; 
        medico.hospital = body.hospital;
        


        medico.save( (error, medicoActualizado ) => {

            if(error){
                return resp.status(400).json({
                    ok: false, 
                    mensaje: 'Error al actualizar medico',
                    errors: error
                });
            }

            resp.status(200).json({ //Devuelve el medico actualizado si sale todo bien
                ok: true, 
                medico: medicoActualizado 
            });

        });

    });


});

// ==============================================================
// Crear nuevo medico
// ==============================================================
app.post('/', mdAutenticacion.verificaToken , (req, resp) =>{ //Como segundo parametro se mandan los middleware y validaciones para esta petición

    var body = req.body; //Solo funciona con la libreria de BodyParser

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id, //Se manda mediante el req, porque el usuario NO se selecciona sino que el usuario va ser el que esté logeado en ese momento
        hospital: body.hospital
    });

    medico.save( (error, medicoGuardado ) => {
        if(error){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'Error al crear medico',
                errors: error
            });
        }

        resp.status(201).json({ //Devuelve el medico guardado si sale todo bien
            ok: true, 
            medico: medicoGuardado
        });
    });

    

});

//=================================================================
// Eliminar Médico por el id
//=================================================================
app.delete('/:id', mdAutenticacion.verificaToken , (req, resp) =>{

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (error, medicoEliminado )=>{

        if(error){
            return resp.status(500).json({
                ok: false, 
                mensaje: 'Error al borrar medico',
                errors: error
            });
        }
        //Si no existe el medico
        if(!medicoEliminado){
            return resp.status(400).json({
                ok: false, 
                mensaje: 'No existe un medico con ese ID',
                errors: {message: 'No existe un medico con el ID: ' + id }
            });
        }

        resp.status(200).json({ 
            ok: true, 
            medico: medicoEliminado 
        });

    });
});


//Exportar app
module.exports = app;