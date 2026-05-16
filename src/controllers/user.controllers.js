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
        const user = await createUserService(req.body)
        res.json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }    
}

const updateUser = async (req,res) => {
    try {
        console.log('CONTROLLER -> updateUser')
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
