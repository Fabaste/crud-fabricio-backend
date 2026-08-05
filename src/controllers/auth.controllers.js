import { successResponse, errorResponse } from '../helpers/response.helpers.js';
import { loginService, verificar2FAService } from '../services/auth.service.js';
import { bruteForceLimiter, getBruteForceKey } from '../middlewares/bruteForce.middlewares.js'; // <-- Importamos las utilidades

const login = async (req, res) => {
  const { key } = getBruteForceKey(req);
  try {
    if (!req.body.email || !req.body.password) {
      throw { statusCode: 400, message: 'El email y la contraseña son requeridos.' };
    }
    
    const response = await loginService(req.body);
    
    // Si el login es exitoso, opcionalmente puedes reiniciar los intentos del usuario
    await bruteForceLimiter.delete(key);

    successResponse(res, response, 'Paso de autenticación procesado');
  } catch (error) {
    // PENALIZACIÓN: Si la contraseña es incorrecta (401), consumimos un punto
    if (error.statusCode === 401) {
      try {
        await bruteForceLimiter.consume(key);
      } catch (rejRes) {
        // Si al consumir se superan los puntos, cambiamos el error a 429
        const remainingTime = Math.round(rejRes.msBeforeNext / 1000);
        error.statusCode = 429;
        error.message = `Demasiados intentos. Intente nuevamente en ${remainingTime} segundos.`;
      }
    }
    errorResponse(res, error.message, error.statusCode);
  }
};

const verificar2FA = async (req, res) => {
  const { key } = getBruteForceKey(req);
  try {
    const { tokenTemporal, codigo } = req.body;

    if (!tokenTemporal || !codigo) {
      throw { statusCode: 400, message: 'El token temporal y el código de verificación son requeridos.' };
    }

    const codigoSanitizado = String(codigo).trim();
    if (codigoSanitizado.length !== 6 || isNaN(codigoSanitizado)) {
      throw { statusCode: 400, message: 'El código debe ser una secuencia numérica de 6 dígitos.' };
    }

    const response = await verificar2FAService(tokenTemporal, codigoSanitizado);
    
    // Limpiamos los intentos fallidos si el token 2FA fue correcto
    await bruteForceLimiter.delete(key);

    successResponse(res, response, 'Login exitoso. Doble factor validado.');
  } catch (error) {
    // PENALIZACIÓN: Si el código OTP es incorrecto (400), consumimos un punto
    if (error.statusCode === 400 && error.message.includes('incorrecto')) {
      try {
        await bruteForceLimiter.consume(key);
      } catch (rejRes) {
        const remainingTime = Math.round(rejRes.msBeforeNext / 1000);
        error.statusCode = 429;
        error.message = `Demasiados intentos. Intente nuevamente en ${remainingTime} segundos.`;
      }
    }
    errorResponse(res, error.message, error.statusCode);
  }
};

export { login, verificar2FA };


//##############################################
//CODIGO ANTES DE VERIFICACION DE DOBLE FACTOR
//##############################################

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