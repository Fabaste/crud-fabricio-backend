import express from "express"
import { login, verificar2FA  } from "../controllers/auth.controllers.js"
import { checkBruteForce  } from "../middlewares/bruteForce.middlewares.js"
//import { verificar2FA } from "../controllers/auth.controllers.js"

const router = express.Router()

//router.post("/login",login)
router.post("/login", checkBruteForce, login)

router.post('/verificar-2fa', checkBruteForce, verificar2FA)

export default router
