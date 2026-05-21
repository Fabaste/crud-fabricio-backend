import bcrypt from "bcryptjs"
import User from '../models/user.model.js'
import Audit from '../models/audit.model.js'

const getUsersService = async () => {
    try {
        console.log('SERVICE -> getUsersService')
        const users = await User.find().select('-password')
        return users
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
            data.password, 10
        )

        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            edad: data.edad,
            sexo: data.sexo,
            telefono: data.telefono,
            direccion: data.direccion

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
            direccion: user.direccion

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

        return {
            id,
            ...data
        }
    } catch (error) {
        throw error
    }
}

const deleteUserService = async (id) => {
    try {
        console.log('SERVICE -> deleteUserService')
        console.log(id)

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