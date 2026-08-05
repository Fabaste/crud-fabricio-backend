import express from "express"
import { login, verificar2FA  } from "../controllers/auth.controllers.js"
import { bruteForceMiddleware } from "../middlewares/bruteForce.middlewares.js"
//import { verificar2FA } from "../controllers/auth.controllers.js"

const router = express.Router()

//router.post("/login",login)
router.post("/login", bruteForceMiddleware, login)

router.post('/verificar-2fa', bruteForceMiddleware, verificar2FA)

export default router
