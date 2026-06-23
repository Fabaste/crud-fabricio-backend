import { successResponse, errorResponse } from "../helpers/response.helpers.js";
import { loginService } from "../services/auth.service.js"

const login = async (req,res,) => {
    try {
        const response = await loginService(req.body)

        successResponse(res, response, "Login exitoso",)
    } catch (error) {
        errorResponse (res, error.message, error.statusCode)
    }
}
    
export { login }