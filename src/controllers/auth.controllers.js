import { successResponse, errorResponse } from "../helpers/response.helpers.js";
import { loginService, verificar2FAService } from "../services/auth.service.js"

const login = async (req, res) => {
    try {
        // Validación básica antes de procesar el login
        if (!req.body.email || !req.body.password) {
            throw { statusCode: 400, message: "El email y la contraseña son requeridos." };
        }
        const response = await loginService(req.body)
        successResponse(res, response, "Paso de autenticación procesado")
    } catch (error) {
        errorResponse(res, error.message, error.statusCode)
    }
}

// NUEVO CONTROLADOR: Vinculado a la ruta POST /api/auth/verificar-2fa
const verificar2FA = async (req, res) => {
    try {
        const { tokenTemporal, codigo } = req.body;

        // 1. CONTROL DE SEGURIDAD: Evita pasar datos nulos al servicio
        if (!tokenTemporal || !codigo) {
            throw { statusCode: 400, message: "El token temporal y el código de verificación son requeridos." };
        }
        // 2. SANITIZACIÓN: Aseguramos que el código sea un string limpio (sin espacios) de 6 dígitos
        const codigoSanitizado = String(codigo).trim();
        if (codigoSanitizado.length !== 6 || isNaN(codigoSanitizado)) {
            throw { statusCode: 400, message: "El código debe ser una secuencia numérica de 6 dígitos." };
        }

        // 3. LLAMADO AL SERVICIO: Enviamos el código sanitizado
        const response = await verificar2FAService(tokenTemporal, codigoSanitizado);
        successResponse(res, response, "Login exitoso. Doble factor validado.")
    } catch (error) {
        errorResponse(res, error.message, error.statusCode)
    }
}
    
export { login, verificar2FA }






/*import { successResponse, errorResponse } from "../helpers/response.helpers.js";
import { loginService } from "../services/auth.service.js"

const login = async (req,res,) => {
    try {
        const response = await loginService(req.body)
        successResponse(res, response, "Login exitoso",)
    } catch (error) {
        errorResponse (res, error.message, error.statusCode)
    }
}
    
export { login }*/