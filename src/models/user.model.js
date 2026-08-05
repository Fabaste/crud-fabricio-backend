import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    
    apellido:{
        type: String,
        required: true
    },
    
    email:{
        type: String,
        required: true,
        unique: true
    },
    
    password:{
        type: String,
        required: true
    },
    
    fechaNacimiento: {
        type: Date,
        required: true
    },
    
    edad:{
        type: Number,
        required: true
    },

    genero:{
        type: String,
        required: true
    },
    
    telefono:{
        type: String,
        required: true
    },
    
    direccion:{
        type: String,
        required: true
    },
    
    codigoPostal:{
        type: String,
        required: true
    },
    
    localidad:{
        type: String,
        required: true
    },
    
    provincia:{
        type: String,
        required: true
    },
    
    pais:{
        type: String,
        required: true
    },
    
    role: {
        type: String,
        enum: ["ROOT", "ADMIN", "USER", "GUEST"],
        //default: "USER",
    },

    ultimoLogin: {
        type: Date,
        default: null,
    },

    // ==========================================
    // NUEVOS CAMPOS ADICIONALES PARA EL 2FA:
    // Al poner default, no rompe a tus usuarios viejos.
    // ==========================================
    twoFactorEnabled: {
        type: Boolean,
        default: false, // Por defecto nadie lo tiene activo hasta que valide el QR
    },

    twoFactorSecret: {
        type: String,
        default: null, // Se llena dinámicamente en el loginService
    },
    // ==========================================
    
}, {
    timestamps:true
})

const user = mongoose.model('User', userSchema)
//const user = mongoose.model('User', userSchema,'usuario')

export default user