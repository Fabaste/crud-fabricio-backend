import { Router } from 'express';
import { iniciarRegistro, verificarCodigo } from '../controllers/register.controllers.js';

const router = Router();

// Paso 1: Recibe datos del formulario, genera código, guarda temporal y envía correo
router.post('/registro/iniciar', iniciarRegistro);

// Paso 2: Recibe el código, lo valida, y pasa el usuario a la lista definitiva
router.post('/registro/verificar', verificarCodigo);

export default router;