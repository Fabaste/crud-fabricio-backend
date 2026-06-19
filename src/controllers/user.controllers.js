import {
    createUserSchema,
    updateUserSchema,
    userParamsSchema
} from '../dto/user.dto.js'

import {
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService
} from '../services/user.service.js'

import {
    successResponse,
    errorResponse,
} from "../helpers/response.helpers.js"

const getUsers = async (req,res) => {
    try{
        console.log('CONTROLLER -> getUsers')

        const { email,id} = req.query

        const users = await getUsersService({
            email,
            id,
        })
        //res.json(users)
        return successResponse(
            res,
            users,
            "Usuarios obtenidos correctamente"
        )
    } catch (error) {
        //res.status(500).json({
        return errorResponse(
            res,
            error.message || "Error interno del servidor",
            error.statusCode || 500,
            error.errors || null
        )
    }
}

const createUser = async (req,res) => {
    try {
        console.log('CONTROLLER -> createUser')

        // VALIDAR DTO
        const {error} = createUserSchema.validate(req.body)

        if (error){
            return res.status(400).json({
                error: error.details[0].message
            })        
        }

        const user = await createUserService(req.body)
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }    
}

const updateUser = async (req,res) => {
    try {
        console.log('CONTROLLER -> updateUser')
        // VALIDAR DTO
        const {error: paramsError} = userParamsSchema.validate(req.params)
        console.log(" ~ updateUser ~ error:", paramsError)

        if (paramsError){
            return res.status(400).json({
                //message: 'Id invalido',
                error: paramsError.details[0].message
            })
        }

        const {error} = updateUserSchema.validate(req.body)

        if (error){
            return res.status(400).json({
                error: error.details[0].message
            })        
        }

        const user = await updateUserService(
            req.params.id,
            req.body
        )
        res.json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

const deleteUser = async (req,res) => {
    try {
        console.log('CONTROLLER -> deleteUser')

        const {error: paramsError} = userParamsSchema.validate(req.params)
        console.log(" ~ updateUser ~ error:", paramsError)

        if (paramsError){
            return res.status(400).json({
                message: 'Id invalido'
            })
        }
        
        const result = await deleteUserService(
            req.params.id
        )
        //res.json(result)
        return successResponse(
            res,
            result,
            "Usuario no encontrado"
        )
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export {
    getUsers,
    createUser,
    updateUser,
    deleteUser
}
