var mongoose = require('mongoose'); //Libreria mongoose.js para conectar MongoDb con NodeJs
var uniqueValidor = require('mongoose-unique-validator'); //Pluggin que añade una prevalidacion para campos unicos

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol permitido' //mensaje de error si se envia un rol distinto
}

//Definir el esquema/modelo de usuario

var usuarioSchema = new Schema({

    //nombre es de tipo string, es requerido (true) y si no cumple muestra el mensaje 'Elnombre..'
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, required: [true, 'El correo es necesario'], unique:true },
    password: { type: String, required: [true, 'El contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos, uppercase: true }, //El uppercase:true, convierte los valores post de rol que lleguen en mayuscula
    google:  { type: Boolean, required: true, default: false }
});

usuarioSchema.plugin( uniqueValidor, { message: '{PATH} debe de ser único'}); //{PATH} significa el campo unique que tiene el error de validacion

//Exportar el usuario para usarlo fuera
module.exports = mongoose.model('Usuario', usuarioSchema);
