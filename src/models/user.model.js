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
    
    edad:{
        type: Number,
        required: true
    },

    sexo:{
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
    }
}, {
    timestamps:true
})

const user = mongoose.model('User', userSchema)

export default user