import { sendEmail } from '../services/resend.service.js';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que el usuario no exista y crear el usuario en tu BD...

    // 2. Generar un código aleatorio de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Guardar el código en la BD asociado al usuario (con tiempo de expiración)...

    // 4. Enviar el correo de forma asíncrona usando el servicio
    await sendEmail(email, verificationCode);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado. Por favor revisa tu correo para verificar la cuenta.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};