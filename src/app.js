import express from 'express'
import './config/env.js'
import connectDB from './config/db.js'
import corsConfig from "./config/cors.js"
//import { env } from './config/env.js'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import { rateLimiter } from './middlewares/rateLimit.middlewares.js'
import registerRoutes from './routes/register.routes.js'

const app = express()

app.set("trust proxy", 1)
app.use(corsConfig)
app.use(express.json())
app.use(rateLimiter)
connectDB()

app.use(userRoutes)
app.use("/auth",authRoutes)
app.use(registerRoutes)

app.listen(process.env.Port, () => (
    console.log(`Servidor corriendo en puerto ${process.env.Port}`)
   // console.log('Servidor corriendo en puerto' , process.env.Port)
))