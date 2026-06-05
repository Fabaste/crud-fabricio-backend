import bcrypt from "bcryptjs"
import User from '../models/user.model.js'
import Audit from '../models/audit.model.js'
import mongoose from "mongoose"

const getUsersService = async ({email,id}) => {
    console.log('SERVICE -> getUsersService')
    try {
        if(id) {
            if(!mongoose.Types.ObjectId.isValid(id)){
                throw{
                    statusCode: 400,
                    message: "Id inválido",
                }
            }

            const user = await User.findById(id).select('-password')
            if (!user){
                throw{
                    statusCode: 404,
                    message: "Usuario no encontrado",
                }
            }
            return user
        }

        if (email) {
            const user = await User.findOne({email}).select('-password')
            if (!user){
                throw{
                    statusCode: 404,
                    message: "Usuario no encontrado",
                }
            }
            return user
        }

    } catch (error) {
        throw error
    }
}

const createUserService = async (data) => {
    try {
        console.log('SERVICE -> createUserService')
        console.log(data)
        const existUser = await User.findOne({
            email: data.email   
        })

        if (existUser){
            throw new Error('El usuario ya existe')
        }

        const hashedPassword = await bcrypt.hash(
            data.password, 
            10
        )

        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            edad: data.edad,
            sexo: data.sexo,
            telefono: data.telefono,
            direccion: data.direccion,
            cp: data.cp,
            localidad: data.localidad,
            provincia: data.provincia,
            pais: data.pais

        })

        await user.save()

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            sexo: user.sexo,
            telefono: user.telefono,
            direccion: user.direccion,
            cp: user.cp,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais

        }
    } catch (error) {
        throw error
    }
}

const updateUserService = async (id,data) => {
    try {
        console.log('SERVICE -> updateUserService')
        console.log(id)
        console.log(data)

        if (!mongoose.Types.ObjectId.isValid(id)){
            throw new Error('Usuario no encontrado')
        }

        const user = await User.findById(id)

        if (!user){
            throw new Error('Usuario no encontrado')
        }

        console.log(user)
        //No permitir cambiar email
        /*if (data.email) {
            throw new Error('El email no puede modificarse')
        }*/

        // Update parcial
        if (data.nombre) user.nombre = data.nombre
        if (data.apellido) user.apellido = data.apellido
        if (data.edad) user.edad = data.edad
        if (data.sexo) user.sexo = data.sexo
        if (data.telefono) user.telefono = data.telefono
        if (data.direccion) user.direccion = data.direccion
        if (data.cp) user.cp = data.cp
        if (data.localidad) user.localidad = data.localidad
        if (data.provincia) user.provincia = data.provincia
        if (data.pais) user.pais = data.pais

        // Cambiar password si viene
        if (data.password) {
            user.password = await bcrypt.hash(
            data.password,
            10
            )
        }

        console.log("llegue")
        await user.save()
    
        console.log(user)
        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            sexo: user.sexo,
            telefono: user.telefono,
            direccion: user.direccion,
            cp: user.cp,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais
        }

    } catch (error) {
        throw error
    }
}

const deleteUserService = async (id) => {
    try {
        console.log('SERVICE -> deleteUserService')
        console.log(id)

        const user = await User.findById(id)

        if(!user) {
            throw new Error('Usuario no encontrado')
        }

        //Auditoria
        await Audit.create ({
            usuarioEliminado: user
        })

        await User.findByIdAndDelete(id)

        return {
            message: 'Usuario eliminado'
        }
    } catch (error) {
        throw error
    }
}

export {
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService
}