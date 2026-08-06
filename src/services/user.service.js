import bcrypt from "bcryptjs"
import User from '../models/user.model.js'
import Audit from '../models/audit.model.js'
import mongoose, { mongo } from "mongoose"
import { request } from "express"

const getUsersService = async ({email,id, requesterRole, requesterId}) => {
    try {
        const role = requesterRole?.toUpperCase()
        const currentUserId = requesterId?.toString()

        if (!role) {
            throw {
                statusCode: 403,
                message: "No tienes permisos para ver usuarios",
            }
        }

        if (role === "GUEST") {
            throw {
                statusCode: 403,
                message: "No tienes permisos para ver usuarios",
            }
        }

        if(id) {
            if(!mongoose.Types.ObjectId.isValid(id)){
                throw{
                    statusCode: 400,
                    message: "Id inválido",
                }
            }

            if (role === "USER" && id !== currentUserId) {
                throw {
                    statuscode: 403,
                    message: "No tienes permisos para ver este usuario",
                }
            }

            const user = await User.findById(id).select('-password')
            if (!user){
                throw{
                    statusCode: 404,
                    message: "Usuario no encontrado",
                }
            }

            if (role === "ADMIN" && user.role === "ROOT") {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver usuarios root",
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

            if (role === "USER" && user._id.toString() !== currentUserId) {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver este usuario",
                }
            }

            if (role === "ADMIN" && user.role === "ROOT") {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver usuarios root",
                }
            }

            return user
        }

        if (role === "USER") {
            const user = await User.findById(currentUserId).select('-password')
            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                }
            }
            return user
        }

        if (role === "ADMIN") {
            return await User.find({ role: { $ne: "ROOT" } }).select("-password").sort({ nombre: 1 })
        }
        return await User.find().select("-password").sort({ nombre: 1 })

    } catch (error) {
        console.error(
            "Error en getUsersService:",error
        )
        throw {
            statuscode: error.statusCode || 500,
            message: error.statusCode || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
}

const createUserService = async (data, { requesterRole }) => {
    console.log('SERVICE -> createUserService')

    try {
        const role = requesterRole?.toUpperCase()

        const existUser = await User.findOne({
            email: data.email,  
        })

        if (existUser){
            throw {
                statuscode: 409,
                message: 'El usuario ya existe',
            }
        }


        if (role === "ADMIN" && (data.role === "ROOT" || data.role === "ADMIN")) {
            throw {
                    statusCode: 403,
                    message: `No tiene permisos para agregar usuarios ${data.role}`,
                }
        }

        const hashedPassword = await bcrypt.hash(
            data.password, 
            10,
        )

        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            fechaNacimiento: data.fechaNacimiento,
            edad: data.edad,
            genero: data.genero,
            telefono: data.telefono,
            direccion: data.direccion,
            codigoPostal: data.codigoPostal,
            localidad: data.localidad,
            provincia: data.provincia,
            pais: data.pais,
            role: data.role

        })

        await user.save()

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            fechaNacimiento: user.fechaNacimiento,
            edad: user.edad,
            genero: user.genero,
            telefono: user.telefono,
            direccion: user.direccion,
            codigoPostal: user.codigoPostal,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            role: user.role
        }

    } catch (error) {
        //throw error
        console.error (
            "Error en createUserService:",
            error
        )

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
}

