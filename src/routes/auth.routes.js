import express from "express"
import { login } from "../controllers/auth.controllers.js"

const router = express.router()

router.post(
    "/login",
    login,
)

export default router
