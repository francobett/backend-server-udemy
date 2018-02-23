var mongoose = require('mongoose'); //Libreria mongoose.js para conectar MongoDb con NodeJs

var Schema = mongoose.Schema;

var hospitalSchema =	new Schema({

    nombre: {	type: String, required: [true,'El nombre es necesario']	},
    img: {	type: String, required: false },
    usuario: {	type: Schema.Types.ObjectId, ref: 'Usuario' }
    
},	{	collection: 'hospitales' }); //Crea la colección como nombre hospitales


module.exports = mongoose.model('Hospital',	hospitalSchema);