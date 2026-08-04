import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { env } from '../config/env.js';

import mongoose, { mongo } from "mongoose"
import User from '../models/user.model.js'

const resend = new Resend(env.RESEND_API_KEY);

// Base de datos temporal en memoria (Expira automáticamente)
const registrosTemporales = new Map();

export const crearRegistroTemporal = async (datosUsuario) => {
  // 1. Generar código de 6 dígitos en el Backend
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Generar un token único para identificar esta transacción en el Front
  //const tokenTemporal = crypto.randomUUID();
  const secretKey = "tu_clave_secreta";

  const tokenTemporal = jwt.sign(
    { nonce: Date.now() }, // Usa los milisegundos actuales para hacerlo único
    secretKey, 
    { expiresIn: '5m' }    // Expira en 5 minutos
  )
  // 3. Definir tiempo de expiración (Ej: 5 minutos desde ahora)
  const expiraEn = Date.now() + 5 * 60 * 1000;

  // 4. Guardar temporalmente los datos del usuario + código + expiración
  registrosTemporales.set(tokenTemporal, {
    ...datosUsuario,
    codigo,
    expiraEn
  });

  // 5. Configurar auto-eliminación si expira el tiempo (Elimina del registro temporal)
  setTimeout(() => {
    if (registrosTemporales.has(tokenTemporal)) {
      console.log(`Registro temporal ${tokenTemporal} eliminado por expiración de tiempo.`);
      registrosTemporales.delete(tokenTemporal);
    }
  }, 5 * 60 * 1000);

  // 6. Enviar el correo usando Resend
  await resend.emails.send({
    from: 'TuApp <onboarding@resend.dev>', // Usa tu dominio verificado en producción
    //to: [datosUsuario.email],
    to: "frssartor@gmail.com",
    subject: 'Tu código de verificación',
    html: `<p>Hola, tu código de confirmación es: <strong style="font-size: 20px;">${codigo}</strong></p>
           <p>Este código expira en 5 minutos.</p>`,
  });

  return { tokenTemporal };
};

export const confirmarRegistroDefinitivo = async (tokenTemporal, codigoIngresado) => {
  try{
    const registro = registrosTemporales.get(tokenTemporal);
    
    // Validación A: ¿Existe el registro o ya fue borrado por expiración?
    if (!registro) {
      const error = new Error('El código ha expirado o la sesión de registro no existe.');
      error.statusCode = 404;
      throw error;
    }

    // Validación B: ¿Ya pasaron los 5 minutos? (Doble verificación de seguridad)
    if (Date.now() > registro.expiraEn) {
      registrosTemporales.delete(tokenTemporal); // Forzar borrado
      const error = new Error('El código ha expirado. Vuelve a registrarte.');
      error.statusCode = 400;
      throw error;
    }

    // Validación C: ¿El código coincide?
    if (registro.codigo !== codigoIngresado) {
      const error = new Error('El código ingresado es incorrecto.');
      error.statusCode = 400;
      throw error;
    }
    // --- PASO FINAL ---
    // Aquí es donde extraes los datos limpios y los insertas en tu Base de Datos Real
    //const { email, direccion, pais, provincia, localidad } = registro;
    const datosUsuario = registro;

    /*const nuevoUsuarioDefinitivo = {
      id: Math.floor(Math.random() * 1000), // Simulación de ID de Base de Datos
      ...datosUsuario,
      activo: true
    };*/
    const nuevoUsuarioDefinitivo = new User(datosUsuario);



    // Guardar en tu DB real aquí (Ej: await Usuario.create(nuevoUsuarioDefinitivo))
    
    await nuevoUsuarioDefinitivo.save()

    // Limpiamos la tabla temporal inmediatamente para liberar memoria/espacio
    registrosTemporales.delete(tokenTemporal);

    //return nuevoUsuarioDefinitivo;
    return{
      success: true,
      message: "Usuario registrado con éxito",
      data: nuevoUsuarioDefinitivo
    };
  } catch (error) {
    console.error(
        "Error en getUsersService:",error
    )
    throw {
        statuscode: error.statusCode || 500,
        message: error.message || "Error interno del servidor",
        errors: error.errors || null,
    }
  }
};