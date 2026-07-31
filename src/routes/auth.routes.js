import express from "express"
import { login } from "../controllers/auth.controllers.js"
import { bruteForceMiddleware } from "../middlewares/bruteForce.middlewares.js"

const router = express.Router()

//router.post("/login",login)
router.post("/login", bruteForceMiddleware, login)

export default router
