import express from 'express'
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controllers.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/role.middleware.js'

const router = express.Router()

/*
router.get('/users', getUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
*/

router.get('/users', 
    authMiddleware, authorizeRoles(
    'ROOT',
    'ADMIN',
    "USER"
), getUsers)

router.post('/users', 
    authMiddleware, authorizeRoles(
    'ROOT',
    'ADMIN'
), createUser)

router.put('/users/:id', 
    authMiddleware, authorizeRoles(
    'ROOT',
    'ADMIN',
),updateUser)

router.delete('/users/:id', 
    authMiddleware, authorizeRoles(
    'ROOT',
    'ADMIN',
),deleteUser)

export default router