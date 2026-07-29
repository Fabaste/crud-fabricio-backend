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
    forbiddenResponse
} from "../helpers/response.helpers.js"

const getUsers = async (req,res) => {
    try{
        //console.log('CONTROLLER -> getUsers')

        const { email,id } = req.query

        const users = await getUsersService({
            email,
            id,
            requesterRole: req.user?.role,
            requesterId: req.user?.userId,
        })
        //res.json(users)
        return successResponse(
            res,
            users,
            "Usuarios obtenidos correctamente"
        )
    } catch (error) {
        //res.status(500).json({
        if (error.statusCode ===403){
            return forbiddenResponse(res, error.message || "Acceso denegado", error.errors || null)
        }
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
        //console.log('CONTROLLER -> createUser')

        // VALIDAR DTO
        const {error} = createUserSchema.validate(req.body)

        if (error){
            /*return res.status(400).json({
                error: error.details[0].message
            })   */     
           return successResponse(res, "Error de validación", 400, error.details)
        }

        //const user = await createUserService(req.body)
        
        //const role = req.body.role

        const user = await createUserService(req.body,{
            requesterRole: req.user?.role,
        })

        //res.status(201).json(user)
        return successResponse(res, user, "Usuario creado correctamente", 201)
    } catch (error) {
        /*res.status(500).json({
            error: error.message
        })*/
       return errorResponse(res, error.message || "Error interno del servidor", error.statusCode || 500, error.errors || null)
    }    
}

const updateUser = async (req,res) => {
    try {
        console.log('CONTROLLER -> updateUser')
        // VALIDAR DTO
        const {error: paramsError} = userParamsSchema.validate(req.params)
        //console.log(" ~ updateUser ~ error:", paramsError)

        if (paramsError){
            /*return res.status(400).json({
                //message: 'Id invalido',
                error: paramsError.details[0].message
            })*/
           return errorResponse(res, "Id inválido", 400, paramsError.details)
        }

        const {error} = updateUserSchema.validate(req.body)

        if (error){
            /*return res.status(400).json({
                error: error.details[0].message
            })*/
           return errorResponse(res, "Error de validación", 400, error.details)        
        }

        const user = await updateUserService(
            req.params.id,
            req.body,
            {requesterRole: req.user?.role,
             requesterId: req.user?.userId
        })

        //res.json(user)
        return successResponse(res, user, "Usuario actualizado correctamente")
    } catch (error) {
        /*res.status(500).json({
            error: error.message
        })*/
       return errorResponse(res, error.message || "Error interno del servidor", error.statusCode || 500, error.errors || null)
    }
}

const deleteUser = async (req,res) => {
    try {
        //console.log('CONTROLLER -> deleteUser')

        const {error: paramsError} = userParamsSchema.validate(req.params)
        //console.log(" ~ updateUser ~ error:", paramsError)

        if (paramsError){
            /*return res.status(400).json({
                message: 'Id invalido'
            })*/
           return errorResponse(res, "Id inválido",400, paramsError.details)
        }
        
        const result = await deleteUserService(
            req.params.id
        )
        //res.json(result)
        return successResponse(
            res,
            result,
            "Usuario eliminado correctamente"
        )
        
    } catch (error) {
        /*res.status(500).json({
            error: error.message
        })*/
       return errorResponse(res, error.message || "Error interno del servidor", error.statusCode || 500, error.errors || null)
    }
}

export {
    getUsers,
    createUser,
    updateUser,
    deleteUser
}
