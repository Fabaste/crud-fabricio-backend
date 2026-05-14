import dotenv from 'dotenv'
dotenv.config()

console.log('Variables de entorno cargadas')
console.log(process.env.MONGO_URI)
console.log(process.env.PORT)

export const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI
}