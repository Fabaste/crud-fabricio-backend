import { RateLimiterMemory } from 'rate-limiter-flexible';
import { errorResponse } from '../helpers/response.helpers.js';
import SecurityLog from '../models/securityLog.model.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const loginWindowMinutes = Number(env.LOGIN_WINDOW_MINUTES || 15);
const loginMaxAttempts = Number(env.LOGIN_MAX_ATTEMPTS || 5);
const loginBlockMinutes = Number(env.LOGIN_BLOCK_MINUTES || 5);

// El limitador se mantiene en memoria
const bruteForceLimiter = new RateLimiterMemory({
  points: loginMaxAttempts,
  duration: loginWindowMinutes * 60,
  blockDuration: loginBlockMinutes * 60,
});

// Función auxiliar para generar la clave (Key) de forma dinámica
const getBruteForceKey = (req) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  let email = 'unknown';

  // Caso 1: Ruta de login tradicional
  if (req.body?.email) {
    email = req.body.email;
  } 
  // Caso 2: Ruta de verificación 2FA (Leemos el email desde el token temporal si existe)
  else if (req.body?.tokenTemporal) {
    try {
      const decoded = jwt.verify(req.body.tokenTemporal, env.JWT_SECRET);
      if (decoded?.userEmail) { // Modificaremos el token para que guarde el email
        email = decoded.userEmail;
      }
    } catch (err) {
      // Si el token expiró o es inválido, dejamos 'unknown'
    }
  }

  return { key: `${ip}:${email}`, ip };
};

// Middleware de verificación PREVIA (Solo revisa si YA está bloqueado)
const checkBruteForce = async (req, res, next) => {
  const { key, ip } = getBruteForceKey(req);
  
  try {
    const resRes = await bruteForceLimiter.get(key);
    
    // Si ya consumió todos los puntos y está en tiempo de bloqueo
    if (resRes && resRes.remainingPoints <= 0) {
      const remainingTime = Math.round(resRes.msBeforeNext / 1000);
      
      await SecurityLog.create({
        eventType: 'brute_force_blocked',
        ip,
        method: req.method,
        path: req.originalUrl,
        userAgent: req.get('user-agent') || '',
        userEmail: req.body?.email || '',
        details: { reason: 'Blocked due to too many attempts', remainingTime },
      });

      return errorResponse(res, `Demasiados intentos. Intente nuevamente en ${remainingTime} segundos.`, 429, null);
    }
    
    next();
  } catch (error) {
    next();
  }
};

export { bruteForceLimiter, checkBruteForce, getBruteForceKey };