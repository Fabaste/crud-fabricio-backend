import { Resend } from 'resend';
import bcrypt from "bcryptjs"
import User from '../models/user.model.js'
import Audit from '../models/audit.model.js'
import mongoose from "mongoose"
import { env } from '../config/env.js';
import { logger } from '../logs/logger.js';

const resend = new Resend(env.RESEND_API_KEY);

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

const createUserService = async (data, { requesterRole, requesterName, requesterApellido, requesterId }) => {
    
    const currentUserName = requesterName?.toString()
    const currentUserApellido= requesterApellido?.toString()
    const currentUserId = requesterId?.toString()
    let session

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

        session = await mongoose.startSession()

        await session.withTransaction(async () => {
            await user.save({ session })

            await Audit.create([
                {
                    action: 'CREATE',
                    author: {
                        id: currentUserId || null,
                        nombre: currentUserName || null,
                        apellido: currentUserApellido || null,
                        role: role || null,
                    },
                    affectedUser: user.toObject(),
                    changes: {
                        created: true,
                        fields: ['nombre', 'apellido', 'email', 'role']
                    }
                }
            ], { session })
        })
        
        // 6. Enviar el correo usando Resend
        await resend.emails.send({
            from: 'TuApp <onboarding@resend.dev>', // Usa tu dominio verificado en producción
            //to: [datosUsuario.email],
            to: "frssartor@gmail.com",
            subject: 'Bienvenido/a',
            html: `<p><strong>¡¡¡BIENVENIDO/A!!! ${user.nombre} ${user.apellido}</strong><br>Tu registración se confirmo con éxito</p>
                <p>El usuario ${currentUserName} ${currentUserApellido} te ha dado de alta en el sistema.</p>
                <p>Ahora ponte a trabajar.</p>`,
        });

        logger.info('Usuario creado', {
            authorId: currentUserId || null,
            affectedUserId: user._id.toString(),
            action: 'CREATE'
        })

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
        logger.error('Error al crear usuario', {
            error: error.message,
            stack: error.stack,
            authorId: currentUserId || null
        })

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    } finally {
        if (session) {
            await session.endSession()
        }
    }
}

const updateUserService = async (id,data,{requesterRole, requesterId}) => {

    let session

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

      const changes = {}

      allowedFields.forEach((field) => {
        if (data[field] !== undefined){
            if (user[field] !== data[field]) {
                changes[field] = {
                    before: user[field],
                    after: data[field]
                }
                user[field] = data[field]
            }
        }
      })
        // Cambiar password si viene
        if (data.password !== undefined) {
            changes.password = {
                before: '[protected]',
                after: '[protected]'
            }
            user.password = await bcrypt.hash(
                data.password,
                10
            )
        }

        session = await mongoose.startSession()

        await session.withTransaction(async () => {
            await user.save({ session })

            if (Object.keys(changes).length > 0) {
                await Audit.create([
                    {
                        action: 'UPDATE',
                        author: {
                            id: currentUserId || null,
                            role: role || null,
                        },
                        affectedUser: user.toObject(),
                        changes,
                    }
                ], { session })
            }
        })

        logger.info('Usuario actualizado', {
            authorId: currentUserId || null,
            affectedUserId: user._id.toString(),
            action: 'UPDATE',
            changes
        })
    
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
        logger.error('Error al actualizar usuario', {
            error: error.message,
            userId: id,
            authorId: currentUserId || null
        })

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    } finally {
        if (session) {
            await session.endSession()
        }
    }
}

const deleteUserService = async (id) => {

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

            await Audit.create (
                [
                    {
                        action: 'DELETE',
                        author: null,
                        affectedUser: user.toObject(),
                        changes: {
                            deleted: true
                        },
                    },
                ],
                {session}
            )

            //await User.findByIdAndDelete(id)
            await user.deleteOne({ session })
        })

        logger.warn('Usuario eliminado', {
            affectedUserId: id,
            action: 'DELETE'
        })

        return {
            message: 'Usuario eliminado',
        }



    } catch (error) {
        logger.error('Error al eliminar usuario', {
            error: error.message,
            userId: id
        })
        
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