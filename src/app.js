import express from 'express'
import './config/env.js'
import connectDB from './config/db.js'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'

const app = express()

app.use(express.json())
connectDB()

app.use(userRoutes)

app.listen(process.env.Port, () => (
    //console.log('Servidor corriendo en puerto ${process.env.Port}')
    console.log('Servidor corriendo en puerto', process.env.Port)
))