import cors from "cors"
import { env } from "./env.js"

const allowedOrigins = env.FRONTEND_URLS.split(",").map((origin)=> origin.trim())
const corsConfig = cors({
    origin: (origin, callback) => {
        if(!origin) {
            return callback(null, true)
        }
        if (allowedOrigins.includes(origin)){
            return callback(null, true)
        }
        return callback(new Error("Origen no permitido por CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
})

export default corsConfig