const updateUserService = async (id,data,{requesterRole, requesterId}) => {
        console.log('SERVICE -> updateUserService')
        console.log(id)
        console.log(data)

    try {
        
        const role = requesterRole?.toUpperCase()
        const currentUserId = requesterId?.toString()

        if (!mongoose.Types.ObjectId.isValid(id)){
            //throw new Error('Usuario no encontrado')
            throw{
                statusCode: 400,
                message: "Id inválido",
            }
        }

        const user = await User.findById(id)

        if (!user){
            //throw new Error('Usuario no encontrado')
            throw {
                statusCode: 404,
                message: "Usuario no encontrado",                
            }
        }

        //console.log(user)
        //No permitir cambiar email
        /*if (data.email) {
            throw new Error('El email no puede modificarse')
        }*/
       if (data.email !== undefined) {
            throw {
                statusCode: 400,
                message: "El email no puede modificarse",
            }
       }

       if (role === "ADMIN" && data.role === "ROOT") {
            throw {
                statuscode: 403,
                message: "No tiene permisos para modificar usuarios root"
            }
       }
       console.log(role, data.role, currentUserId, id)
       if (role === "ADMIN" && data.role === "ADMIN" && currentUserId !== id) {
            throw {
                    statusCode: 403,
                    message: "No tiene permisos para crear o modificar usuarios admin",
                }
       }

       /* // Update parcial
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
       */
      const allowedFields = [
        "nombre",
        "apellido",
        "fechaNacimiento",
        "edad",
        "genero",
        "telefono",
        "direccion",
        "codigoPostal",
        "localidad",
        "provincia",
        "pais",
        "role",
      ]

      allowedFields.forEach((field) => {
        if (data[field] !== undefined){
            user[field] = data[field]
        }
      })
        // Cambiar password si viene
        if (data.password !== undefined) {
            user.password = await bcrypt.hash(
                data.password,
                10
            )
        }

        //console.log("llegue")
        await user.save()
    
        console.log(user)
        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            genero: user.genero,
            telefono: user.telefono,
            direccion: user.direccion,
            codigoPostal: user.codigoPostal,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            role: user.role,
        }

    } catch (error) {
        //throw error
        console.error (
            "Error en updateUserService:", error
        )

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
}

const deleteUserService = async (id) => {
        console.log('SERVICE -> deleteUserService')
        console.log(id)

    let session

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                statusCode: 400,
                message: "Id inválido",
            }
        }

        session = await mongoose.startSession()

        await session.withTransaction (async () => {

            const user = await User.findById(id).session(session)

            if(!user) {
                //throw new Error('Usuario no encontrado')
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                }
            }

            //Auditoria
            await Audit.create (
                [
                    {
                        usuarioEliminado: user.toObject(),
                        fechaEliminacion: new Date(),
                    },
                ],
                {session}
            )

            //await User.findByIdAndDelete(id)
            await user.deleteOne({ session })
        })

        return {
            message: 'Usuario eliminado',
        }



    } catch (error) {
        //throw error
        console.error(
            "Error en deleteUserService:", error
        )
        
        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
    finally {
        if(session) {
            await session.endSession()
        }
    }
}

const registerUserService = async (data) => {
    console.log('SERVICE -> registerUserService')
    console.log(data)

    try {
        /*const role = requesterRole?.toUpperCase()*/

        const existUser = await User.findOne({
            email: data.email,  
        })

        if (existUser){
            throw {
                statuscode: 409,
                message: 'El usuario ya existe',
            }
        }


        /*if (role === "ADMIN" && (data.role === "ROOT" || data.role === "ADMIN")) {
            throw {
                    statusCode: 403,
                    message: `No tiene permisos para agregar usuarios ${data.role}`,
                }
        }*/

        const hashedPassword = await bcrypt.hash(
            data.password, 
            10,
        )

        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            fechaNacimiento: data.fechaNacimiento,
            edad: data.edad,
            genero: data.genero,
            telefono: data.telefono,
            direccion: data.direccion,
            codigoPostal: data.codigoPostal,
            localidad: data.localidad,
            provincia: data.provincia,
            pais: data.pais,
            role: data.role

        })

        await user.save()

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            fechaNacimiento: user.fechaNacimiento,
            edad: user.edad,
            genero: user.genero,
            telefono: user.telefono,
            direccion: user.direccion,
            codigoPostal: user.codigoPostal,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            role: user.role
        }

    } catch (error) {
        //throw error
        console.error (
            "Error en registerUserService:",
            error
        )

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
}

export {
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService,
    registerUserService
}