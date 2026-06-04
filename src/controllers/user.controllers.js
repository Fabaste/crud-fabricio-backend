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

const getUsers = async (req,res) => {
    try{
        console.log('CONTROLLER -> getUsers')
        const users = await getUsersService()
        res.json(users)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
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
                message: 'Id invalido'
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
        res.json(result)
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
